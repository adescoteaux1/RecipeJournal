
-- seed.sql - Test data for Recipe Tracker

DO $$
DECLARE
  test_user_id UUID := 'ac4a541d-0348-404f-9ea9-b7d740ce7ddd';
  recipe1_id UUID;
  recipe2_id UUID;
  recipe3_id UUID;
  recipe4_id UUID;
  recipe5_id UUID;
  recipe6_id UUID;
  
  -- Tag IDs
  tag_vegetarian UUID;
  tag_vegan UUID;
  tag_glutenfree UUID;
  tag_quick UUID;
  tag_healthy UUID;
  tag_comfortfood UUID;
  tag_budget UUID;
  tag_mealprep UUID;
  tag_onepot UUID;
  tag_summer UUID;
  tag_spicy UUID;
  tag_kidfriendly UUID;
BEGIN
  -- Insert tags first
  INSERT INTO tags (name) VALUES ('vegetarian') RETURNING id INTO tag_vegetarian;
  INSERT INTO tags (name) VALUES ('vegan') RETURNING id INTO tag_vegan;
  INSERT INTO tags (name) VALUES ('gluten-free') RETURNING id INTO tag_glutenfree;
  INSERT INTO tags (name) VALUES ('quick') RETURNING id INTO tag_quick;
  INSERT INTO tags (name) VALUES ('healthy') RETURNING id INTO tag_healthy;
  INSERT INTO tags (name) VALUES ('comfort-food') RETURNING id INTO tag_comfortfood;
  INSERT INTO tags (name) VALUES ('budget-friendly') RETURNING id INTO tag_budget;
  INSERT INTO tags (name) VALUES ('meal-prep') RETURNING id INTO tag_mealprep;
  INSERT INTO tags (name) VALUES ('one-pot') RETURNING id INTO tag_onepot;
  INSERT INTO tags (name) VALUES ('summer') RETURNING id INTO tag_summer;
  INSERT INTO tags (name) VALUES ('spicy') RETURNING id INTO tag_spicy;
  INSERT INTO tags (name) VALUES ('kid-friendly') RETURNING id INTO tag_kidfriendly;

  -- Recipe 1: Classic Spaghetti Carbonara
  INSERT INTO recipes (
    user_id, title, description, prep_time, cook_time, servings,
    cuisine_type, meal_type, difficulty, header_image_url
  ) VALUES (
    test_user_id,
    'Classic Spaghetti Carbonara',
    'A traditional Italian pasta dish with eggs, cheese, and pancetta. Simple ingredients combined to create an incredibly rich and satisfying meal.',
    15, 20, 4,
    'italian', 'dinner', 'medium',
    'https://images.unsplash.com/photo-1612874742237-6526221588e3'
  ) RETURNING id INTO recipe1_id;

  -- Ingredients for Recipe 1
  INSERT INTO ingredients (recipe_id, text, amount, unit, item, order_index) VALUES
    (recipe1_id, '400g spaghetti', '400', 'g', 'spaghetti', 0),
    (recipe1_id, '200g pancetta or guanciale, diced', '200', 'g', 'pancetta or guanciale', 1),
    (recipe1_id, '4 large eggs', '4', NULL, 'large eggs', 2),
    (recipe1_id, '100g Pecorino Romano cheese, grated', '100', 'g', 'Pecorino Romano cheese', 3),
    (recipe1_id, '100g Parmesan cheese, grated', '100', 'g', 'Parmesan cheese', 4),
    (recipe1_id, 'Freshly ground black pepper', NULL, NULL, 'black pepper', 5),
    (recipe1_id, 'Salt for pasta water', NULL, NULL, 'salt', 6);

  -- Instructions for Recipe 1
  INSERT INTO instructions (recipe_id, step_number, text) VALUES
    (recipe1_id, 1, 'Bring a large pot of salted water to boil and cook spaghetti according to package directions until al dente.'),
    (recipe1_id, 2, 'While pasta cooks, heat a large skillet over medium heat and cook pancetta until crispy, about 5-7 minutes.'),
    (recipe1_id, 3, 'In a bowl, whisk together eggs, Pecorino Romano, and Parmesan. Season generously with black pepper.'),
    (recipe1_id, 4, 'Reserve 1 cup of pasta cooking water before draining the spaghetti.'),
    (recipe1_id, 5, 'Remove skillet with pancetta from heat. Add drained hot pasta to the pancetta and toss.'),
    (recipe1_id, 6, 'Let pasta cool for 1 minute, then pour egg mixture over pasta, tossing quickly to coat.'),
    (recipe1_id, 7, 'Add pasta water a little at a time until sauce reaches desired consistency.'),
    (recipe1_id, 8, 'Serve immediately with extra cheese and black pepper.');

  -- Tags for Recipe 1
  INSERT INTO recipe_tags (recipe_id, tag_id) VALUES
    (recipe1_id, tag_comfortfood);

  -- Recipe 2: Thai Green Curry
  INSERT INTO recipes (
    user_id, title, description, prep_time, cook_time, servings,
    cuisine_type, meal_type, difficulty, header_image_url
  ) VALUES (
    test_user_id,
    'Thai Green Curry with Vegetables',
    'A fragrant and spicy Thai curry loaded with vegetables and aromatic herbs. This vegan version is just as delicious as the traditional recipe.',
    20, 25, 6,
    'thai', 'dinner', 'medium',
    'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd'
  ) RETURNING id INTO recipe2_id;

  -- Ingredients for Recipe 2
  INSERT INTO ingredients (recipe_id, text, amount, unit, item, order_index) VALUES
    (recipe2_id, '2 tbsp coconut oil', '2', 'tbsp', 'coconut oil', 0),
    (recipe2_id, '3 tbsp green curry paste', '3', 'tbsp', 'green curry paste', 1),
    (recipe2_id, '400ml coconut milk', '400', 'ml', 'coconut milk', 2),
    (recipe2_id, '200ml vegetable broth', '200', 'ml', 'vegetable broth', 3),
    (recipe2_id, '200g eggplant, cubed', '200', 'g', 'eggplant', 4),
    (recipe2_id, '200g green beans, trimmed', '200', 'g', 'green beans', 5),
    (recipe2_id, '1 red bell pepper, sliced', '1', NULL, 'red bell pepper', 6),
    (recipe2_id, '150g baby corn', '150', 'g', 'baby corn', 7),
    (recipe2_id, '2 tbsp soy sauce', '2', 'tbsp', 'soy sauce', 8),
    (recipe2_id, '1 tbsp palm sugar or brown sugar', '1', 'tbsp', 'palm sugar', 9),
    (recipe2_id, 'Fresh basil leaves', NULL, NULL, 'basil leaves', 10),
    (recipe2_id, '2 kaffir lime leaves', '2', NULL, 'kaffir lime leaves', 11),
    (recipe2_id, 'Jasmine rice for serving', NULL, NULL, 'jasmine rice', 12);

  -- Instructions for Recipe 2
  INSERT INTO instructions (recipe_id, step_number, text) VALUES
    (recipe2_id, 1, 'Heat coconut oil in a large pan or wok over medium-high heat.'),
    (recipe2_id, 2, 'Add green curry paste and fry for 1-2 minutes until fragrant.'),
    (recipe2_id, 3, 'Pour in coconut milk and vegetable broth, stirring to combine with curry paste.'),
    (recipe2_id, 4, 'Add eggplant and simmer for 5 minutes.'),
    (recipe2_id, 5, 'Add green beans, bell pepper, and baby corn. Simmer for 10-12 minutes until vegetables are tender.'),
    (recipe2_id, 6, 'Stir in soy sauce and palm sugar. Add kaffir lime leaves.'),
    (recipe2_id, 7, 'Taste and adjust seasoning as needed.'),
    (recipe2_id, 8, 'Remove from heat and stir in fresh basil leaves.'),
    (recipe2_id, 9, 'Serve hot over jasmine rice.');

  -- Tags for Recipe 2
  INSERT INTO recipe_tags (recipe_id, tag_id) VALUES
    (recipe2_id, tag_vegan),
    (recipe2_id, tag_vegetarian),
    (recipe2_id, tag_healthy),
    (recipe2_id, tag_spicy),
    (recipe2_id, tag_glutenfree);

  -- Recipe 3: Quick Breakfast Smoothie Bowl
  INSERT INTO recipes (
    user_id, title, description, prep_time, cook_time, servings,
    cuisine_type, meal_type, difficulty, header_image_url
  ) VALUES (
    test_user_id,
    'Berry Açaí Smoothie Bowl',
    'A nutritious and Instagram-worthy breakfast bowl packed with antioxidants and topped with fresh fruits, nuts, and seeds.',
    10, 0, 1,
    'other', 'breakfast', 'easy',
    'https://images.unsplash.com/photo-1590301157890-4810ed352733'
  ) RETURNING id INTO recipe3_id;

  -- Ingredients for Recipe 3
  INSERT INTO ingredients (recipe_id, text, amount, unit, item, order_index) VALUES
    (recipe3_id, '1 frozen açaí packet (100g)', '100', 'g', 'frozen açaí packet', 0),
    (recipe3_id, '1/2 cup frozen blueberries', '1/2', 'cup', 'frozen blueberries', 1),
    (recipe3_id, '1/2 frozen banana', '1/2', NULL, 'frozen banana', 2),
    (recipe3_id, '1/4 cup almond milk', '1/4', 'cup', 'almond milk', 3),
    (recipe3_id, '1 tbsp honey or maple syrup', '1', 'tbsp', 'honey or maple syrup', 4),
    (recipe3_id, 'For toppings:', NULL, NULL, NULL, 5),
    (recipe3_id, 'Fresh strawberries, sliced', NULL, NULL, 'strawberries', 6),
    (recipe3_id, 'Fresh blueberries', NULL, NULL, 'blueberries', 7),
    (recipe3_id, 'Granola', NULL, NULL, 'granola', 8),
    (recipe3_id, 'Chia seeds', NULL, NULL, 'chia seeds', 9),
    (recipe3_id, 'Coconut flakes', NULL, NULL, 'coconut flakes', 10);

  -- Instructions for Recipe 3
  INSERT INTO instructions (recipe_id, step_number, text) VALUES
    (recipe3_id, 1, 'Break açaí packet into chunks and add to a high-speed blender.'),
    (recipe3_id, 2, 'Add frozen blueberries, banana, almond milk, and honey.'),
    (recipe3_id, 3, 'Blend until smooth and creamy, scraping down sides as needed. The consistency should be thicker than a regular smoothie.'),
    (recipe3_id, 4, 'Pour into a bowl and smooth the top with a spoon.'),
    (recipe3_id, 5, 'Arrange toppings in rows or patterns on top of the smoothie base.'),
    (recipe3_id, 6, 'Serve immediately and enjoy with a spoon.');

  -- Tags for Recipe 3
  INSERT INTO recipe_tags (recipe_id, tag_id) VALUES
    (recipe3_id, tag_healthy),
    (recipe3_id, tag_quick),
    (recipe3_id, tag_vegan),
    (recipe3_id, tag_vegetarian),
    (recipe3_id, tag_glutenfree),
    (recipe3_id, tag_summer);

  -- Recipe 4: Mexican Street Tacos
  INSERT INTO recipes (
    user_id, title, description, prep_time, cook_time, servings,
    cuisine_type, meal_type, difficulty, header_image_url, source_url
  ) VALUES (
    test_user_id,
    'Authentic Mexican Street Tacos',
    'Simple and delicious street-style tacos with marinated meat, fresh cilantro, and onions. Just like the ones from your favorite taco truck!',
    30, 15, 4,
    'mexican', 'dinner', 'easy',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
    'https://example.com/mexican-tacos-recipe'
  ) RETURNING id INTO recipe4_id;

  -- Ingredients for Recipe 4
  INSERT INTO ingredients (recipe_id, text, amount, unit, item, order_index) VALUES
    (recipe4_id, '500g flank steak or chicken thighs', '500', 'g', 'flank steak or chicken thighs', 0),
    (recipe4_id, '3 cloves garlic, minced', '3', 'cloves', 'garlic', 1),
    (recipe4_id, 'Juice of 2 limes', '2', NULL, 'limes', 2),
    (recipe4_id, '2 tbsp olive oil', '2', 'tbsp', 'olive oil', 3),
    (recipe4_id, '1 tsp ground cumin', '1', 'tsp', 'ground cumin', 4),
    (recipe4_id, '1 tsp chili powder', '1', 'tsp', 'chili powder', 5),
    (recipe4_id, 'Salt and pepper to taste', NULL, NULL, 'salt and pepper', 6),
    (recipe4_id, '12 small corn tortillas', '12', NULL, 'corn tortillas', 7),
    (recipe4_id, '1 white onion, finely chopped', '1', NULL, 'white onion', 8),
    (recipe4_id, 'Fresh cilantro, chopped', NULL, NULL, 'cilantro', 9),
    (recipe4_id, 'Lime wedges for serving', NULL, NULL, 'lime wedges', 10),
    (recipe4_id, 'Salsa verde or your favorite salsa', NULL, NULL, 'salsa', 11);

  -- Instructions for Recipe 4
  INSERT INTO instructions (recipe_id, step_number, text) VALUES
    (recipe4_id, 1, 'In a bowl, combine garlic, lime juice, olive oil, cumin, chili powder, salt, and pepper to make marinade.'),
    (recipe4_id, 2, 'Cut meat into small, bite-sized pieces and add to marinade. Mix well and let marinate for at least 30 minutes.'),
    (recipe4_id, 3, 'Heat a large skillet or griddle over high heat. Cook meat in batches until charred and cooked through, about 3-4 minutes per batch.'),
    (recipe4_id, 4, 'Warm tortillas on a griddle or directly over a gas flame until soft and slightly charred.'),
    (recipe4_id, 5, 'To assemble tacos, place meat on warm tortillas and top with chopped onion and cilantro.'),
    (recipe4_id, 6, 'Serve with lime wedges and salsa on the side.');

  -- Tags for Recipe 4
  INSERT INTO recipe_tags (recipe_id, tag_id) VALUES
    (recipe4_id, tag_quick),
    (recipe4_id, tag_budget),
    (recipe4_id, tag_kidfriendly);

  -- Recipe 5: One-Pot Pasta Primavera
  INSERT INTO recipes (
    user_id, title, description, prep_time, cook_time, servings,
    cuisine_type, meal_type, difficulty, header_image_url
  ) VALUES (
    test_user_id,
    'One-Pot Pasta Primavera',
    'A colorful and healthy pasta dish where everything cooks in one pot. Perfect for busy weeknights with minimal cleanup!',
    10, 20, 4,
    'italian', 'dinner', 'easy',
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9'
  ) RETURNING id INTO recipe5_id;

  -- Ingredients for Recipe 5
  INSERT INTO ingredients (recipe_id, text, amount, unit, item, order_index) VALUES
    (recipe5_id, '12 oz linguine or spaghetti', '12', 'oz', 'linguine or spaghetti', 0),
    (recipe5_id, '3 cups vegetable broth', '3', 'cups', 'vegetable broth', 1),
    (recipe5_id, '1 can (14 oz) diced tomatoes', '14', 'oz', 'diced tomatoes', 2),
    (recipe5_id, '1 onion, sliced', '1', NULL, 'onion', 3),
    (recipe5_id, '3 cloves garlic, minced', '3', 'cloves', 'garlic', 4),
    (recipe5_id, '1 zucchini, sliced', '1', NULL, 'zucchini', 5),
    (recipe5_id, '1 yellow squash, sliced', '1', NULL, 'yellow squash', 6),
    (recipe5_id, '1 red bell pepper, sliced', '1', NULL, 'red bell pepper', 7),
    (recipe5_id, '1 cup cherry tomatoes, halved', '1', 'cup', 'cherry tomatoes', 8),
    (recipe5_id, '2 tsp Italian seasoning', '2', 'tsp', 'Italian seasoning', 9),
    (recipe5_id, '1/4 tsp red pepper flakes', '1/4', 'tsp', 'red pepper flakes', 10),
    (recipe5_id, 'Salt and pepper to taste', NULL, NULL, 'salt and pepper', 11),
    (recipe5_id, 'Fresh basil and Parmesan for serving', NULL, NULL, 'basil and Parmesan', 12);

  -- Instructions for Recipe 5
  INSERT INTO instructions (recipe_id, step_number, text) VALUES
    (recipe5_id, 1, 'In a large pot or Dutch oven, combine pasta, vegetable broth, diced tomatoes (with juice), onion, and garlic.'),
    (recipe5_id, 2, 'Bring to a boil over high heat, stirring frequently.'),
    (recipe5_id, 3, 'Once boiling, reduce heat to medium-low and add all vegetables, Italian seasoning, and red pepper flakes.'),
    (recipe5_id, 4, 'Continue to cook, stirring every few minutes, for about 15-20 minutes until pasta is tender and liquid has reduced to a saucy consistency.'),
    (recipe5_id, 5, 'Season with salt and pepper to taste.'),
    (recipe5_id, 6, 'Serve topped with fresh basil and grated Parmesan cheese.');

  -- Tags for Recipe 5
  INSERT INTO recipe_tags (recipe_id, tag_id) VALUES
    (recipe5_id, tag_vegetarian),
    (recipe5_id, tag_healthy),
    (recipe5_id, tag_quick),
    (recipe5_id, tag_onepot),
    (recipe5_id, tag_kidfriendly),
    (recipe5_id, tag_budget);

  -- Recipe 6: Korean Bibimbap Bowl
  INSERT INTO recipes (
    user_id, title, description, prep_time, cook_time, servings,
    cuisine_type, meal_type, difficulty, header_image_url
  ) VALUES (
    test_user_id,
    'Korean Bibimbap Bowl',
    'A vibrant Korean rice bowl topped with seasoned vegetables, egg, and gochujang sauce. A perfect balance of flavors and textures.',
    30, 20, 2,
    'korean', 'lunch', 'medium',
    'https://images.unsplash.com/photo-1553163147-622ab57be1c7'
  ) RETURNING id INTO recipe6_id;

  -- Ingredients for Recipe 6 (abbreviated for space)
  INSERT INTO ingredients (recipe_id, text, amount, unit, item, order_index) VALUES
    (recipe6_id, '2 cups cooked white rice', '2', 'cups', 'white rice', 0),
    (recipe6_id, '200g ground beef', '200', 'g', 'ground beef', 1),
    (recipe6_id, '2 eggs', '2', NULL, 'eggs', 2),
    (recipe6_id, '1 carrot, julienned', '1', NULL, 'carrot', 3),
    (recipe6_id, '1 zucchini, julienned', '1', NULL, 'zucchini', 4),
    (recipe6_id, '100g spinach', '100', 'g', 'spinach', 5),
    (recipe6_id, '100g bean sprouts', '100', 'g', 'bean sprouts', 6),
    (recipe6_id, '100g mushrooms, sliced', '100', 'g', 'mushrooms', 7),
    (recipe6_id, '2 tbsp gochujang', '2', 'tbsp', 'gochujang', 8),
    (recipe6_id, '2 tbsp sesame oil', '2', 'tbsp', 'sesame oil', 9),
    (recipe6_id, '2 tbsp soy sauce', '2', 'tbsp', 'soy sauce', 10),
    (recipe6_id, 'Sesame seeds for garnish', NULL, NULL, 'sesame seeds', 11);

  -- Tags for Recipe 6
  INSERT INTO recipe_tags (recipe_id, tag_id) VALUES
    (recipe6_id, tag_healthy),
    (recipe6_id, tag_mealprep);

  -- Add some recipe makes
  INSERT INTO recipe_makes (recipe_id, user_id, rating, notes) VALUES
    (recipe1_id, test_user_id, 5, 'Perfect carbonara! The key is to let the pasta cool slightly before adding eggs.'),
    (recipe2_id, test_user_id, 4, 'Very spicy! Next time I''ll use less curry paste.'),
    (recipe3_id, test_user_id, 5, 'My go-to breakfast. Sometimes I add protein powder.'),
    (recipe4_id, test_user_id, 5, 'Just like the street tacos in Mexico!'),
    (recipe5_id, test_user_id, 4, 'So easy and only one pot to clean!');

  -- Add some comments
  INSERT INTO recipe_comments (recipe_id, user_id, comment) VALUES
    (recipe1_id, test_user_id, 'Pro tip: Save more pasta water than you think you need!'),
    (recipe2_id, test_user_id, 'I like to add Thai basil at the end for extra flavor.'),
    (recipe4_id, test_user_id, 'Marinating overnight makes a huge difference.'),
    (recipe5_id, test_user_id, 'Great for meal prep - just add fresh herbs when reheating.');

  -- Add some recipe edits history
  INSERT INTO recipe_edits (recipe_id, user_id, field_changed, old_value, new_value) VALUES
    (recipe1_id, test_user_id, 'created', NULL, 'Recipe created'),
    (recipe2_id, test_user_id, 'created', NULL, 'Recipe created'),
    (recipe3_id, test_user_id, 'created', NULL, 'Recipe created'),
    (recipe4_id, test_user_id, 'created', NULL, 'Recipe created'),
    (recipe5_id, test_user_id, 'created', NULL, 'Recipe created'),
    (recipe6_id, test_user_id, 'created', NULL, 'Recipe created'),
    (recipe2_id, test_user_id, 'servings', '4', '6'),
    (recipe3_id, test_user_id, 'description', 'A nutritious breakfast bowl', 'A nutritious and Instagram-worthy breakfast bowl packed with antioxidants and topped with fresh fruits, nuts, and seeds.');

  -- Add some instruction notes
  INSERT INTO instruction_notes (instruction_id, user_id, note) 
  SELECT id, test_user_id, 'The pasta water is crucial for the sauce consistency!'
  FROM instructions 
  WHERE recipe_id = recipe1_id AND step_number = 4
  LIMIT 1;

  INSERT INTO instruction_notes (instruction_id, user_id, note) 
  SELECT id, test_user_id, 'I use a meat thermometer to ensure 165°F internal temp'
  FROM instructions 
  WHERE recipe_id = recipe4_id AND step_number = 3
  LIMIT 1;

  -- Add some recipe images
  INSERT INTO recipe_images (recipe_id, user_id, image_url, caption, is_primary) VALUES
    (recipe1_id, test_user_id, 'https://images.unsplash.com/photo-1612874742237-6526221588e3', 'Final plated carbonara', true),
    (recipe2_id, test_user_id, 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd', 'Thai green curry with vegetables', true),
    (recipe3_id, test_user_id, 'https://images.unsplash.com/photo-1590301157890-4810ed352733', 'Beautiful smoothie bowl with toppings', true);

END $$;

-- Additional tags for variety
INSERT INTO tags (name) VALUES 
  ('low-carb'),
  ('high-protein'),
  ('dairy-free'),
  ('nut-free'),
  ('breakfast-meal-prep'),
  ('date-night'),
  ('party-food'),
  ('leftovers-friendly'),
  ('freezer-friendly'),
  ('no-cook'),
  ('baked'),
  ('grilled'),
  ('slow-cooker'),
  ('instant-pot'),
  ('air-fryer'),
  ('whole30'),
  ('paleo'),
  ('mediterranean'),
  ('comfort-food'),
  ('light'),
  ('hearty'),
  ('sweet'),
  ('savory'),
  ('brunch'),
  ('appetizer'),
  ('side-dish'),
  ('main-course'),
  ('dessert'),
  ('drink'),
  ('sauce'),
  ('marinade'),
  ('dressing'),
  ('snack')
ON CONFLICT (name) DO NOTHING;

-- Verify the seed data
SELECT 
  'Seed data complete!' as status,
  (SELECT COUNT(*) FROM recipes) as recipe_count,
  (SELECT COUNT(*) FROM tags) as tag_count,
  (SELECT COUNT(*) FROM recipe_tags) as recipe_tag_count,
  (SELECT COUNT(*) FROM ingredients) as ingredient_count,
  (SELECT COUNT(*) FROM instructions) as instruction_count;