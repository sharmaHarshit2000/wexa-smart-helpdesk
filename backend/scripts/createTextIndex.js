const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' }); 

async function createTextIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Create text index for articles
    const Article = require('../models/Article');
    await Article.createIndexes();
    console.log('Text index created for articles');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating text index:', error);
    process.exit(1);
  }
}

createTextIndex();
