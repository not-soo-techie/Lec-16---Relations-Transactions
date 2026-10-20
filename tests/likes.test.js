import { request, app, prisma, user, post, like, ok, fail } from "./helpers.js";

describe("Likes", () => {
  test("L01 creates a like", async () => {
    const u = await user(); const author = await user(); const p = await post(author.id, "Post");
    const r = await request(app).post(`/api/posts/${p.id}/likes`).send({ userId: u.id });
    ok(r, 201); expect(await prisma.like.count({ where: { userId:u.id, postId:p.id } })).toBe(1);
  });

  test("L02 rejects missing userId", async () => {
    const author = await user(); const p = await post(author.id, "Post");
    fail(await request(app).post(`/api/posts/${p.id}/likes`).send({}), 400);
  });

  test("L03 rejects nonexistent post", async () => {
    const u = await user();
    fail(await request(app).post("/api/posts/99999999/likes").send({ userId:u.id }), 404);
  });

  test("L04 rejects nonexistent user", async () => {
    const author = await user(); const p = await post(author.id, "Post");
    fail(await request(app).post(`/api/posts/${p.id}/likes`).send({ userId:99999999 }), 404);
  });

  test("L05 rejects duplicate like", async () => {
    const u = await user(); const author = await user(); const p = await post(author.id, "Post"); await like(u.id,p.id);
    const r = await request(app).post(`/api/posts/${p.id}/likes`).send({ userId:u.id });
    expect([400,409]).toContain(r.status);
    expect(await prisma.like.count({ where:{ userId:u.id, postId:p.id } })).toBe(1);
  });

  test("L06 one user can like different posts", async () => {
    const u = await user(); const author = await user(); const p1 = await post(author.id,"one"); const p2 = await post(author.id,"two");
    await like(u.id,p1.id);
    const r = await request(app).post(`/api/posts/${p2.id}/likes`).send({ userId:u.id }); ok(r,201);
    expect(await prisma.like.count({ where:{ userId:u.id } })).toBe(2);
  });

  test("L07 deletes an existing like", async () => {
    const u = await user(); const author = await user(); const p = await post(author.id,"Post"); await like(u.id,p.id);
    const r = await request(app).delete(`/api/posts/${p.id}/likes/${u.id}`); ok(r);
    expect(await prisma.like.count({ where:{ userId:u.id, postId:p.id } })).toBe(0);
  });

  test("L08 returns 404 when like does not exist", async () => {
    const u = await user(); const author = await user(); const p = await post(author.id,"Post");
    fail(await request(app).delete(`/api/posts/${p.id}/likes/${u.id}`),404);
  });

  test("L09 deletes only the requested user-post like", async () => {
    const u1 = await user(); const u2 = await user(); const author = await user(); const p = await post(author.id,"Post");
    await like(u1.id,p.id); await like(u2.id,p.id);
    const r = await request(app).delete(`/api/posts/${p.id}/likes/${u1.id}`); ok(r);
    expect(await prisma.like.count({ where:{ userId:u1.id, postId:p.id } })).toBe(0);
    expect(await prisma.like.count({ where:{ userId:u2.id, postId:p.id } })).toBe(1);
  });

  test("L10 unliking leaves the post intact", async () => {
    const u = await user(); const author = await user(); const p = await post(author.id,"Post"); await like(u.id,p.id);
    await request(app).delete(`/api/posts/${p.id}/likes/${u.id}`);
    expect(await prisma.post.findUnique({ where:{ id:p.id } })).not.toBeNull();
  });

  test("L11 unliking leaves the user intact", async () => {
    const u = await user(); const author = await user(); const p = await post(author.id,"Post"); await like(u.id,p.id);
    await request(app).delete(`/api/posts/${p.id}/likes/${u.id}`);
    expect(await prisma.user.findUnique({ where:{ id:u.id } })).not.toBeNull();
  });
});
