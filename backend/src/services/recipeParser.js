// src/services/recipeParser.js
const axios = require('axios');
const cheerio = require('cheerio');

class RecipeParser {
  constructor() {
    // Common recipe schema selectors for popular recipe sites
    this.schemaSelectors = {
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
      // Fetch the webpage
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // First, try to parse JSON-LD structured data
      const jsonLdData = this.parseJsonLd($);
      if (jsonLdData) {
        return this.formatRecipeData(jsonLdData, url);
      }

      // Fallback to manual parsing
      return this.parseManually($, url);
    } catch (error) {
      throw new Error(`Failed to parse recipe from URL: ${error.message}`);
    }
  }

  parseJsonLd($) {
    const scripts = $(this.schemaSelectors.recipe);
    
    for (let i = 0; i < scripts.length; i++) {
      try {
        const data = JSON.parse($(scripts[i]).html());
        
        // Check if it's a Recipe type
        if (data['@type'] === 'Recipe' || 
            (Array.isArray(data['@graph']) && 
             data['@graph'].find(item => item['@type'] === 'Recipe'))) {
          
          const recipe = data['@type'] === 'Recipe' ? data : 
                        data['@graph'].find(item => item['@type'] === 'Recipe');
          
          return recipe;
        }
      } catch (e) {
        // Continue to next script tag
      }
    }
    
    return null;
  }

  parseManually($, url) {
    const recipe = {
      title: this.findText($, this.schemaSelectors.title),
      description: this.findText($, this.schemaSelectors.description),
      ingredients: this.findList($, this.schemaSelectors.ingredients),
      instructions: this.findList($, this.schemaSelectors.instructions),
      image: this.findImage($, this.schemaSelectors.image),
      prepTime: this.parseTime(this.findText($, this.schemaSelectors.prepTime)),
      cookTime: this.parseTime(this.findText($, this.schemaSelectors.cookTime)),
      servings: this.parseServings(this.findText($, this.schemaSelectors.servings)),
      sourceUrl: url
    };

    return this.formatRecipeData(recipe, url);
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
        return elements.map((i, el) => $(el).text().trim()).get();
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

  parseTime(timeString) {
    if (!timeString) return null;
    
    // Parse ISO 8601 duration (PT15M = 15 minutes)
    const isoMatch = timeString.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (isoMatch) {
      const hours = parseInt(isoMatch[1] || 0);
      const minutes = parseInt(isoMatch[2] || 0);
      return hours * 60 + minutes;
    }

    // Parse natural language (15 minutes, 1 hour 30 minutes, etc.)
    const naturalMatch = timeString.match(/(?:(\d+)\s*h(?:ours?)?)?\s*(?:(\d+)\s*m(?:ins?|inutes?)?)?/i);
    if (naturalMatch) {
      const hours = parseInt(naturalMatch[1] || 0);
      const minutes = parseInt(naturalMatch[2] || 0);
      return hours * 60 + minutes;
    }

    return null;
  }

  parseServings(servingsString) {
    if (!servingsString) return null;
    
    const match = servingsString.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }

  formatRecipeData(data, url) {
    // Handle both JSON-LD and manually parsed data
    const formatted = {
      title: data.name || data.title || 'Untitled Recipe',
      description: data.description || '',
      source_url: url,
      header_image_url: this.normalizeImageUrl(data.image, url),
      prep_time: typeof data.prepTime === 'string' ? 
                 this.parseTime(data.prepTime) : data.prepTime,
      cook_time: typeof data.cookTime === 'string' ? 
                 this.parseTime(data.cookTime) : data.cookTime,
      servings: typeof data.recipeYield === 'string' ? 
                this.parseServings(data.recipeYield) : 
                (data.recipeYield || data.servings),
      ingredients: this.parseIngredients(data.recipeIngredient || data.ingredients),
      instructions: this.parseInstructions(data.recipeInstructions || data.instructions)
    };

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
                   (ingredient.name || ingredient.text || '');
      
      // Try to parse amount, unit, and item
      const parsed = this.parseIngredientText(text);
      
      return {
        text: text.trim(),
        amount: parsed.amount,
        unit: parsed.unit,
        item: parsed.item,
        order_index: index
      };
    });
  }

  parseIngredientText(text) {
    // Regex to match common ingredient patterns
    // e.g., "2 cups flour", "1/2 tsp salt", "3 large eggs"
    const pattern = /^([\d\s\/\-\.]+)?\s*([a-zA-Z]+\.?)?\s*(.+)$/;
    const match = text.match(pattern);
    
    if (match) {
      return {
        amount: match[1] ? match[1].trim() : null,
        unit: match[2] ? match[2].trim() : null,
        item: match[3] ? match[3].trim() : text
      };
    }
    
    return { amount: null, unit: null, item: text };
  }

  parseInstructions(instructions) {
    if (!instructions || !Array.isArray(instructions)) return [];
    
    return instructions.map((instruction, index) => {
      let text = '';
      
      if (typeof instruction === 'string') {
        text = instruction;
      } else if (instruction.text) {
        text = instruction.text;
      } else if (instruction.name) {
        text = instruction.name;
      } else if (instruction['@type'] === 'HowToStep') {
        text = instruction.text || instruction.name || '';
      }
      
      return {
        step_number: index + 1,
        text: text.trim()
      };
    }).filter(step => step.text); // Remove empty steps
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