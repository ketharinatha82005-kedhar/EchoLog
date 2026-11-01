
import express from "express";
import mongoose from "mongoose";
import fs from "fs/promises";

import User from "../models/User.js";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

const validId = (id) => mongoose.isValidObjectId(id);

// PUBLIC USER INFORMATION
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  bio: user.bio || "",
  avatar: user.avatar || "",
  location: user.location || "",
  photos: user.photos || [],
  followersCount: user.followers?.length || 0,
  followingCount: user.following?.length || 0,
  createdAt: user.createdAt,
});

// REMOVE UPLOADED FILES IF POST CREATION FAILS
const removeUploadedFiles = async (files = []) => {
  await Promise.all(
    files.map((file) => {
      if (!file.path) return Promise.resolve();
      return fs.unlink(file.path).catch(() => {});
    })
  );
};

// GET USER PROFILE
router.get("/users/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const posts = await Post.find({
      author: user._id,
    })
      .populate("author", "name avatar")
      .sort({ createdAt: -1 });

    res.json({
      user: publicUser(user),
      posts,
    });
  } catch (error) {
    next(error);
  }
});

// CHECK FOLLOW STATUS
router.get(
  "/users/:id/follow-status",
  protect,
  async (req, res, next) => {
    try {
      if (!validId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      const user = await User.findById(req.params.id)
        .select("followers");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const following = (user.followers || []).some(
        (id) => id.equals(req.user._id)
      );

      res.json({ following });
    } catch (error) {
      next(error);
    }
  }
);

// FOLLOW / UNFOLLOW USER
router.post(
  "/users/:id/follow",
  protect,
  async (req, res, next) => {
    try {
      if (!validId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      if (String(req.params.id) === String(req.user._id)) {
        return res.status(400).json({
          message: "You cannot follow yourself",
        });
      }

      const target = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user._id);

      if (!target || !currentUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const alreadyFollowing = (target.followers || []).some(
        (id) => id.equals(currentUser._id)
      );

      if (alreadyFollowing) {
        target.followers.pull(currentUser._id);
        currentUser.following.pull(target._id);
      } else {
        target.followers.addToSet(currentUser._id);
        currentUser.following.addToSet(target._id);
      }

      await Promise.all([
        target.save(),
        currentUser.save(),
      ]);

      res.json({
        following: !alreadyFollowing,
        followersCount: target.followers.length,
        followingCount: currentUser.following.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// LIKE / UNLIKE POST
router.post(
  "/posts/:id/like",
  protect,
  async (req, res, next) => {
    try {
      if (!validId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid post ID",
        });
      }

      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          message: "Post not found",
        });
      }

      // Make sure likes is an array
      if (!Array.isArray(post.likes)) {
        post.likes = [];
      }

      const userId = req.user._id.toString();

      const alreadyLiked = post.likes.some(
        (id) => id.toString() === userId
      );

      if (alreadyLiked) {
        post.likes.pull(req.user._id);
      } else {
        post.likes.addToSet(req.user._id);
      }

      await post.save();

      return res.json({
        success: true,
        liked: !alreadyLiked,
        likesCount: post.likes.length,
        message: alreadyLiked
          ? "Post unliked"
          : "Post liked",
      });
    } catch (error) {
      next(error);
    }
  }
);

// SHARE POST
router.post(
  "/posts/:id/share",
  protect,
  async (req, res, next) => {
    try {
      if (!validId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid post ID",
        });
      }

      const post = await Post.findByIdAndUpdate(
        req.params.id,
        { $inc: { shares: 1 } },
        { new: true, runValidators: true }
      );

      if (!post) {
        return res.status(404).json({
          message: "Post not found",
        });
      }

      res.json({
        shares: post.shares,
      });
    } catch (error) {
      next(error);
    }
  }
);

// UPLOAD PHOTO / VIDEO / STORY
router.post(
  "/posts/upload",
  protect,
  upload.array("media", 10),
  async (req, res, next) => {
    const uploadedFiles = req.files || [];

    try {
      const content = (req.body.content || "").trim();

      if (!content && uploadedFiles.length === 0) {
        await removeUploadedFiles(uploadedFiles);

        return res.status(400).json({
          message: "Write a story or add a photo/video.",
        });
      }

      // PROCESS HASHTAGS
      const hashtags = [
        ...new Set(
          (req.body.hashtags || "")
            .split(/[,\s]+/)
            .map((tag) =>
              tag
                .replace(/^#/, "")
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, "")
            )
            .filter(Boolean)
        ),
      ].slice(0, 20);

      // PROCESS IMAGE AND VIDEO FILES
      const media = uploadedFiles.map((file) => ({
        url: `/uploads/${file.filename}`,
        kind: file.mimetype.startsWith("video/")
          ? "video"
          : "image",
        originalName: file.originalname,
      }));

      // CREATE POST
      const post = await Post.create({
        title: req.body.title || "",
        content,
        category: req.body.category || "Story",
        hashtags,
        media,
        author: req.user._id,
      });

      await post.populate("author", "name avatar");

      return res.status(201).json({
        post,
      });
    } catch (error) {
      await removeUploadedFiles(uploadedFiles);
      next(error);
    }
  }
);

// SEARCH POSTS BY HASHTAG
router.get(
  "/hashtags/:tag",
  async (req, res, next) => {
    try {
      const tag = req.params.tag
        .replace(/^#/, "")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "");

      if (!tag) {
        return res.status(400).json({
          message: "Invalid hashtag",
        });
      }

      const posts = await Post.find({
        hashtags: tag,
      })
        .populate("author", "name avatar")
        .sort({ createdAt: -1 })
        .limit(100);

      res.json({ posts });
    } catch (error) {
      next(error);
    }
  }
);
// GET ALL POSTS FOR FEED
router.get("/posts", async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "name avatar")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ posts });
  } catch (error) {
    next(error);
  }
});
export default router;
