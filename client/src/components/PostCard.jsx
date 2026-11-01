import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3 } from "lucide-react";
import LikeButton from "./LikeButton";
export default function PostCard({ post }) {
  const date = new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const minutes = Math.max(1, Math.ceil((post.content?.split(/\s+/).length || 0) / 220));
  return <article className="post-card">
    <div className="card-topline"><span className="category-pill">{post.category || "General"}</span><span className="read-time"><Clock3 size={13}/> {minutes} min read</span></div>
    <Link to={`/posts/${post._id}`} className="card-title-link"><h3>{post.title}</h3></Link>
    <p className="card-excerpt">{post.excerpt || post.content.slice(0, 150) + (post.content.length > 150 ? "…" : "")}</p>
    <div className="card-bottom"><div className="author-line"><span className="avatar small">{post.author?.name?.[0]?.toUpperCase() || "F"}</span><span>{post.author?.name || "Community"}</span><span className="dot-sep">·</span><span>{date}</span></div><Link to={`/posts/${post._id}`} className="round-arrow" aria-label="Read story"><ArrowUpRight size={17}/></Link></div>
  </article>;
}
