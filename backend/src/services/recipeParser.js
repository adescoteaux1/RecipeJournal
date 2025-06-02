// src/services/recipeParser.js
const axios = require('axios');
const cheerio = require('cheerio');

class RecipeParser {
  constructor() {
    // Site-specific configurations
    this.siteConfigs = {
      'allrecipes.com': {
        selectors: {
          title: 'h1.headline',
          description: '.recipe-summary p, .article-subheading',
          ingredients: '.ingredients-section .ingredients-item-name, .mntl-structured-ingredients__list-item',
          instructions: '.instructions-section .section-body p, .mntl-sc-block-group--LI .mntl-sc-block-html',
          image: 'meta[property="og:image"]',
          prepTime: '.recipe-meta-item .recipe-meta-item-header:contains("prep") + .recipe-meta-item-body',
          cookTime: '.recipe-meta-item .recipe-meta-item-header:contains("cook") + .recipe-meta-item-body',
          servings: '.recipe-yield'
        }
      },
      'foodnetwork.com': {
        selectors: {
          title: 'h1.o-AssetTitle__a-Headline, span.o-AssetTitle__a-HeadlineText',
          description: '.o-AssetDescription__a-Description',
          ingredients: '.o-Ingredients__a-Ingredient, .o-Ingredients__a-ListItemText',
          instructions: '.o-Method__m-Body li, .o-Method__m-Step',
          image: 'meta[property="og:image"]',
          prepTime: '.o-RecipeInfo__a-Description:contains("Prep")',
          cookTime: '.o-RecipeInfo__a-Description:contains("Cook")',
          servings: '.o-RecipeInfo__a-Description:contains("Yield")'
        }
      },
      'seriouseats.com': {
        selectors: {
          title: 'h1',
          description: '.recipe-introduction-body',
          ingredients: '.ingredient',
          instructions: '.mntl-sc-block-html',
          image: 'meta[property="og:image"]',
          prepTime: '.prep-time .meta-text__data',
          cookTime: '.cook-time .meta-text__data',
          servings: '.recipe-yield .meta-text__data'
        }
      },
      'simplyrecipes.com': {
        selectors: {
          title: 'h1',
          description: '.recipe-intro',
          ingredients: '.structured-ingredients__list-item',
          instructions: '#mntl-sc-block_2-0 li',
          image: 'meta[property="og:image"]',
          prepTime: '.prep-time .meta-text__data',
          cookTime: '.cook-time .meta-text__data',
          servings: '.recipe-yield .meta-text__data'
        }
      }
    };

    // Default selectors as fallback
    this.defaultSelectors = {
      recipe: 'script[type="application/ld+json"]',
      title: ['h1', '.recipe-name', '.recipe-title', '[itemprop="name"]'],
      description: ['.recipe-summary', '.recipe-description', '[itemprop="description"]'],
      ingredients: ['.recipe-ingredient', '.ingredient', '[itemprop="recipeIngredient"]'],
      instructions: ['.recipe-instruction', '.instruction', '[itemprop="recipeInstructions"]'],
      image: ['meta[property="og:image"]', '.recipe-image img', '[itemprop="image"]'],
      prepTime: ['[itemprop="prepTime"]', '.prep-time'],
      cookTime: ['[itemprop="cookTime"]', '.cook-time'],
      servings: ['[itemprop="recipeYield"]', '.recipe-yield', '.servings']
    };
  }

  async parseFromUrl(url) {
    try {
      console.log(`Parsing recipe from: ${url}`);
      
      // Fetch the webpage
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // First, try to parse JSON-LD structured data
      const jsonLdData = this.parseJsonLd($);
      if (jsonLdData) {
        console.log('Found JSON-LD data');
        try {
          return this.formatRecipeData(jsonLdData, url);
        } catch (formatError) {
          console.error('Error formatting JSON-LD data:', formatError.message);
          console.log('Falling back to manual parsing...');
        }
      }

      console.log('No JSON-LD found, trying manual parsing');
      // Fallback to manual parsing with site-specific selectors
      const domain = new URL(url).hostname.replace('www.', '');
      const siteConfig = this.siteConfigs[domain];
      
      if (siteConfig) {
        console.log(`Using site-specific config for ${domain}`);
        return this.parseWithConfig($, url, siteConfig.selectors);
      } else {
        console.log('Using default selectors');
        return this.parseManually($, url);
      }
    } catch (error) {
      console.error('Parse error details:', error);
      throw new Error(`Failed to parse recipe from URL: ${error.message}`);
    }
  }

  parseJsonLd($) {
    const scripts = $('script[type="application/ld+json"]');
    
    for (let i = 0; i < scripts.length; i++) {
      try {
        const scriptContent = $(scripts[i]).html();
        if (!scriptContent) continue;
        
        const data = JSON.parse(scriptContent);
        
        // Check if it's directly a Recipe
        if (this.isRecipeObject(data)) {
          return data;
        }
        
        // Check if it's in @graph
        if (data['@graph'] && Array.isArray(data['@graph'])) {
          const recipe = data['@graph'].find(item => this.isRecipeObject(item));
          if (recipe) return recipe;
        }
        
        // Check if it's an array of objects
        if (Array.isArray(data)) {
          const recipe = data.find(item => this.isRecipeObject(item));
          if (recipe) return recipe;
        }
      } catch (e) {
        console.log('Error parsing JSON-LD:', e.message);
      }
    }
    
    return null;
  }

  parseWithConfig($, url, selectors) {
    const recipe = {
      title: this.findTextDirect($, selectors.title),
      description: this.findTextDirect($, selectors.description),
      ingredients: this.findListDirect($, selectors.ingredients),
      instructions: this.findListDirect($, selectors.instructions),
      image: this.findImageDirect($, selectors.image),
      prepTime: this.parseTime(this.findTextDirect($, selectors.prepTime)),
      cookTime: this.parseTime(this.findTextDirect($, selectors.cookTime)),
      servings: this.parseServings(this.findTextDirect($, selectors.servings)),
      sourceUrl: url
    };

    return this.formatRecipeData(recipe, url);
  }

  parseManually($, url) {
    const recipe = {
      title: this.findText($, this.defaultSelectors.title),
      description: this.findText($, this.defaultSelectors.description),
      ingredients: this.findList($, this.defaultSelectors.ingredients),
      instructions: this.findList($, this.defaultSelectors.instructions),
      image: this.findImage($, this.defaultSelectors.image),
      prepTime: this.parseTime(this.findText($, this.defaultSelectors.prepTime)),
      cookTime: this.parseTime(this.findText($, this.defaultSelectors.cookTime)),
      servings: this.parseServings(this.findText($, this.defaultSelectors.servings)),
      sourceUrl: url
    };

    return this.formatRecipeData(recipe, url);
  }

  findTextDirect($, selector) {
    if (!selector) return '';
    return $(selector).first().text().trim();
  }

  findListDirect($, selector) {
    if (!selector) return [];
    const elements = $(selector);
    return elements.map((i, el) => $(el).text().trim()).get().filter(text => text);
  }

  findImageDirect($, selector) {
    if (!selector) return null;
    const element = $(selector).first();
    return element.attr('content') || element.attr('src') || null;
  }

  findText($, selectors) {
    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      if (text) return text;
    }
    return '';
  }

  findList($, selectors) {
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        return elements.map((i, el) => $(el).text().trim()).get().filter(text => text);
      }
    }
    return [];
  }

  findImage($, selectors) {
    // Try meta tag first
    const metaImage = $('meta[property="og:image"]').attr('content');
    if (metaImage) return metaImage;

    // Try other selectors
    for (const selector of selectors) {
      const img = $(selector).first();
      const src = img.attr('src') || img.attr('content');
      if (src) return src;
    }
    return null;
  }

  parseTime(timeValue) {
    if (!timeValue) return null;
    
    // If it's already a number, return it as minutes
    if (typeof timeValue === 'number') {
      return timeValue;
    }
    
    const timeString = String(timeValue);
    
    // Parse ISO 8601 duration (PT15M = 15 minutes, PT1H30M = 90 minutes)
    const isoMatch = timeString.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (isoMatch) {
      const hours = parseInt(isoMatch[1] || 0);
      const minutes = parseInt(isoMatch[2] || 0);
      return hours * 60 + minutes;
    }

    // Parse natural language (15 minutes, 1 hour 30 minutes, etc.)
    const naturalMatch = timeString.match(/(?:(\d+)\s*h(?:ours?)?)?\s*(?:(\d+)\s*m(?:ins?|inutes?)?)?/i);
    if (naturalMatch && (naturalMatch[1] || naturalMatch[2])) {
      const hours = parseInt(naturalMatch[1] || 0);
      const minutes = parseInt(naturalMatch[2] || 0);
      return hours * 60 + minutes;
    }

    // Try to extract just numbers (assuming minutes if no unit specified)
    const numberMatch = timeString.match(/\d+/);
    if (numberMatch) {
      return parseInt(numberMatch[0]);
    }

    return null;
  }

  parseServings(servingsValue) {
    if (!servingsValue) return null;
    
    // If it's already a number, return it
    if (typeof servingsValue === 'number') {
      return servingsValue;
    }
    
    // Convert to string and parse
    const servingsString = String(servingsValue);
    const match = servingsString.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }

  formatRecipeData(data, url) {
    console.log('Raw recipe data keys:', Object.keys(data));
    
    // Log what we're working with
    if (data.recipeIngredient) {
      console.log('Found recipeIngredient:', Array.isArray(data.recipeIngredient), 'length:', data.recipeIngredient?.length);
    }
    if (data.recipeInstructions) {
      console.log('Found recipeInstructions:', Array.isArray(data.recipeInstructions), 'length:', data.recipeInstructions?.length);
    }

    // Handle both JSON-LD and manually parsed data
    const formatted = {
      title: data.name || data.headline || data.title || 'Untitled Recipe',
      description: data.description || '',
      source_url: url,
      header_image_url: this.normalizeImageUrl(data.image, url),
      prep_time: null,
      cook_time: null,
      servings: null,
      ingredients: [],
      instructions: []
    };

    // Handle time fields - check both string and object formats
    if (data.prepTime || data.prep_time) {
      const prepTimeValue = data.prepTime || data.prep_time;
      if (typeof prepTimeValue === 'string') {
        formatted.prep_time = this.parseTime(prepTimeValue);
      } else if (typeof prepTimeValue === 'number') {
        formatted.prep_time = prepTimeValue;
      }
    }
    
    if (data.cookTime || data.cook_time || data.totalTime) {
      const cookTimeValue = data.cookTime || data.cook_time || data.totalTime;
      if (typeof cookTimeValue === 'string') {
        formatted.cook_time = this.parseTime(cookTimeValue);
      } else if (typeof cookTimeValue === 'number') {
        formatted.cook_time = cookTimeValue;
      }
    }

    // Handle servings/yield - can be string, number, or array
    if (data.recipeYield || data.yield || data.servings) {
      const yieldValue = data.recipeYield || data.yield || data.servings;
      
      // Handle array format (some sites use ["6 servings"])
      if (Array.isArray(yieldValue)) {
        formatted.servings = this.parseServings(yieldValue[0]);
      } else {
        formatted.servings = this.parseServings(yieldValue);
      }
    }

    // Parse ingredients - handle both array and single string
    if (data.recipeIngredient) {
      if (Array.isArray(data.recipeIngredient)) {
        formatted.ingredients = this.parseIngredients(data.recipeIngredient);
      } else if (typeof data.recipeIngredient === 'string') {
        formatted.ingredients = this.parseIngredients([data.recipeIngredient]);
      }
    } else if (data.ingredients) {
      formatted.ingredients = this.parseIngredients(data.ingredients);
    }

    // Parse instructions
    if (data.recipeInstructions) {
      if (Array.isArray(data.recipeInstructions)) {
        formatted.instructions = this.parseInstructions(data.recipeInstructions);
      } else if (typeof data.recipeInstructions === 'string') {
        formatted.instructions = this.parseInstructions([data.recipeInstructions]);
      }
    } else if (data.instructions) {
      formatted.instructions = this.parseInstructions(data.instructions);
    }

    console.log('Formatted recipe result:', {
      title: formatted.title,
      hasDescription: !!formatted.description,
      ingredientsCount: formatted.ingredients.length,
      instructionsCount: formatted.instructions.length,
      hasPrepTime: !!formatted.prep_time,
      hasCookTime: !!formatted.cook_time,
      hasServings: !!formatted.servings,
      hasImage: !!formatted.header_image_url,
      hasSourceUrl: !!formatted.source_url
    });

    return formatted;
  }

  normalizeImageUrl(image, baseUrl) {
    if (!image) return null;
    
    // Handle different image formats from JSON-LD
    let imageUrl = image;
    if (typeof image === 'object') {
      imageUrl = image.url || image['@id'] || image.contentUrl;
    }
    if (Array.isArray(image)) {
      imageUrl = image[0];
      if (typeof imageUrl === 'object') {
        imageUrl = imageUrl.url || imageUrl['@id'] || imageUrl.contentUrl;
      }
    }

    // Make relative URLs absolute
    if (imageUrl && !imageUrl.startsWith('http')) {
      const base = new URL(baseUrl);
      imageUrl = new URL(imageUrl, base.origin).href;
    }

    return imageUrl;
  }

  parseIngredients(ingredients) {
    if (!ingredients || !Array.isArray(ingredients)) return [];
    
    return ingredients.map((ingredient, index) => {
      const text = typeof ingredient === 'string' ? ingredient : 
                   (ingredient.name || ingredient.text || ingredient['@value'] || '');
      
      // Try to parse amount, unit, and item
      const parsed = this.parseIngredientText(text);
      
      return {
        text: text.trim(),
        amount: parsed.amount,
        unit: parsed.unit,
        item: parsed.item,
        order_index: index
      };
    }).filter(ing => ing.text); // Remove empty ingredients
  }

  parseIngredientText(text) {
    // Clean up the text first
    text = text.trim();
    
    // Common units to look for
    const commonUnits = [
      'cup', 'cups', 'c',
      'tablespoon', 'tablespoons', 'tbsp', 'tbs', 'T',
      'teaspoon', 'teaspoons', 'tsp', 'ts', 't',
      'ounce', 'ounces', 'oz',
      'pound', 'pounds', 'lb', 'lbs',
      'gram', 'grams', 'g',
      'kilogram', 'kilograms', 'kg',
      'milliliter', 'milliliters', 'ml',
      'liter', 'liters', 'l',
      'pint', 'pints', 'pt',
      'quart', 'quarts', 'qt',
      'gallon', 'gallons', 'gal',
      'stick', 'sticks',
      'package', 'packages', 'pkg',
      'can', 'cans',
      'jar', 'jars',
      'bunch', 'bunches',
      'slice', 'slices',
      'piece', 'pieces',
      'clove', 'cloves',
      'head', 'heads',
      'sprig', 'sprigs',
      'pinch', 'pinches',
      'dash', 'dashes',
      'handful', 'handfuls'
    ];
    
    // Build regex pattern for units
    const unitsPattern = commonUnits.join('|');
    
    // Regex to match common ingredient patterns
    // Handles: "2 cups flour", "1/2 tsp salt", "3 large eggs", "1-2 tablespoons sugar"
    const pattern = new RegExp(`^([\\d\\s\\/\\-\\.]+)?\\s*(${unitsPattern})\\.?\\s+(.+)$`, 'i');
    const match = text.match(pattern);
    
    if (match) {
      return {
        amount: match[1] ? match[1].trim() : null,
        unit: match[2].trim(),
        item: match[3].trim()
      };
    }
    
    // Try simpler pattern for amounts without units (e.g., "3 eggs", "2 bananas")
    const simplePattern = /^([\d\s\/\-\.]+)\s+(.+)$/;
    const simpleMatch = text.match(simplePattern);
    
    if (simpleMatch) {
      // Check if the second part starts with a size descriptor
      const sizeDescriptors = ['small', 'medium', 'large', 'extra-large', 'xl'];
      const firstWord = simpleMatch[2].split(' ')[0].toLowerCase();
      
      if (!sizeDescriptors.includes(firstWord)) {
        return {
          amount: simpleMatch[1].trim(),
          unit: null,
          item: simpleMatch[2].trim()
        };
      }
    }
    
    // No pattern matched, return the whole text as the item
    return { amount: null, unit: null, item: text };
  }

  parseInstructions(instructions) {
    if (!instructions || !Array.isArray(instructions)) return [];
    
    let stepNumber = 1;
    const parsedInstructions = [];
    
    for (const instruction of instructions) {
      let text = '';
      
      if (typeof instruction === 'string') {
        text = instruction;
      } else if (instruction.text) {
        text = instruction.text;
      } else if (instruction.name) {
        text = instruction.name;
      } else if (instruction['@type'] === 'HowToStep') {
        text = instruction.text || instruction.name || '';
      } else if (instruction['@value']) {
        text = instruction['@value'];
      }
      
      // Clean up common instruction prefixes
      text = text.replace(/^(step\s*\d+[:\.]?\s*)/i, '').trim();
      
      // Some sites put all instructions in one block with line breaks
      if (text.includes('\n') && instructions.length === 1) {
        // Split by line breaks and create separate steps
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        for (const line of lines) {
          const cleanLine = line.replace(/^(step\s*\d+[:\.]?\s*|\d+[\.]\s*)/i, '').trim();
          if (cleanLine) {
            parsedInstructions.push({
              step_number: stepNumber++,
              text: cleanLine
            });
          }
        }
      } else if (text) {
        parsedInstructions.push({
          step_number: stepNumber++,
          text: text
        });
      }
    }
    
    return parsedInstructions;
  }

  isRecipeObject(obj) {
    if (!obj || typeof obj !== 'object') return false;
    
    const type = obj['@type'];
    if (!type) return false;
    
    // Handle string type
    if (typeof type === 'string') {
      return type === 'Recipe' || type.toLowerCase().includes('recipe');
    }
    
    // Handle array type (e.g., ["Recipe", "Thing"])
    if (Array.isArray(type)) {
      return type.some(t => t === 'Recipe' || t.toLowerCase().includes('recipe'));
    }
    
    return false;
  }

  // Method to handle text-based recipe parsing (for pasted recipes)
  parseFromText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    const recipe = {
      title: '',
      description: '',
      ingredients: [],
      instructions: [],
      servings: null
    };

    let section = 'title';
    let instructionNumber = 1;

    for (const line of lines) {
      // Detect section headers
      if (line.toLowerCase().includes('ingredient')) {
        section = 'ingredients';
        continue;
      } else if (line.toLowerCase().includes('instruction') || 
                 line.toLowerCase().includes('direction') ||
                 line.toLowerCase().includes('method')) {
        section = 'instructions';
        continue;
      } else if (line.toLowerCase().includes('description') || 
                 line.toLowerCase().includes('intro')) {
        section = 'description';
        continue;
      }

      // Parse based on current section
      switch (section) {
        case 'title':
          if (!recipe.title && line.length < 100) {
            recipe.title = line;
            section = 'description'; // Move to description after title
          }
          break;

        case 'description':
          if (!line.toLowerCase().includes('ingredient')) {
            recipe.description += (recipe.description ? ' ' : '') + line;
          }
          break;

        case 'ingredients':
          if (line && !line.toLowerCase().includes('instruction')) {
            const parsed = this.parseIngredientText(line);
            recipe.ingredients.push({
              text: line,
              amount: parsed.amount,
              unit: parsed.unit,
              item: parsed.item,
              order_index: recipe.ingredients.length
            });
          }
          break;

        case 'instructions':
          if (line) {
            // Remove common step prefixes
            const cleanedLine = line.replace(/^(?:\d+\.?\s*|step\s+\d+:?\s*)/i, '');
            recipe.instructions.push({
              step_number: instructionNumber++,
              text: cleanedLine
            });
          }
          break;
      }
    }

    return recipe;
  }
}

module.exports = new RecipeParser();