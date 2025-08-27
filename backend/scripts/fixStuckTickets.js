const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const TriageService = require('../services/triageService');

async function fixStuckTickets() {
  try {
    const mongoURI = 'mongodb://localhost:27017/wexa';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    const stuckTickets = await Ticket.find({
      status: 'open',
      agentSuggestionId: { $exists: false },
      createdAt: { $lt: new Date(Date.now() - 2 * 60 * 1000) } 
    });
    
    console.log(`Found ${stuckTickets.length} stuck tickets`);
    
    for (const ticket of stuckTickets) {
      console.log(`Processing stuck ticket: ${ticket._id} - "${ticket.title}"`);
      try {
        await TriageService.triageTicket(ticket._id);
        console.log(` Fixed ticket: ${ticket._id}`);
      } catch (error) {
        console.error(`Failed to fix ticket ${ticket._id}:`, error.message);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing stuck tickets:', error);
    process.exit(1);
  }
}

fixStuckTickets();