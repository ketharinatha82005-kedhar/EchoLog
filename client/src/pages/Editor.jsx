import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Editor() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", excerpt: "", category: "Culture", content: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!editing) return;
    api.get(`/posts/${id}`).then(({ data }) => {
      const authorId = data.post.author?._id;
      if (authorId !== user?.id && authorId !== user?._id) { setError("You do not own this story."); return; }
      setForm({ title: data.post.title, excerpt: data.post.excerpt || "", category: data.post.category || "General", content: data.post.content });
    }).catch(() => setError("Could not load this story."));
  }, [id, editing, user]);
  if (!user) return <Navigate to="/login" replace/>;
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const { data } = editing ? await api.put(`/posts/${id}`, form) : await api.post("/posts", form);
      navigate(`/posts/${data.post._id}`);
    } catch (err) { setError(err.response?.data?.message || "Could not save story."); }
    finally { setBusy(false); }
  };
  return <div className="editor-page"><Link to="/" className="back-link"><ArrowLeft size={16}/> Back to stories</Link><div className="editor-heading"><span className="eyebrow muted">THE COMMUNITY JOURNAL</span><h1>{editing ? "Shape your story." : "Put it into words."}</h1><p>Every great story starts with a first draft.</p></div>
    <form className="editor-form" onSubmit={submit}>{error && <div className="notice error">{error}</div>}
      <label className="field"><span>Story title</span><input name="title" value={form.title} onChange={change} placeholder="Give your story a thoughtful title…" maxLength="140" required/></label>
      <div className="form-row"><label className="field"><span>Category</span><select name="category" value={form.category} onChange={change}>{["Culture","Design","Technology","Lifestyle","Business","General"].map(c => <option key={c}>{c}</option>)}</select></label><label className="field"><span>Short introduction <small>(optional)</small></span><input name="excerpt" value={form.excerpt} onChange={change} placeholder="A one-line preview…" maxLength="260"/></label></div>
      <label className="field"><span>Your story</span><textarea name="content" value={form.content} onChange={change} placeholder="Start writing here. Share an idea, a lesson, or a story worth remembering…" rows="16" maxLength="30000" required/></label>
      <div className="editor-bottom"><span>{form.content.length.toLocaleString()} / 30,000 characters</span><button className="button button-dark" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Publish story"} <Send size={15}/></button></div>
    </form>
  </div>;
}
