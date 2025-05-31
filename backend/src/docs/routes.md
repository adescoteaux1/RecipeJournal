# Recipe Tracker Backend Setup

## 1. Initialize the Repository

```bash
mkdir recipe-tracker-backend
cd recipe-tracker-backend
npm init -y
```

## 2. Install Dependencies

```bash
# Core dependencies
npm install express cors helmet morgan dotenv
npm install @supabase/supabase-js

# For recipe parsing
npm install cheerio axios

# Development dependencies
npm install -D nodemon typescript @types/node @types/express
npm install -D @types/cors @types/morgan
```

## 3. Project Structure

```
recipe-tracker-backend/
├── src/
│   ├── config/
│   │   └── supabase.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── recipeController.js
│   │   ├── commentController.js
│   │   └── parserController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── recipeRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── parserRoutes.js
│   │   └── tagRoutes.js
│   ├── services/
│   │   └── recipeParser.js
│   ├── utils/
│   │   └── tagUtils.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## 4. Database Schema (Supabase)

```sql
-- Users table (handled by Supabase Auth)

-- Recipes table
CREATE TABLE recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  source_url TEXT,
  header_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients table
CREATE TABLE ingredients (
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
CREATE TABLE instructions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe edits tracking
CREATE TABLE recipe_edits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  field_changed VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe makes (when user made the recipe)
CREATE TABLE recipe_makes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  made_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT
);

-- Recipe comments
CREATE TABLE recipe_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Line-specific notes
CREATE TABLE instruction_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  instruction_id UUID REFERENCES instructions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe images
CREATE TABLE recipe_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE instruction_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example for recipes table)
CREATE POLICY "Users can view their own recipes" ON recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);
```

## 5. Environment Variables (.env)

```
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## 6. API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user

### Recipes
- `GET /api/recipes` - Get all user's recipes (with filtering)
- `GET /api/recipes/:id` - Get single recipe with all details
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `GET /api/recipes/:id/history` - Get edit history
- `GET /api/recipes/filters` - Get filter options

### Recipe Interactions
- `POST /api/recipes/:id/make` - Record making a recipe
- `GET /api/recipes/:id/makes` - Get all times recipe was made
- `POST /api/recipes/:id/comments` - Add comment to recipe
- `GET /api/recipes/:id/comments` - Get recipe comments
- `POST /api/instructions/:id/notes` - Add note to instruction line
- `GET /api/recipes/:id/notes` - Get all notes for a recipe
- `PUT /api/recipes/:id/tags` - Update recipe tags

### Images
- `POST /api/recipes/:id/images` - Upload image to recipe
- `DELETE /api/images/:id` - Delete image
- `PUT /api/recipes/:id/primary-image` - Set primary image

### Recipe Parser
- `POST /api/parser/parse-url` - Parse recipe from URL
- `POST /api/parser/analyze-text` - Parse recipe from pasted text

### Tags
- `GET /api/tags` - Get all tags (paginated)
- `GET /api/tags/popular` - Get popular tags
- `GET /api/tags/search?q=query` - Search tags
- `GET /api/tags/my-tags` - Get user's tags
- `POST /api/tags/suggest` - Suggest tags for recipe content

## 7. Basic Server Setup (src/server.js)

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const parserRoutes = require('./routes/parserRoutes');
const tagRoutes = require('./routes/tagRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api', commentRoutes);
app.use('/api/parser', parserRoutes);
app.use('/api/tags', tagRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

## 8. Supabase Config (src/config/supabase.js)

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Client for authenticated requests
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for service-level operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase, supabaseAdmin };
```

## 9. Package.json Scripts

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  }
}
```

## 10. Steps

1. Set up Supabase project and get credentials
2. Run database migrations in Supabase
3. Implement authentication middleware
4. Build out controllers for each endpoint
5. Implement recipe parsing service
6. Add input validation
7. Set up error handling
8. Add tests
9. Deploy to hosting service (Heroku, Railway, etc.)