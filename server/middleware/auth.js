import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Authentication required." });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("_id name email avatar bio location followers following");
    if (!req.user) return res.status(401).json({ message: "Account no longer exists." });
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
