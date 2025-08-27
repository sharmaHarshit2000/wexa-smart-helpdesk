const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");
const Ticket = require("../models/Ticket");

jest.setTimeout(30000); // 30 seconds

describe("Triage API", () => {
  let token;
  let ticketId;

  beforeAll(async () => {
    // Connect to test DB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URI_TEST || "mongodb://localhost:27017/wexa-test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Clean test DB
    await User.deleteMany({});
    await Ticket.deleteMany({});

    // Register agent user
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "Agent1", email: "agent@test.com", password: "pass123", role: "agent" });
    expect(registerRes.statusCode).toBe(201);

    // Login agent to get token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "agent@test.com", password: "pass123" });
    expect(loginRes.statusCode).toBe(200);
    token = loginRes.body.token;

    // Create test ticket
    const agent = await User.findOne({ email: "agent@test.com" });
    const ticket = await Ticket.create({
      title: "Login issue",
      description: "Can't login",
      createdBy: agent._id,
    });
    ticketId = ticket._id;
  });

  afterAll(async () => {
    // Drop DB and close connection safely
    if (mongoose.connection.readyState) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  });

  it("should run triage and return decision", async () => {
    const res = await request(app)
      .post(`/api/agent/triage/${ticketId}`)
      .set("Authorization", `Bearer ${token}`);

    console.log(res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("decision");
    expect(["AUTO_CLOSED", "ASSIGNED_TO_HUMAN"]).toContain(res.body.decision.decision);
  });
});
