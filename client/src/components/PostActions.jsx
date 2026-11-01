import {
  likePost,
  sharePostCount,
} from "../services/socialApi";

export default function PostActions({ post, onUpdate }) {
  const handleLike = async () => {
    try {
      const result = await likePost(post._id);

      onUpdate?.({
        ...post,
        liked: result.liked,
        likesCount: result.likesCount,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;

    try {
      await sharePostCount(post._id);

      const shareText = post.content || "Check out this post!";

      if (navigator.share) {
        await navigator.share({
          title: post.title || "EchoLog Post",
          text: shareText,
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        alert("Post link copied!");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        alert(error.message);
      }
    }
  };

  const postUrl = `${window.location.origin}/posts/${post._id}`;
  const whatsappUrl =
    `https://wa.me/?text=${encodeURIComponent(
      `${post.content || "Check out this post!"} ${postUrl}`
    )}`;

  return (
    <div className="post-actions">
      <button onClick={handleLike}>
        ❤️ Like ({post.likes?.length || 0})
      </button>

      <button onClick={handleShare}>
        🔗 Share ({post.shares || 0})
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => sharePostCount(post._id).catch(console.error)}
      >
        WhatsApp
      </a>
    </div>
  );
}