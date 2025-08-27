const express = require('express');
const Article = require('../models/Article');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/roleMiddleware');
const { validateArticle } = require('../middleware/validationMiddleware');
const router = express.Router();

// Get all articles (with search)
router.get('/', async (req, res, next) => {
  try {
    const { query, status } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (query) {
      filter.$text = { $search: query };
    }

    const articles = await Article.find(filter)
      .sort({ updatedAt: -1 })
      .select('-__v');

    res.json(articles);
  } catch (error) {
    next(error);
  }
});

// Create article (admin only)
router.post('/', authMiddleware, adminMiddleware, validateArticle, async (req, res, next) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    next(error);
  }
});

// Update article (admin only)
router.put('/:id', authMiddleware, adminMiddleware, validateArticle, async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    next(error);
  }
});

// Delete article (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    next(error);
  }
});



router.get('/articles', async (req, res, next) => {
  try {
    const { query, status } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (query) filter.$text = { $search: query };

    const articles = await Article.find(filter)
      .sort({ updatedAt: -1 })
      .select('-__v');

    res.json(articles);
  } catch (error) {
    next(error);
  }
});

module.exports = router;