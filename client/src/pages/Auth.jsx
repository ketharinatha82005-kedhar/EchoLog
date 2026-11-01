import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Auth({ mode }) {
  const isRegister = mode === "register";
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace/>;
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate("/");
    } catch (err) { setError(err.response?.data?.message || "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  };
  return <div className="auth-page"><div className="auth-aside"><div className="auth-aside-inner"><BookOpen size={26}/><span className="eyebrow">FIELDNOTES COMMUNITY</span><h2>Good ideas<br/>deserve <em>good company.</em></h2><p>Read with curiosity. Write with courage. Find your people along the way.</p><div className="aside-doodle">✳</div></div></div>
    <div className="auth-main"><form className="auth-form" onSubmit={submit}><span className="eyebrow muted">{isRegister ? "YOUR NEXT CHAPTER STARTS HERE" : "WELCOME BACK"}</span><h1>{isRegister ? "Join the conversation." : "Good to see you."}</h1><p className="form-intro">{isRegister ? "Create an account and share what matters to you." : "Log in to pick up where you left off."}</p>
      {error && <div className="notice error">{error}</div>}
      {isRegister && <label className="field"><span>Your name</span><input name="name" value={form.name} onChange={change} placeholder="Alex Morgan" required maxLength="60"/></label>}
      <label className="field"><span>Email address</span><input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" required/></label>
      <label className="field"><span>Password</span><input name="password" type="password" value={form.password} onChange={change} placeholder="At least 8 characters" minLength="8" required/></label>
      <button className="button button-dark submit-button" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Log in"} <ArrowRight size={17}/></button>
      <p className="auth-switch">{isRegister ? "Already part of the community?" : "New around here?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Log in" : "Create an account"}</Link></p>
    </form></div>
  </div>;
}
