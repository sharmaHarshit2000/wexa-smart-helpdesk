function classifyTicket(ticket) {
  if (/login/i.test(ticket.title) || /login/i.test(ticket.description)) {
    return { category: "tech", confidence: 0.9 };
  }
  return { category: "general", confidence: 0.5 };
}

function makeDecision(confidence, threshold) {
  return { autoClose: confidence > threshold };
}

module.exports = { classifyTicket, makeDecision };
