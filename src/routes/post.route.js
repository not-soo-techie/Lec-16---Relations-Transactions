import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} from "../controllers/post.controller.js";

const postRouter = express.Router();

postRouter.post("/", createPost);
postRouter.get("/", getPosts);
postRouter.get("/:id", getPostById);
postRouter.patch("/:id", updatePost);
postRouter.delete("/:id", deletePost);

postRouter.post("/:id/likes", likePost);
postRouter.delete("/:id/likes/:userId", unlikePost);

export default postRouter;