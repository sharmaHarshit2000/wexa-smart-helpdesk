const express = require('express');
const Config = require('../models/Config');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/roleMiddleware');
const { validateConfig } = require('../middleware/validationMiddleware');
const router = express.Router();

// Get config
router.get('/', async (req, res, next) => {
  try {
    const config = await Config.getConfig();
    res.json(config);
  } catch (error) {
    next(error);
  }
});

// Update config (admin only)
router.put('/', authMiddleware, adminMiddleware, validateConfig, async (req, res, next) => {
  try {
    let config = await Config.findOne();
    
    if (!config) {
      config = await Config.create(req.body);
    } else {
      config = await Config.findOneAndUpdate(
        {},
        req.body,
        { new: true, runValidators: true }
      );
    }

    res.json(config);
  } catch (error) {
    next(error);
  }
});

module.exports = router;