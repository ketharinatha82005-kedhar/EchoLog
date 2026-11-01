import express from "express";
import fs from "fs/promises";

import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import imageUpload from "../middleware/imageUpload.js";

const router = express.Router();

// UPDATE PROFILE PICTURE
router.patch(
  "/avatar",
  protect,
  imageUpload.single("avatar"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select an image.",
        });
      }

      const user = await User.findById(req.user._id);

      if (!user) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(404).json({
          message: "User not found.",
        });
      }

      user.avatar = `/uploads/${req.file.filename}`;

      await user.save();

      res.json({
        message: "Profile picture updated successfully.",
        avatar: user.avatar,
      });
    } catch (error) {
      if (req.file?.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }

      next(error);
    }
  }
);

// UPLOAD PHOTOS TO PROFILE GALLERY
router.post(
  "/gallery",
  protect,
  imageUpload.array("photos", 20),
  async (req, res, next) => {
    const files = req.files || [];

    try {
      if (files.length === 0) {
        return res.status(400).json({
          message: "Please select at least one image.",
        });
      }

      const user = await User.findById(req.user._id);

      if (!user) {
        await Promise.all(
          files.map((file) => fs.unlink(file.path).catch(() => {}))
        );

        return res.status(404).json({
          message: "User not found.",
        });
      }

      const newPhotos = files.map((file) => ({
        url: `/uploads/${file.filename}`,
        originalName: file.originalname,
      }));

      user.photos.push(...newPhotos);

      await user.save();

      res.status(201).json({
        message: "Photos added to your gallery.",
        photos: user.photos,
      });
    } catch (error) {
      await Promise.all(
        files.map((file) => fs.unlink(file.path).catch(() => {}))
      );

      next(error);
    }
  }
);

// DELETE A GALLERY PHOTO
router.delete("/gallery/:photoId", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const photo = user.photos.id(req.params.photoId);

    if (!photo) {
      return res.status(404).json({
        message: "Photo not found.",
      });
    }

    const filename = photo.url.split("/").pop();

    photo.deleteOne();
    await user.save();

    await fs.unlink(
      `${process.cwd()}/uploads/${filename}`
    ).catch(() => {});

    res.json({
      message: "Photo deleted successfully.",
      photos: user.photos,
    });
  } catch (error) {
    next(error);
  }
});

export default router;