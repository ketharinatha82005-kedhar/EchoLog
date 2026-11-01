import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const tokenFor = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.post("/register", [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 60 }),
  body("email").isEmail().withMessage("Enter a valid email.").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
], validate, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email is already registered." });
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: tokenFor(user._id), user: { _id: user._id, id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
});

router.post("/login", [
  body("email").isEmail().withMessage("Enter a valid email.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required.")
], validate, async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+password");
    if (!user || !(await user.comparePassword(req.body.password)))
      return res.status(401).json({ message: "Incorrect email or password." });
    res.json({ token: tokenFor(user._id), user: { _id: user._id, id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
});

router.get("/me", protect, (req, res) => res.json({ user: req.user }));
export default router;
