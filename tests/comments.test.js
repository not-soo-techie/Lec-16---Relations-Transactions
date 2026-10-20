import { request, app, prisma, user, post, comment, ok, fail } from "./helpers.js";

describe("Comments", () => {
  test("C01 creates a comment", async () => {
    const author = await user(); const postAuthor = await user(); const p = await post(postAuthor.id, "Post");
    const r = await request(app).post("/api/comments").send({ content: "Great!", authorId: author.id, postId: p.id });
    ok(r, 201); expect(r.body.data.content).toBe("Great!");
  });

  test.each([
    ["C02 missing content", (u,p) => ({ authorId:u.id, postId:p.id })],
    ["C03 missing authorId", (_u,p) => ({ content:"x", postId:p.id })],
    ["C04 missing postId", (u) => ({ content:"x", authorId:u.id })]
  ])("%s", async (_name, makeBody) => {
    const u = await user(); const pu = await user(); const p = await post(pu.id, "Post");
    fail(await request(app).post("/api/comments").send(makeBody(u,p)), 400);
  });

  test("C05 rejects nonexistent author", async () => {
    const pu = await user(); const p = await post(pu.id, "Post");
    fail(await request(app).post("/api/comments").send({ content:"x", authorId:99999999, postId:p.id }), 404);
  });

  test("C06 rejects nonexistent post", async () => {
    const u = await user();
    fail(await request(app).post("/api/comments").send({ content:"x", authorId:u.id, postId:99999999 }), 404);
  });

  test("C07 gets all comments", async () => {
    const u = await user(); const pu = await user(); const p = await post(pu.id, "Post");
    await comment(u.id,p.id,"one"); await comment(u.id,p.id,"two");
    const r = await request(app).get("/api/comments"); ok(r); expect(r.body.data).toHaveLength(2);
  });

  test("C08 empty comments list is empty", async () => {
    const r = await request(app).get("/api/comments"); ok(r); expect(r.body.data).toEqual([]);
  });

  test("C09 filters comments by postId", async () => {
    const u = await user(); const pu = await user(); const p1 = await post(pu.id,"one"); const p2 = await post(pu.id,"two");
    await comment(u.id,p1.id,"first"); await comment(u.id,p2.id,"second");
    const r = await request(app).get(`/api/comments?postId=${p1.id}`); ok(r);
    expect(r.body.data).toHaveLength(1); expect(r.body.data[0].postId).toBe(p1.id);
  });

  test("C10 includes comment author", async () => {
    const u = await user({ username:"commenter", email:"commenter@example.com" });
    const pu = await user(); const p = await post(pu.id,"Post"); await comment(u.id,p.id,"Hello");
    const r = await request(app).get(`/api/comments?postId=${p.id}`); ok(r);
    expect(r.body.data[0].author.username).toBe("commenter");
  });

  test("C11 includes associated post", async () => {
    const u = await user(); const pu = await user(); const p = await post(pu.id,"Post"); await comment(u.id,p.id,"Hello");
    const r = await request(app).get(`/api/comments?postId=${p.id}`); ok(r);
    expect(r.body.data[0].post.id).toBe(p.id);
  });

  test("C12 updates comment content", async () => {
    const u = await user(); const pu = await user(); const p = await post(pu.id,"Post"); const c = await comment(u.id,p.id,"old");
    const r = await request(app).patch(`/api/comments/${c.id}`).send({ content:"new" }); ok(r);
    expect(r.body.data.content).toBe("new");
  });

  test("C13 missing comment cannot be updated", async () => {
    fail(await request(app).patch("/api/comments/99999999").send({ content:"new" }), 404);
  });

  test("C14 deletes comment", async () => {
    const u = await user(); const pu = await user(); const p = await post(pu.id,"Post"); const c = await comment(u.id,p.id,"delete");
    const r = await request(app).delete(`/api/comments/${c.id}`); ok(r);
    expect(await prisma.comment.findUnique({ where: { id: c.id } })).toBeNull();
  });

  test("C15 missing comment cannot be deleted", async () => {
    fail(await request(app).delete("/api/comments/99999999"), 404);
  });
});
