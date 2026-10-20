import { request, app, prisma, user, post, like, ok, fail } from "./helpers.js";

describe("Users", () => {
  test("U01 creates a user", async () => {
    const r = await request(app).post("/api/users").send({ username: "rahul", email: "rahul@example.com" });
    ok(r, 201); expect(r.body.data.username).toBe("rahul");
  });

  test.each([
    ["U02 missing username", { email: "x@example.com" }],
    ["U03 missing email", { username: "x" }],
    ["U04 both missing", {}]
  ])("%s", async (_name, body) => {
    const r = await request(app).post("/api/users").send(body);
    fail(r, 400); expect(await prisma.user.count()).toBe(0);
  });

  test("U05 duplicate username rejected", async () => {
    await user({ username: "rahul", email: "one@example.com" });
    const r = await request(app).post("/api/users").send({ username: "rahul", email: "two@example.com" });
    expect([400, 409]).toContain(r.status); expect(await prisma.user.count()).toBe(1);
  });

  test("U06 duplicate email rejected", async () => {
    await user({ username: "one", email: "same@example.com" });
    const r = await request(app).post("/api/users").send({ username: "two", email: "same@example.com" });
    expect([400, 409]).toContain(r.status); expect(await prisma.user.count()).toBe(1);
  });

  test("U07 gets all users", async () => {
    await user(); await user();
    const r = await request(app).get("/api/users"); ok(r);
    expect(r.body.data).toHaveLength(2);
  });

  test("U08 empty users list is an empty array", async () => {
    const r = await request(app).get("/api/users"); ok(r); expect(r.body.data).toEqual([]);
  });

  test("U10 gets user by ID", async () => {
    const u = await user(); const r = await request(app).get(`/api/users/${u.id}`);
    ok(r); expect(r.body.data.id).toBe(u.id);
  });

  test("U11 unknown user returns 404", async () => {
    fail(await request(app).get("/api/users/99999999"), 404);
  });

  test("U13 updates username", async () => {
    const u = await user({ username: "old" });
    const r = await request(app).patch(`/api/users/${u.id}`).send({ username: "new" });
    ok(r); expect(r.body.data.username).toBe("new");
  });

  test("U14 updates email", async () => {
    const u = await user();
    const r = await request(app).patch(`/api/users/${u.id}`).send({ email: "new@example.com" });
    ok(r); expect(r.body.data.email).toBe("new@example.com");
  });

  test("U15 rejects duplicate username on update", async () => {
    await user({ username: "taken", email: "taken@example.com" });
    const u = await user({ username: "free", email: "free@example.com" });
    const r = await request(app).patch(`/api/users/${u.id}`).send({ username: "taken" });
    expect([400, 409]).toContain(r.status);
  });

  test("U16 rejects duplicate email on update", async () => {
    await user({ username: "taken", email: "taken@example.com" });
    const u = await user({ username: "free", email: "free@example.com" });
    const r = await request(app).patch(`/api/users/${u.id}`).send({ email: "taken@example.com" });
    expect([400, 409]).toContain(r.status);
  });

  test("U17 unknown user cannot be updated", async () => {
    fail(await request(app).patch("/api/users/99999999").send({ username: "x" }), 404);
  });

  test("U18 deletes an existing user without relations", async () => {
    const u = await user(); const r = await request(app).delete(`/api/users/${u.id}`);
    ok(r); expect(await prisma.user.findUnique({ where: { id: u.id } })).toBeNull();
  });

  test("U19 unknown user cannot be deleted", async () => {
    fail(await request(app).delete("/api/users/99999999"), 404);
  });

  test("U20 gets posts created by a user", async () => {
    const u = await user(); await post(u.id, "one"); await post(u.id, "two");
    const r = await request(app).get(`/api/users/${u.id}/posts`); ok(r);
    expect(r.body.data).toHaveLength(2);
    expect(r.body.data.every(p => p.authorId === u.id)).toBe(true);
  });

  test("U21 user with no posts gets an empty array", async () => {
    const u = await user(); const r = await request(app).get(`/api/users/${u.id}/posts`);
    ok(r); expect(r.body.data).toEqual([]);
  });

  test("U22 gets posts liked by a user", async () => {
    const u = await user(); const author = await user(); const p = await post(author.id, "liked");
    await like(u.id, p.id);
    const r = await request(app).get(`/api/users/${u.id}/liked-posts`); ok(r);
    expect(r.body.data.map(x => x.id)).toContain(p.id);
  });

  test("U23 user with no likes gets an empty array", async () => {
    const u = await user(); const r = await request(app).get(`/api/users/${u.id}/liked-posts`);
    ok(r); expect(r.body.data).toEqual([]);
  });
});
