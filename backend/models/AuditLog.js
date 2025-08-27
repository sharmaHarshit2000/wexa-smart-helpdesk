const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  traceId: {
    type: String,
    required: true
  },
  actor: {
    type: String,
    enum: ['system', 'agent', 'user'],
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'TICKET_CREATED',
      'AUDIT_LOG_STARTED', 
      'AGENT_CLASSIFIED',
      'KB_RETRIEVED', 
      'DRAFT_GENERATED',
      'AUTO_CLOSED',
      'ASSIGNED_TO_HUMAN',
      'REPLY_SENT',
      'TRIAGE_FAILED'
    ]
  },
  meta: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);