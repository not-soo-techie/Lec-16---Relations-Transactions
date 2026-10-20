import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/db.js";

export { request, app, prisma };

export async function resetDb() {
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
}

export async function user(data = {}) {
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return prisma.user.create({ data: {
    username: `user_${suffix}`,
    email: `user_${suffix}@example.com`,
    ...data
  }});
}

export async function post(authorId, caption) {
  return prisma.post.create({ data: { authorId, caption } });
}

export async function comment(authorId, postId, content) {
  return prisma.comment.create({ data: { authorId, postId, content } });
}

export async function like(userId, postId) {
  return prisma.like.create({ data: { userId, postId } });
}

export async function socialFixture() {
  const rahul = await user({ username: "rahul", email: "rahul@example.com" });
  const priya = await user({ username: "priya", email: "priya@example.com" });
  const aman = await user({ username: "aman", email: "aman@example.com" });
  const p1 = await post(rahul.id, "Learning Prisma");
  const p2 = await post(rahul.id, "Hello World");
  const p3 = await post(priya.id, "Prisma Relations");
  const p4 = await post(aman.id, "Weekend Photos");
  await comment(priya.id, p1.id, "Great post");
  await comment(aman.id, p1.id, "Learning a lot");
  await comment(rahul.id, p3.id, "Prisma is helpful");
  await comment(priya.id, p4.id, "Beautiful photos");
  await like(priya.id, p1.id);
  await like(aman.id, p1.id);
  await like(aman.id, p3.id);
  await like(rahul.id, p2.id);
  return { users: { rahul, priya, aman }, posts: { p1, p2, p3, p4 } };
}

export function ok(res, status = 200) {
  expect(res.status).toBe(status);
  expect(res.body.success).toBe(true);
}

export function fail(res, status) {
  expect(res.status).toBe(status);
  expect(res.body.success).toBe(false);
}

beforeEach(async () => resetDb());
afterEach(async () => resetDb());
afterAll(async () => { await prisma.$disconnect(); });
