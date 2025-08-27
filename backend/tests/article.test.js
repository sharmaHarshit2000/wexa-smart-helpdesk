const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const Article = require("../models/Article");

describe("Article API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST || "mongodb://localhost:27017/wexa-test");
    await Article.deleteMany();
    await Article.create([
      { title: "How to reset password", body: "Steps to reset", tags: ["password"], status: "published" },
      { title: "How to change email", body: "Steps to change", tags: ["email"], status: "published" }
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("should return articles matching search query", async () => {
    const res = await request(app).get("/api/kb/articles").query({ query: "password" });

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toMatch(/reset password/i);
  });
});
