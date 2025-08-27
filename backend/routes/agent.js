const express = require('express');
const AgentSuggestion = require('../models/AgentSuggestion');
const authMiddleware = require('../middleware/authMiddleware');
const { agentMiddleware } = require('../middleware/roleMiddleware');
const router = express.Router();

// Get agent suggestion for a ticket
router.get('/suggestion/:ticketId', authMiddleware, agentMiddleware, async (req, res, next) => {
  try {
    const suggestion = await AgentSuggestion.findOne({ 
      ticketId: req.params.ticketId 
    }).populate('articleIds', 'title body');

    if (!suggestion) {
      return res.status(404).json({ message: 'No suggestion found for this ticket' });
    }

    res.json(suggestion);
  } catch (error) {
    next(error);
  }
});

// Internal endpoint to trigger triage
router.post('/triage/:ticketId', authMiddleware, agentMiddleware, async (req, res, next) => {
  try {
    const TriageService = require('../services/triageService');
    const result = await TriageService.triageTicket(req.params.ticketId);
    
    res.json({ message: 'Triage completed', ...result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;