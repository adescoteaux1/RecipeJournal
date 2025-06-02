// debugParser.js - Enhanced debugging script
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const recipeParser = require('./src/services/recipeParser');

async function debugUrl(url) {
  console.log('\n' + '='.repeat(80));
  console.log(`DEBUGGING: ${url}`);
  console.log('='.repeat(80));

  try {
    // First, let's see what the parser returns
    console.log('\n1. Running parser...');
    const result = await recipeParser.parseFromUrl(url);
    
    console.log('\nParser Result Summary:');
    console.log(`- Title: ${result.title || 'NOT FOUND'}`);
    console.log(`- Description: ${result.description ? result.description.substring(0, 50) + '...' : 'NOT FOUND'}`);
    console.log(`- Ingredients: ${result.ingredients.length} found`);
    console.log(`- Instructions: ${result.instructions.length} found`);
    console.log(`- Image: ${result.header_image_url ? 'Found' : 'NOT FOUND'}`);
    console.log(`- Prep Time: ${result.prep_time || 'NOT FOUND'}`);
    console.log(`- Cook Time: ${result.cook_time || 'NOT FOUND'}`);
    console.log(`- Servings: ${result.servings || 'NOT FOUND'}`);

    // Now let's do a deep dive to see what's actually on the page
    console.log('\n2. Fetching page for analysis...');
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    // Check for JSON-LD
    console.log('\n3. Looking for JSON-LD structured data...');
    const jsonLdScripts = $('script[type="application/ld+json"]');
    console.log(`Found ${jsonLdScripts.length} JSON-LD script(s)`);

    jsonLdScripts.each((i, elem) => {
      try {
        const data = JSON.parse($(elem).html());
        console.log(`\nJSON-LD Script ${i + 1}:`);
        
        // Check if it contains Recipe
        const hasRecipe = JSON.stringify(data).includes('"Recipe"');
        console.log(`Contains Recipe: ${hasRecipe}`);
        
        if (hasRecipe) {
          // Save the JSON-LD for inspection
          fs.writeFileSync(`jsonld-${i}.json`, JSON.stringify(data, null, 2));
          console.log(`Saved to jsonld-${i}.json`);
          
          // Show structure
          console.log('Structure:', Object.keys(data));
          if (data['@graph']) {
            console.log('@graph types:', data['@graph'].map(item => item['@type']));
          }
        }
      } catch (e) {
        console.log(`Error parsing JSON-LD ${i + 1}: ${e.message}`);
      }
    });

    // Look for common recipe elements
    console.log('\n4. Looking for recipe elements in HTML...');
    
    const searches = {
      'h1 tags': 'h1',
      'Recipe title candidates': 'h1, .recipe-name, .recipe-title, [itemprop="name"]',
      'Ingredient sections': '.ingredients, .recipe-ingredients, [class*="ingredient"]',
      'Instruction sections': '.instructions, .recipe-instructions, .directions, [class*="instruction"], [class*="direction"]',
      'Time elements': '[class*="time"], [class*="prep"], [class*="cook"]',
      'Yield/Servings': '[class*="yield"], [class*="serving"], [itemprop="recipeYield"]'
    };

    for (const [name, selector] of Object.entries(searches)) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`\n${name}: ${elements.length} found`);
        if (elements.length <= 3) {
          elements.each((i, el) => {
            const text = $(el).text().trim().substring(0, 100);
            console.log(`  ${i + 1}: "${text}${text.length === 100 ? '...' : ''}"`);
          });
        }
      }
    }

    // Save full HTML for manual inspection
    const domain = new URL(url).hostname.replace('www.', '');
    const htmlFile = `debug-${domain}.html`;
    fs.writeFileSync(htmlFile, response.data);
    console.log(`\n5. Full HTML saved to ${htmlFile}`);

    // Show what selectors might work for this site
    console.log('\n6. Suggested selectors for this site:');
    suggestSelectors($, domain);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

function suggestSelectors($, domain) {
  const suggestions = {
    ingredients: [],
    instructions: []
  };

  // Look for ingredients patterns
  const ingredientPatterns = [
    '[class*="ingredient"]:not([class*="instructions"])',
    'li:contains("cup"):contains("tablespoon")',
    'ul li:contains("teaspoon")',
    '[itemprop="recipeIngredient"]'
  ];

  for (const pattern of ingredientPatterns) {
    try {
      const elements = $(pattern);
      if (elements.length >= 3 && elements.length <= 50) {
        suggestions.ingredients.push({
          selector: pattern,
          count: elements.length,
          sample: elements.first().text().trim().substring(0, 50)
        });
      }
    } catch (e) {}
  }

  // Look for instructions patterns
  const instructionPatterns = [
    '[class*="instruction"]:not([class*="ingredient"])',
    '[class*="direction"]:not([class*="ingredient"])',
    'ol li:contains("heat"):contains("cook")',
    '[itemprop="recipeInstructions"]'
  ];

  for (const pattern of instructionPatterns) {
    try {
      const elements = $(pattern);
      if (elements.length >= 2 && elements.length <= 50) {
        suggestions.instructions.push({
          selector: pattern,
          count: elements.length,
          sample: elements.first().text().trim().substring(0, 50)
        });
      }
    } catch (e) {}
  }

  if (suggestions.ingredients.length > 0) {
    console.log('\nPossible ingredient selectors:');
    suggestions.ingredients.forEach(s => {
      console.log(`  "${s.selector}" - ${s.count} items (sample: "${s.sample}")`);
    });
  }

  if (suggestions.instructions.length > 0) {
    console.log('\nPossible instruction selectors:');
    suggestions.instructions.forEach(s => {
      console.log(`  "${s.selector}" - ${s.count} items (sample: "${s.sample}")`);
    });
  }

  // Generate config suggestion
  if (suggestions.ingredients.length > 0 || suggestions.instructions.length > 0) {
    console.log(`\nSuggested config for '${domain}':`);
    console.log(`'${domain}': {`);
    console.log(`  selectors: {`);
    console.log(`    title: 'h1',`);
    console.log(`    description: '.recipe-summary',`);
    if (suggestions.ingredients.length > 0) {
      console.log(`    ingredients: '${suggestions.ingredients[0].selector}',`);
    }
    if (suggestions.instructions.length > 0) {
      console.log(`    instructions: '${suggestions.instructions[0].selector}',`);
    }
    console.log(`    image: 'meta[property="og:image"]',`);
    console.log(`    prepTime: '[class*="prep-time"]',`);
    console.log(`    cookTime: '[class*="cook-time"]',`);
    console.log(`    servings: '[class*="yield"]'`);
    console.log(`  }`);
    console.log(`},`);
  }
}

// Test multiple URLs
async function testAll() {
  const testUrls = [
    'https://www.allrecipes.com/recipe/20144/banana-banana-bread/',
    'https://www.foodnetwork.com/recipes/food-network-kitchen/strawberry-banana-smoothie-9429009',
    'https://www.seriouseats.com/best-easy-apple-crisp-crumble-recipe',
    'https://www.simplyrecipes.com/peach-and-raspberry-pandowdy-recipe-8656281'
  ];

  for (const url of testUrls) {
    await debugUrl(url);
    console.log('\n' + '='.repeat(80) + '\n');
  }
}

// Run with specific URL or test all
const specificUrl = process.argv[2];
if (specificUrl) {
  debugUrl(specificUrl);
} else {
  testAll();
}