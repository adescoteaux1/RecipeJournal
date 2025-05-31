-- Recipe Tracker Database Schema
-- Run this entire file in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for restricted values
CREATE TYPE cuisine_type AS ENUM (
  'italian', 'mexican', 'chinese', 'indian', 'american', 
  'french', 'thai', 'japanese', 'mediterranean', 'middle-eastern', 
  'greek', 'korean', 'vietnamese', 'other'
);

CREATE TYPE meal_type AS ENUM (
  'breakfast', 'lunch', 'dinner', 'dessert', 'snack', 
  'appetizer', 'side dish', 'drink', 'sauce', 'other'
);

CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Recipes table (main table)
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  source_url TEXT,
  header_image_url TEXT,
  cuisine_type cuisine_type DEFAULT 'other',
  meal_type meal_type DEFAULT 'other',
  difficulty difficulty_level DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  amount VARCHAR(50),
  unit VARCHAR(50),
  item VARCHAR(255),
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instructions table
CREATE TABLE IF NOT EXISTS instructions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe edits tracking
CREATE TABLE IF NOT EXISTS recipe_edits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  field_changed VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe makes (when user made the recipe)
CREATE TABLE IF NOT EXISTS recipe_makes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  made_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT
);

-- Recipe comments
CREATE TABLE IF NOT EXISTS recipe_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Line-specific notes
CREATE TABLE IF NOT EXISTS instruction_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  instruction_id UUID REFERENCES instructions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe images
CREATE TABLE IF NOT EXISTS recipe_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table (for recipe categorization)
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe-Tags junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS recipe_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_cuisine_type ON recipes(cuisine_type);
CREATE INDEX idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX idx_instructions_recipe_id ON instructions(recipe_id);
CREATE INDEX idx_recipe_makes_recipe_id ON recipe_makes(recipe_id);
CREATE INDEX idx_recipe_makes_user_id ON recipe_makes(user_id);
CREATE INDEX idx_recipe_images_recipe_id ON recipe_images(recipe_id);
CREATE INDEX idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX idx_recipe_tags_tag_id ON recipe_tags(tag_id);
CREATE INDEX idx_tags_name ON tags(name);

-- Enable Row Level Security on all tables
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE instruction_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes table
CREATE POLICY "Users can view their own recipes" ON recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ingredients table
CREATE POLICY "Users can view ingredients of their recipes" ON ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = ingredients.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage ingredients of their recipes" ON ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = ingredients.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

-- RLS Policies for instructions table
CREATE POLICY "Users can view instructions of their recipes" ON instructions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = instructions.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage instructions of their recipes" ON instructions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = instructions.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

-- RLS Policies for recipe_edits table
CREATE POLICY "Users can view edits of their recipes" ON recipe_edits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_edits.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create edits for their recipes" ON recipe_edits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for recipe_makes table
CREATE POLICY "Users can view their own makes" ON recipe_makes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own makes" ON recipe_makes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own makes" ON recipe_makes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own makes" ON recipe_makes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for recipe_comments table
CREATE POLICY "Users can view comments on their recipes" ON recipe_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_comments.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments" ON recipe_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON recipe_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON recipe_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for instruction_notes table
CREATE POLICY "Users can view their own notes" ON instruction_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" ON instruction_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON instruction_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON instruction_notes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for recipe_images table
CREATE POLICY "Users can view images of their recipes" ON recipe_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_images.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload images to their recipes" ON recipe_images
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_images.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own images" ON recipe_images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images" ON recipe_images
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tags table (tags are shared across all users)
CREATE POLICY "Anyone can view tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for recipe_tags table
CREATE POLICY "Users can view tags of their recipes" ON recipe_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_tags.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tags of their recipes" ON recipe_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_tags.recipe_id 
      AND recipes.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_comments_updated_at BEFORE UPDATE ON recipe_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some common tags to get started

INSERT INTO tags (name) VALUES 
  ('vegetarian'),
  ('vegan'),
  ('gluten-free'),
  ('dairy-free'),
  ('keto'),
  ('paleo'),
  ('low-carb'),
  ('high-protein'),
  ('quick'),
  ('budget-friendly'),
  ('meal-prep'),
  ('one-pot'),
  ('no-bake'),
  ('holiday'),
  ('summer'),
  ('winter'),
  ('comfort-food'),
  ('healthy'),
  ('indulgent'),
  ('family-friendly')
ON CONFLICT (name) DO NOTHING;

