const express = require('express');
const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const authMiddleware = require('../middleware/authMiddleware');
const { agentMiddleware } = require('../middleware/roleMiddleware');
const { validateTicket } = require('../middleware/validationMiddleware');
const TriageService = require('../services/triageService');

const router = express.Router();

// Get all tickets (with filters)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status, category, myTickets } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (myTickets === 'true' && req.user.role === 'user') {
      filter.createdBy = req.user._id;
    }

    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(tickets);
  } catch (error) {
    next(error);
  }
});

// Create ticket 
router.post('/', authMiddleware, validateTicket, async (req, res, next) => {
  try {
    const ticket = await Ticket.create({
      ...req.body,
      createdBy: req.user._id
    });

    // Log the ticket creation
    await AuditLog.create({
      ticketId: ticket._id,
      traceId: `trace-${Date.now()}`,
      actor: 'user',
      action: 'TICKET_CREATED',
      meta: { userId: req.user._id }
    });

    // Start the agentic triage process 
    TriageService.triageTicket(ticket._id)
      .then(result => {
        console.log(`Triage completed for ticket ${ticket._id}: ${result.decision}`);
      })
      .catch(error => {
        console.error(`Triage failed for ticket ${ticket._id}:`, error);
      });

    // Populate createdBy for response
    await ticket.populate('createdBy', 'name email');

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

// Get single ticket
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email')
      .select('-__v');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user has access to this ticket
    if (req.user.role === 'user' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

// Get audit logs for a ticket
router.get('/:id/audit', authMiddleware, async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user has access to this ticket
    if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const auditLogs = await AuditLog.find({ ticketId: req.params.id })
      .sort({ timestamp: 1 })
      .select('-__v');

    res.json(auditLogs);
  } catch (error) {
    next(error);
  }
});

// Send reply (agent only) 
router.post('/:id/reply', authMiddleware, agentMiddleware, async (req, res, next) => {
  try {
    const { reply } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.status !== 'waiting_human') {
      return res.status(400).json({ message: 'Ticket is not waiting for human response' });
    }

    // Update ticket with reply and mark as resolved
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        updatedAt: Date.now()
      },
      { new: true }
    );

    // Log the reply event
    await AuditLog.create({
      ticketId: req.params.id,
      traceId: `trace-${Date.now()}`,
      actor: 'agent',
      action: 'REPLY_SENT',
      meta: {
        agentId: req.user._id,
        replyPreview: reply.substring(0, 100) + (reply.length > 100 ? '...' : '')
      }
    });

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
});

module.exports = router;