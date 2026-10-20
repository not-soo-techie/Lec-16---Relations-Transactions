import {
  request,
  app,
  prisma,
  user,
  post,
  comment,
  like,
  socialFixture,
  ok,
  fail,
} from "./helpers.js";

describe("Posts", () => {
  test("P01 creates a post for an existing author", async () => {
    const u = await user();
    const r = await request(app)
      .post("/api/posts")
      .send({ caption: "My post", authorId: u.id });
    ok(r, 201);
    expect(r.body.data.caption).toBe("My post");
  });

  test.each([
    ["P02 missing caption", (u) => ({ authorId: u.id })],
    ["P03 missing authorId", (_u) => ({ caption: "Caption" })],
    ["P04 both missing", (_u) => ({})],
  ])("%s", async (_name, bodyFor) => {
    const u = await user();
    const r = await request(app).post("/api/posts").send(bodyFor(u));
    fail(r, 400);
  });

  test("P05 rejects a nonexistent author", async () => {
    fail(
      await request(app)
        .post("/api/posts")
        .send({ caption: "x", authorId: 99999999 }),
      404,
    );
  });

  test("P06 gets all posts", async () => {
    const u = await user();
    await post(u.id, "one");
    await post(u.id, "two");
    const r = await request(app).get("/api/posts");
    ok(r);
    expect(r.body.data).toHaveLength(2);
  });


  test("P07 empty posts list is an empty array", async () => {
    const r = await request(app).get("/api/posts");
    ok(r);
    expect(r.body.data).toEqual([]);
  });

  test("P08 includes post author", async () => {
    const f = await socialFixture();
    const r = await request(app).get("/api/posts");
    ok(r);
    expect(
      r.body.data.find((p) => p.id === f.posts.p1.id).author.username,
    ).toBe("rahul");
  });


  test("P09 includes comments", async () => {
    const f = await socialFixture();
    const r = await request(app).get("/api/posts");
    ok(r);
    expect(
      r.body.data.find((p) => p.id === f.posts.p1.id).comments,
    ).toHaveLength(2);
  });

  test("P10 includes likes", async () => {
    const f = await socialFixture();
    const r = await request(app).get("/api/posts");
    ok(r);
    expect(r.body.data.find((p) => p.id === f.posts.p1.id).likes).toHaveLength(
      2,
    );
  });

  test("P11 filters by authorId only", async () => {
    const f = await socialFixture();
    const r = await request(app).get(`/api/posts?authorId=${f.users.rahul.id}`);
    ok(r);
    expect(r.body.data.map((p) => p.id).sort()).toEqual(
      [f.posts.p1.id, f.posts.p2.id].sort(),
    );
  });

  test("P12 filters caption with q", async () => {
    const f = await socialFixture();
    const r = await request(app).get("/api/posts?q=Learning");
    ok(r);
    expect(r.body.data.map((p) => p.id)).toEqual([f.posts.p1.id]);
  });

  test("P13 caption q search is case-insensitive", async () => {
    const f = await socialFixture();
    const r = await request(app).get("/api/posts?q=PRISMA");
    ok(r);
    expect(r.body.data.map((p) => p.id).sort()).toEqual(
      [f.posts.p1.id, f.posts.p3.id].sort(),
    );
  });

  test("P14 unmatched caption search returns empty array", async () => {
    await socialFixture();
    const r = await request(app).get("/api/posts?q=nomatch");
    ok(r);
    expect(r.body.data).toEqual([]);
  });

  test("P15 filters posts liked by user", async () => {
    const f = await socialFixture();
    const r = await request(app).get(
      `/api/posts?likedByUserId=${f.users.priya.id}`,
    );
    ok(r);
    expect(r.body.data.map((p) => p.id)).toEqual([f.posts.p1.id]);
  });

  test("P16 hasComments=true uses relation existence", async () => {
    const f = await socialFixture();
    const r = await request(app).get("/api/posts?hasComments=true");
    ok(r);
    const ids = r.body.data.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([f.posts.p1.id, f.posts.p3.id, f.posts.p4.id]),
    );
    expect(ids).not.toContain(f.posts.p2.id);
  });

  test("P17 hasComments=false returns posts with no comments", async () => {
    const f = await socialFixture();
    const r = await request(app).get("/api/posts?hasComments=false");
    ok(r);
    expect(r.body.data.map((p) => p.id)).toEqual([f.posts.p2.id]);
  });

  test("P18 q searches caption OR author username (extension)", async () => {
    const f = await socialFixture();
    const r = await request(app).get("/api/posts?q=rahul");
    ok(r);
    expect(r.body.data.map((p) => p.id).sort()).toEqual(
      [f.posts.p1.id, f.posts.p2.id].sort(),
    );
  });

  test("P19 excludeCaption excludes matching captions (extension)", async () => {
    const f = await socialFixture();
    const r = await request(app).get("/api/posts?excludeCaption=Hello");
    ok(r);
    expect(r.body.data.map((p) => p.id)).not.toContain(f.posts.p2.id);
  });

  test("P20 filters by authorUsername (extension)", async () => {
    const f = await socialFixture();
    const r = await request(app).get("/api/posts?authorUsername=rahul");
    ok(r);
    expect(r.body.data.map((p) => p.id).sort()).toEqual(
      [f.posts.p1.id, f.posts.p2.id].sort(),
    );
  });

  test("P21 excludes authorUsername (extension)", async () => {
    const f = await socialFixture();
    const r = await request(app).get("/api/posts?excludeAuthorUsername=rahul");
    ok(r);
    expect(r.body.data.map((p) => p.id)).not.toEqual(
      expect.arrayContaining([f.posts.p1.id, f.posts.p2.id]),
    );
  });

  test("P22 filters by related comment content (extension)", async () => {
    const f = await socialFixture();
    const r = await request(app).get("/api/posts?commentContains=helpful");
    ok(r);
    expect(r.body.data.map((p) => p.id)).toEqual([f.posts.p3.id]);
  });

  test("P23 everyCommentContains rejects a post with a nonmatching comment", async () => {
    const f = await socialFixture();
    const r = await request(app).get(
      "/api/posts?everyCommentContains=Great&hasComments=true",
    );
    ok(r);
    expect(r.body.data.map((p) => p.id)).not.toContain(f.posts.p1.id);
  });

  test("P24 sorts by ID ascending", async () => {
    const u = await user();
    await post(u.id, "a");
    await post(u.id, "b");
    await post(u.id, "c");
    const r = await request(app).get("/api/posts?sortBy=id&order=asc");
    ok(r);
    const ids = r.body.data.map((p) => p.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  test("P25 sorts captions ascending", async () => {
    const u = await user();
    await post(u.id, "Zebra");
    await post(u.id, "Apple");
    await post(u.id, "Mango");
    const r = await request(app).get("/api/posts?sortBy=caption&order=asc");
    ok(r);
    const captions = r.body.data.map((p) => p.caption);
    expect(captions).toEqual([...captions].sort((a, b) => a.localeCompare(b)));
  });

  test("P26 applies limit", async () => {
    const u = await user();
    for (let i = 0; i < 5; i++) await post(u.id, `post ${i}`);
    const r = await request(app).get("/api/posts?limit=2&sortBy=id&order=asc");
    ok(r);
    expect(r.body.data).toHaveLength(2);
  });

  test("P27 page 2 does not overlap page 1", async () => {
    const u = await user();
    for (let i = 0; i < 5; i++) await post(u.id, `post ${i}`);
    const a = await request(app).get(
      "/api/posts?page=1&limit=2&sortBy=id&order=asc",
    );
    const b = await request(app).get(
      "/api/posts?page=2&limit=2&sortBy=id&order=asc",
    );
    ok(b);
    expect(b.body.data).toHaveLength(2);
    expect(
      b.body.data.some((p) => a.body.data.map((x) => x.id).includes(p.id)),
    ).toBe(false);
  });

  test("P28 page beyond end returns empty array", async () => {
    const u = await user();
    await post(u.id, "only");
    const r = await request(app).get("/api/posts?page=10&limit=2");
    ok(r);
    expect(r.body.data).toEqual([]);
  });

  test("P29 gets one post with nested author, comments and likes", async () => {
    const f = await socialFixture();
    const r = await request(app).get(`/api/posts/${f.posts.p1.id}`);
    ok(r);
    expect(r.body.data.author.username).toBe("rahul");
    expect(r.body.data.comments).toHaveLength(2);
    expect(r.body.data.likes).toHaveLength(2);
  });

  test("P30 unknown post returns 404", async () => {
    fail(await request(app).get("/api/posts/99999999"), 404);
  });

  test("P31 updates caption", async () => {
    const u = await user();
    const p = await post(u.id, "old");
    const r = await request(app)
      .patch(`/api/posts/${p.id}`)
      .send({ caption: "new" });
    ok(r);
    expect(r.body.data.caption).toBe("new");
  });

  test("P32 missing post cannot be updated", async () => {
    fail(
      await request(app).patch("/api/posts/99999999").send({ caption: "new" }),
      404,
    );
  });

  test("P33 deletes post", async () => {
    const u = await user();
    const p = await post(u.id, "delete");
    const r = await request(app).delete(`/api/posts/${p.id}`);
    ok(r);
    expect(await prisma.post.findUnique({ where: { id: p.id } })).toBeNull();
  });

  test("P34 missing post cannot be deleted", async () => {
    fail(await request(app).delete("/api/posts/99999999"), 404);
  });
});
