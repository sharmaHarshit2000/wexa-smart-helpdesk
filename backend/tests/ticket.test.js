const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");
const Ticket = require("../models/Ticket");

let token;

describe("Ticket API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST || "mongodb://localhost:27017/wexa-test");
    await User.deleteMany();
    const user = await User.create({ name: "User1", email: "u1@test.com", password: "pass123" });
    token = "Bearer " + require("jsonwebtoken").sign({ id: user._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("should create a new ticket", async () => {
    const res = await request(app)
      .post("/api/tickets")
      .set("Authorization", token)
      .send({ title: "App crash", description: "It crashes on login", category: "tech" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("title", "App crash");
    expect(res.body).toHaveProperty("createdBy");
  });

  it("should fetch audit logs for the created ticket", async () => {
    const ticket = await Ticket.findOne({ title: "App crash" });
    const res = await request(app)
      .get(`/api/tickets/${ticket._id}/audit`)
      .set("Authorization", token);

    expect(res.statusCode).toBe(200);
    expect(res.body.some(log => log.action === "TICKET_CREATED")).toBe(true);
  });
});
