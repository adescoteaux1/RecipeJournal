// src/types/recipe.types.ts

export type CuisineType = 
  | 'italian' 
  | 'mexican' 
  | 'chinese' 
  | 'indian' 
  | 'american'
  | 'french' 
  | 'thai' 
  | 'japanese' 
  | 'mediterranean' 
  | 'middle-eastern'
  | 'greek' 
  | 'korean' 
  | 'vietnamese' 
  | 'other';

export type MealType = 
  | 'breakfast' 
  | 'lunch' 
  | 'dinner' 
  | 'dessert' 
  | 'snack'
  | 'appetizer' 
  | 'side dish' 
  | 'drink' 
  | 'sauce' 
  | 'other';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  source_url?: string;
  header_image_url?: string;
  cuisine_type: CuisineType;
  meal_type: MealType;
  difficulty: DifficultyLevel;
  created_at: string;
  updated_at: string;
  
  // Relations
  ingredients?: Ingredient[];
  instructions?: Instruction[];
  recipe_images?: RecipeImage[];
  tags?: string[];
  recipe_makes?: RecipeMake[];
  recipe_comments?: RecipeComment[];
}

export interface Ingredient {
  id: string;
  recipe_id: string;
  text: string;
  amount?: string;
  unit?: string;
  item?: string;
  order_index: number;
  created_at: string;
}

export interface Instruction {
  id: string;
  recipe_id: string;
  step_number: number;
  text: string;
  created_at: string;
  instruction_notes?: InstructionNote[];
}

export interface InstructionNote {
  id: string;
  instruction_id: string;
  user_id: string;
  note: string;
  created_at: string;
}

export interface RecipeImage {
  id: string;
  recipe_id: string;
  user_id: string;
  image_url: string;
  caption?: string;
  is_primary: boolean;
  uploaded_at: string;
}

export interface RecipeMake {
  id: string;
  recipe_id: string;
  user_id: string;
  made_at: string;
  rating?: number;
  notes?: string;
}

export interface RecipeComment {
  id: string;
  recipe_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeFilters {
  cuisine_type?: CuisineType;
  meal_type?: MealType;
  difficulty?: DifficultyLevel;
  tags?: string[];
  search?: string;
}

export interface FilterOptions {
  cuisineTypes: CuisineType[];
  mealTypes: MealType[];
  difficulties: DifficultyLevel[];
  tags: string[];
}

export interface CreateRecipeData {
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  source_url?: string;
  header_image_url?: string;
  cuisine_type?: CuisineType;
  meal_type?: MealType;
  difficulty?: DifficultyLevel;
  ingredients: Omit<Ingredient, 'id' | 'recipe_id' | 'created_at'>[];
  instructions: Omit<Instruction, 'id' | 'recipe_id' | 'created_at' | 'instruction_notes'>[];
  tags?: string[];
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}