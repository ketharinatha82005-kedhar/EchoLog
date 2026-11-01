import { useState } from "react";

export default function LikeButton({
  postId,
  initialLikes = [],
  userId,
  token,
}) {
  const [likesCount, setLikesCount] = useState(initialLikes.length);

  const [liked, setLiked] = useState(
    initialLikes.some(
      (id) => String(id?._id || id) === String(userId)
    )
  );

  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;

    if (!token) {
      alert("Please log in to like this post.");
      return;
    }

    const previousLiked = liked;
    const previousCount = likesCount;

    // Update immediately
    setLiked(!previousLiked);
    setLikesCount(
      previousLiked ? previousCount - 1 : previousCount + 1
    );

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update like");
      }

      // Use the saved server result
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      // Restore previous state if request fails
      setLiked(previousLiked);
      setLikesCount(previousCount);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={loading}
      aria-pressed={liked}
      className={`like-button ${liked ? "liked" : ""}`}
    >
      {liked ? "❤️ Liked" : "🤍 Like"}
      <span>{likesCount}</span>
    </button>
  );
}