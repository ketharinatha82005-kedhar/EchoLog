
import { useEffect, useState } from "react";
import LikeButton from "../components/LikeButton";
import "./Feed.css";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET LOGGED-IN USER AND TOKEN
  useEffect(() => {
    const savedToken =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    const savedUser =
      localStorage.getItem("user");

    setToken(savedToken || "");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // LOAD POSTS
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/posts`);

        if (!response.ok) {
          throw new Error("Unable to load posts.");
        }

        const data = await response.json();

        setPosts(
          Array.isArray(data)
            ? data
            : data.posts || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="feed-message">Loading posts...</div>;
  }

  if (error) {
    return <div className="feed-message">{error}</div>;
  }

  return (
    <main className="feed-container">
      <h1 className="feed-title">EchoLog Feed</h1>

      {posts.length === 0 ? (
        <p className="feed-message">
          No posts yet. Be the first to share a story!
        </p>
      ) : (
        <div className="feed-list">
          {posts.map((post) => (
            <article className="feed-post" key={post._id}>
              {/* AUTHOR */}
              <div className="feed-author">
                <img
                  className="feed-avatar"
                  src={
                    post.author?.avatar
                      ? `${SERVER_URL}${post.author.avatar}`
                      : "/default-avatar.png"
                  }
                  alt={post.author?.name || "User"}
                />

                <div>
                  <h3>
                    {post.author?.name || "Unknown user"}
                  </h3>

                  <small>
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleString()
                      : ""}
                  </small>
                </div>
              </div>

              {/* POST CONTENT */}
              {post.title && (
                <h2 className="feed-post-title">
                  {post.title}
                </h2>
              )}

              {post.content && (
                <p className="feed-post-content">
                  {post.content}
                </p>
              )}

              {/* POST MEDIA */}
              {post.media?.length > 0 && (
                <div className="feed-media">
                  {post.media.map((item, index) => (
                    <div key={`${item.url}-${index}`}>
                      {item.kind === "video" ? (
                        <video
                          className="feed-video"
                          src={`${SERVER_URL}${item.url}`}
                          controls
                        />
                      ) : (
                        <img
                          className="feed-image"
                          src={`${SERVER_URL}${item.url}`}
                          alt={item.originalName || "Post"}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* HASHTAGS */}
              {post.hashtags?.length > 0 && (
                <div className="feed-hashtags">
                  {post.hashtags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}

              {/* POST ACTIONS */}
              <div className="feed-actions">
                <LikeButton
                  postId={post._id}
                  initialLikes={post.likes || []}
                  userId={user?._id || user?.id}
                  token={token}
                />

                <span className="feed-shares">
                  🔁 {post.shares || 0} Shares
                </span>

                <span className="feed-comments">
                  💬 {post.comments?.length || 0} Comments
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
