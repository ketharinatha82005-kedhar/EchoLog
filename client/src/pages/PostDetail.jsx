import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Pencil, Trash2, Send } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => api.get(`/posts/${id}`).then(({ data }) => setPost(data.post)).catch(() => setError("This story could not be found."));
  useEffect(() => { load(); }, [id]);
  const owner = user && post && (post.author?._id === user.id || post.author?._id === user._id);
  const publishComment = async e => {
    e.preventDefault(); if (!comment.trim()) return;
    setBusy(true);
    try { await api.post(`/posts/${id}/comments`, { body: comment }); setComment(""); await load(); }
    catch (err) { setError(err.response?.data?.message || "Could not add comment."); }
    finally { setBusy(false); }
  };
  const deletePost = async () => {
    if (!window.confirm("Delete this story permanently?")) return;
    try { await api.delete(`/posts/${id}`); navigate("/"); }
    catch (err) { setError(err.response?.data?.message || "Could not delete story."); }
  };
  const deleteComment = async commentId => {
    if (!window.confirm("Delete this comment?")) return;
    try { await api.delete(`/posts/${id}/comments/${commentId}`); await load(); }
    catch (err) { setError(err.response?.data?.message || "Could not delete comment."); }
  };
  if (error && !post) return <div className="empty-state detail-empty"><p>{error}</p><Link to="/" className="button button-dark">Back home</Link></div>;
  if (!post) return <div className="empty-state">Loading story…</div>;
  const date = new Date(post.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  return <div className="detail-page"><Link to="/" className="back-link"><ArrowLeft size={16}/> All stories</Link>
    {error && <div className="notice error">{error}</div>}
    <article className="article"><div className="article-meta"><span className="category-pill">{post.category}</span><span>{date}</span><span>·</span><span>By {post.author?.name}</span></div><h1>{post.title}</h1>{post.excerpt && <p className="article-deck">{post.excerpt}</p>}
      <div className="article-tools">{owner && <><Link className="tool-link" to={`/edit/${post._id}`}><Pencil size={15}/> Edit</Link><button className="tool-link danger-text" onClick={deletePost}><Trash2 size={15}/> Delete</button></>}</div>
      <div className="article-body">{post.content.split(/\n+/).map((paragraph, i) => paragraph.trim() && <p key={i}>{paragraph}</p>)}</div>
    </article>
    <section className="comments-section"><div className="comments-title"><div><span className="eyebrow muted">JOIN THE DISCUSSION</span><h2>Conversation <span className="brand-dot">.</span></h2></div><span className="comment-count"><MessageCircle size={16}/> {post.comments.length}</span></div>
      {user ? <form className="comment-form" onSubmit={publishComment}><div className="avatar">{user.name?.[0]?.toUpperCase()}</div><div className="comment-input-wrap"><textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a thoughtful comment…" rows="3" maxLength="1000"/><div className="comment-submit"><span>{comment.length}/1000</span><button className="button button-dark" disabled={busy || !comment.trim()}>{busy ? "Posting…" : "Post comment"} <Send size={14}/></button></div></div></form> : <div className="login-prompt">Want to join in? <Link to="/login">Log in</Link> or <Link to="/register">create an account</Link> to leave a comment.</div>}
      <div className="comment-list">{post.comments.map(c => <div className="comment-item" key={c._id}><div className="avatar">{c.author?.name?.[0]?.toUpperCase() || "?"}</div><div className="comment-content"><div className="comment-author"><strong>{c.author?.name || "Member"}</strong><span>{new Date(c.createdAt).toLocaleDateString()}</span>{user && (c.author?._id === user.id || c.author?._id === user._id || owner) && <button className="icon-button" onClick={() => deleteComment(c._id)} aria-label="Delete comment"><Trash2 size={14}/></button>}</div><p>{c.body}</p></div></div>)}
      {!post.comments.length && <p className="no-comments">No comments yet. Start a kind conversation.</p>}</div>
    </section>
  </div>;
}
