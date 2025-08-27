const { v4: uuidv4 } = require('uuid');
const Ticket = require('../models/Ticket');
const Article = require('../models/Article');
const AgentSuggestion = require('../models/AgentSuggestion');
const AuditLog = require('../models/AuditLog');
const Config = require('../models/Config');

class TriageService {
  static async triageTicket(ticketId) {
    const traceId = uuidv4();
    
    try {
      // Log start of triage
      await AuditLog.create({
        ticketId,
        traceId,
        actor: 'system',
        action: 'AUDIT_LOG_STARTED',
        meta: { traceId }
      });

      // Fetch the ticket
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error(`Ticket ${ticketId} not found`);
      }

      // Step 1: Classify the ticket
      const classification = await this.classifyTicket(ticket, traceId);
      await AuditLog.create({
        ticketId,
        traceId,
        actor: 'system',
        action: 'AGENT_CLASSIFIED',
        meta: classification
      });

      // Step 2: Retrieve relevant KB articles
      const articles = await this.retrieveKBArticles(ticket, classification, traceId);
      await AuditLog.create({
        ticketId,
        traceId,
        actor: 'system',
        action: 'KB_RETRIEVED',
        meta: { articleIds: articles.map(a => a._id) }
      });

      // Step 3: Draft a reply
      const draftResult = await this.draftReply(ticket, classification, articles, traceId);
      await AuditLog.create({
        ticketId,
        traceId,
        actor: 'system',
        action: 'DRAFT_GENERATED',
        meta: { draftPreview: draftResult.draftReply.substring(0, 100) + '...' }
      });

      // Step 4: Make decision and execute
      const decision = await this.makeDecision(ticket, classification, draftResult, traceId);
      
      return { success: true, traceId, decision };

    } catch (error) {
      // Log any errors during triage
      await AuditLog.create({
        ticketId,
        traceId,
        actor: 'system',
        action: 'TRIAGE_FAILED',
        meta: { error: error.message }
      });
      throw error;
    }
  }

  static async classifyTicket(ticket, traceId) {
    // Deterministic stub implementation
    const text = `${ticket.title} ${ticket.description}`.toLowerCase();
    
    const keywords = {
      billing: ['refund', 'invoice', 'charge', 'payment', 'bill', 'price', 'cost'],
      tech: ['error', 'bug', 'crash', 'login', 'password', 'technical', 'server', '500', '404'],
      shipping: ['delivery', 'shipment', 'tracking', 'package', 'order', 'arrive', 'late']
    };

    let predictedCategory = 'other';
    let confidence = 0.3; // Base confidence for 'other'
    let matches = 0;

    // Check each category for keyword matches
    for (const [category, words] of Object.entries(keywords)) {
      const categoryMatches = words.filter(word => text.includes(word)).length;
      if (categoryMatches > matches) {
        matches = categoryMatches;
        predictedCategory = category;
      }
    }

    // Calculate confidence based on matches
    if (matches > 0) {
      confidence = Math.min(0.3 + (matches * 0.2), 0.95); // 0.5, 0.7, 0.9, etc.
    }

    return {
      predictedCategory,
      confidence: parseFloat(confidence.toFixed(2))
    };
  }

  static async retrieveKBArticles(ticket, classification, traceId) {
    const searchText = `${ticket.title} ${ticket.description}`;
    
    // Use MongoDB text search if available, otherwise regex fallback
    let articles;
    
    try {
      articles = await Article.find(
        { 
          $text: { $search: searchText },
          status: 'published'
        },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(3);
    } catch (error) {
      // Fallback to simple regex search if text index isn't available
      const searchTerms = searchText.split(/\s+/).filter(term => term.length > 3);
      const regexPatterns = searchTerms.map(term => new RegExp(term, 'i'));
      
      articles = await Article.find({
        status: 'published',
        $or: [
          { title: { $in: regexPatterns } },
          { body: { $in: regexPatterns } },
          { tags: { $in: regexPatterns } }
        ]
      })
      .limit(3);
    }

    return articles;
  }

  static async draftReply(ticket, classification, articles, traceId) {
    // Simple template-based reply
    let draftReply = `Hi, thank you for contacting us about your issue: "${ticket.title}".\n\n`;

    if (articles.length > 0) {
      draftReply += "Based on our knowledge base, here are some articles that might help:\n";
      articles.forEach((article, index) => {
        draftReply += `${index + 1}) ${article.title}\n`;
      });
      draftReply += "\n";
    }

    draftReply += "Please let us know if this information helps resolve your issue. If you need further assistance, our support team will be happy to help.\n\n";
    draftReply += "Best regards,\nSupport Team";

    return {
      draftReply,
      citations: articles.map(article => article._id)
    };
  }

  static async makeDecision(ticket, classification, draftResult, traceId) {
    const config = await Config.getConfig();
    
    let decision;
    let autoClosed = false;

    if (config.autoCloseEnabled && classification.confidence >= config.confidenceThreshold) {
      // Auto-close the ticket
      await Ticket.findByIdAndUpdate(ticket._id, {
        status: 'resolved',
        updatedAt: Date.now()
      });

      // Create the agent suggestion
      const suggestion = await AgentSuggestion.create({
        ticketId: ticket._id,
        predictedCategory: classification.predictedCategory,
        articleIds: draftResult.citations,
        draftReply: draftResult.draftReply,
        confidence: classification.confidence,
        autoClosed: true,
        modelInfo: {
          provider: 'stub',
          model: 'deterministic-keyword-matcher',
          promptVersion: '1.0',
          latencyMs: 0
        }
      });

      // Update ticket with suggestion reference
      await Ticket.findByIdAndUpdate(ticket._id, {
        agentSuggestionId: suggestion._id
      });

      // Log auto-closure
      await AuditLog.create({
        ticketId: ticket._id,
        traceId,
        actor: 'system',
        action: 'AUTO_CLOSED',
        meta: { 
          confidence: classification.confidence,
          threshold: config.confidenceThreshold,
          suggestionId: suggestion._id
        }
      });

      decision = 'AUTO_CLOSED';
      autoClosed = true;

    } else {
      // Assign to human agent
      await Ticket.findByIdAndUpdate(ticket._id, {
        status: 'waiting_human',
        updatedAt: Date.now()
      });

      // Create the agent suggestion for human review
      const suggestion = await AgentSuggestion.create({
        ticketId: ticket._id,
        predictedCategory: classification.predictedCategory,
        articleIds: draftResult.citations,
        draftReply: draftResult.draftReply,
        confidence: classification.confidence,
        autoClosed: false,
        modelInfo: {
          provider: 'stub',
          model: 'deterministic-keyword-matcher',
          promptVersion: '1.0',
          latencyMs: 0
        }
      });

      // Update ticket with suggestion reference
      await Ticket.findByIdAndUpdate(ticket._id, {
        agentSuggestionId: suggestion._id
      });

      // Log human assignment
      await AuditLog.create({
        ticketId: ticket._id,
        traceId,
        actor: 'system',
        action: 'ASSIGNED_TO_HUMAN',
        meta: { 
          confidence: classification.confidence,
          threshold: config.confidenceThreshold,
          suggestionId: suggestion._id
        }
      });

      decision = 'ASSIGNED_TO_HUMAN';
      autoClosed = false;
    }

    return { decision, autoClosed };
  }
}

module.exports = TriageService;