import express from "express";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const validId = id => mongoose.isValidObjectId(id);
const authorPopulate = { path: "author", select: "name email avatar" };
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
    if (req.query.search) filter.$text = { $search: req.query.search };
    const posts = await Post.find(filter).populate(authorPopulate).sort({ createdAt: -1 }).limit(100);
    res.json({ posts });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid post ID." });
    const post = await Post.findById(req.params.id).populate(authorPopulate).populate("comments.author", "name avatar");
    if (!post) return res.status(404).json({ message: "Post not found." });
    res.json({ post });
  } catch (err) { next(err); }
});

router.post("/", protect, [
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 140 }),
  body("content").trim().notEmpty().withMessage("Content is required.").isLength({ max: 30000 }),
  body("excerpt").optional().isLength({ max: 260 }),
  body("category").optional().isLength({ max: 40 })
], validate, async (req, res, next) => {
  try {
    const post = await Post.create({
      title: req.body.title, excerpt: req.body.excerpt || "",
      content: req.body.content, category: req.body.category || "General",
      author: req.user._id
    });
    await post.populate(authorPopulate);
    res.status(201).json({ post });
  } catch (err) { next(err); }
});

router.put("/:id", protect, [
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 140 }),
  body("content").trim().notEmpty().withMessage("Content is required.").isLength({ max: 30000 })
], validate, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid post ID." });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (!post.author.equals(req.user._id)) return res.status(403).json({ message: "You can only edit your own posts." });
    for (const key of ["title", "excerpt", "content", "category"])
      if (req.body[key] !== undefined) post[key] = req.body[key];
    await post.save();
    await post.populate(authorPopulate);
    res.json({ post });
  } catch (err) { next(err); }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid post ID." });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (!post.author.equals(req.user._id)) return res.status(403).json({ message: "You can only delete your own posts." });
    await post.deleteOne();
    res.json({ message: "Post deleted." });
  } catch (err) { next(err); }
});

router.post("/:id/comments", protect, [
  body("body").trim().notEmpty().withMessage("Comment cannot be empty.").isLength({ max: 1000 })
], validate, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid post ID." });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    post.comments.push({ body: req.body.body, author: req.user._id });
    await post.save();
    await post.populate("comments.author", "name avatar");
    res.status(201).json({ comments: post.comments });
  } catch (err) { next(err); }
});

router.delete("/:id/comments/:commentId", protect, async (req, res, next) => {
  try {
    if (![req.params.id, req.params.commentId].every(validId)) return res.status(400).json({ message: "Invalid ID." });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found." });
    if (!comment.author.equals(req.user._id) && !post.author.equals(req.user._id))
      return res.status(403).json({ message: "Not allowed to delete this comment." });
    comment.deleteOne();
    await post.save();
    res.json({ comments: post.comments });
  } catch (err) { next(err); }
});

export default router;
