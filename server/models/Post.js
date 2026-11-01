
import mongoose from "mongoose";

// COMMENT SCHEMA
const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// MEDIA SCHEMA
const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },

    kind: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    originalName: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

// POST SCHEMA
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
      maxlength: 140,
    },

    excerpt: {
      type: String,
      trim: true,
      default: "",
      maxlength: 260,
    },

    content: {
      type: String,
      trim: true,
      default: "",
      maxlength: 30000,
    },

    category: {
      type: String,
      trim: true,
      default: "General",
      maxlength: 40,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // IMAGE AND VIDEO UPLOADS
    media: {
      type: [mediaSchema],
      default: [],
    },

    // HASHTAGS
    hashtags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],
      default: [],
    },

    // POST LIKES
    // Stores the IDs of users who liked this post.
    likes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    // POST SHARES
    shares: {
      type: Number,
      default: 0,
      min: 0,
    },

    // POST COMMENTS
    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// TEXT SEARCH INDEX
postSchema.index({
  title: "text",
  content: "text",
  excerpt: "text",
  hashtags: "text",
});

// FEED SORTING INDEX
postSchema.index({
  createdAt: -1,
});

// HASHTAG SEARCH INDEX
postSchema.index({
  hashtags: 1,
});

// CREATE POST MODEL
const Post = mongoose.model("Post", postSchema);

export default Post;

