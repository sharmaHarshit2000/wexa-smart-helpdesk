const { classifyTicket, makeDecision } = require("../services/agentService.js");

describe("Agent Service", () => {
  it("should classify ticket with high confidence for login issues", () => {
    const ticket = {
      title: "Cannot login to account",
      description: "Getting error 500 when trying to login"
    };

    const result = classifyTicket(ticket);
    expect(result.confidence).toBeGreaterThan(0.7);
    expect(result.category).toBe("tech");
  });

  it("should auto-close high confidence tickets", () => {
    const decision = makeDecision(0.9, 0.78);
    expect(decision.autoClose).toBe(true);
  });

  it("should assign low confidence tickets to human", () => {
    const decision = makeDecision(0.5, 0.78);
    expect(decision.autoClose).toBe(false);
  });
});
