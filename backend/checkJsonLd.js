// checkJsonLd.js - Quick script to see what JSON-LD data a recipe site returns
const axios = require('axios');
const cheerio = require('cheerio');

async function checkJsonLd(url) {
  console.log(`\nChecking JSON-LD for: ${url}\n`);
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const scripts = $('script[type="application/ld+json"]');
    
    console.log(`Found ${scripts.length} JSON-LD script(s)\n`);
    
    scripts.each((i, elem) => {
      try {
        const data = JSON.parse($(elem).html());
        
        // Find Recipe
        let recipe = null;
        if (data['@type'] === 'Recipe') {
          recipe = data;
        } else if (data['@graph']) {
          recipe = data['@graph'].find(item => item['@type'] === 'Recipe');
        }
        
        if (recipe) {
          console.log('🍳 RECIPE FOUND!');
          console.log('-'.repeat(40));
          
          // Check the problematic fields
          console.log('Key fields that might cause issues:');
          console.log(`\nrecipeYield:`);
          console.log(`  Type: ${typeof recipe.recipeYield}`);
          console.log(`  Value: ${JSON.stringify(recipe.recipeYield)}`);
          console.log(`  Is Array: ${Array.isArray(recipe.recipeYield)}`);
          
          console.log(`\nprepTime:`);
          console.log(`  Type: ${typeof recipe.prepTime}`);
          console.log(`  Value: ${JSON.stringify(recipe.prepTime)}`);
          
          console.log(`\ncookTime:`);
          console.log(`  Type: ${typeof recipe.cookTime}`);
          console.log(`  Value: ${JSON.stringify(recipe.cookTime)}`);
          
          console.log(`\ndescription:`);
          console.log(`  Type: ${typeof recipe.description}`);
          console.log(`  Value: ${recipe.description ? 'Present' : 'Missing'}`);
          
          console.log(`\nrecipeInstructions:`);
          console.log(`  Type: ${typeof recipe.recipeInstructions}`);
          console.log(`  Is Array: ${Array.isArray(recipe.recipeInstructions)}`);
          console.log(`  Length: ${Array.isArray(recipe.recipeInstructions) ? recipe.recipeInstructions.length : 'N/A'}`);
          if (recipe.recipeInstructions && recipe.recipeInstructions[0]) {
            console.log(`  First instruction type: ${typeof recipe.recipeInstructions[0]}`);
            if (typeof recipe.recipeInstructions[0] === 'object') {
              console.log(`  First instruction keys: ${Object.keys(recipe.recipeInstructions[0]).join(', ')}`);
            }
          }
        }
      } catch (e) {
        console.log(`Error parsing JSON-LD ${i + 1}: ${e.message}`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test with problem URLs
const urls = [
  'https://www.allrecipes.com/recipe/20144/banana-banana-bread/',
  'https://www.foodnetwork.com/recipes/food-network-kitchen/strawberry-banana-smoothie-9429009'
];

console.log('Checking JSON-LD structure for problematic recipe sites...');
console.log('This will help identify why parsing fails.\n');

urls.forEach(url => checkJsonLd(url));