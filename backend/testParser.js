// Create a test file: testParser.js in your backend root
// Run with: node testParser.js

const recipeParser = require('./src/services/recipeParser');

async function testParser() {
  const testUrl = 'https://www.allrecipes.com/recipe/20144/banana-banana-bread'; 
  //'https://www.allrecipes.com/recipe/20144/banana-banana-bread';
  // https://www.bonappetit.com/recipe/double-dark-chocolate-no-churn-ice-cream --works
  // https://www.foodnetwork.com/recipes/food-network-kitchen/strawberry-banana-smoothie-9429009
  // https://www.seriouseats.com/best-easy-apple-crisp-crumble-recipe
  // https://www.bbcgoodfood.com/recipes/quick-pizza-dough-2 --works
  // https://www.simplyrecipes.com/peach-and-raspberry-pandowdy-recipe-8656281
  // https://www.epicurious.com/recipes/food/views/philly-fluff-cake --works

//   const exampleUrls = [
//   'https://www.allrecipes.com/recipe/[recipe-id]/[recipe-name]/',
//   'https://www.foodnetwork.com/recipes/[chef]/[recipe-name]',
//   'https://www.bonappetit.com/recipe/[recipe-name]',
//   'https://www.seriouseats.com/[recipe-name]',
//   'https://www.bbcgoodfood.com/recipes/[recipe-name]',
//   'https://cooking.nytimes.com/recipes/[recipe-id]',
//   'https://www.simplyrecipes.com/recipes/[recipe-name]/',
//   'https://www.epicurious.com/recipes/food/views/[recipe-name]'
// ];

  try {
    console.log('Testing parser with URL:', testUrl);
    const result = await recipeParser.parseFromUrl(testUrl);
    
    console.log('\n=== PARSED RECIPE ===');
    console.log('Title:', result.title);
    console.log('Description:', result.description?.substring(0, 100) + '...');
    console.log('Ingredients count:', result.ingredients.length);
    console.log('Instructions count:', result.instructions.length);
    console.log('Prep time:', result.prep_time);
    console.log('Cook time:', result.cook_time);
    console.log('Servings:', result.servings);
    console.log('Image URL:', result.header_image_url);
    
    if (result.ingredients.length > 0) {
      console.log('\nFirst ingredient:', result.ingredients[0]);
    }
    
    if (result.instructions.length > 0) {
      console.log('\nFirst instruction:', result.instructions[0].text.substring(0, 100) + '...');
    }
    
    // Save to file for inspection
    const fs = require('fs');
    fs.writeFileSync('parsed-recipe.json', JSON.stringify(result, null, 2));
    console.log('\nFull result saved to parsed-recipe.json');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

testParser();