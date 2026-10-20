import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getUserLikedPosts,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.patch("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

userRouter.get("/:id/posts", getUserPosts);
userRouter.get("/:id/liked-posts", getUserLikedPosts);

export default userRouter;