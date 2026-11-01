import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookOpen, PenLine, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const signOut = () => { logout(); setOpen(false); navigate("/"); };
  return <div className="app-shell">
    <header className="topbar"><div className="nav-inner">
      <Link to="/" className="brand"><span className="brand-mark"><BookOpen size={19}/></span><span>EchoLog<span className="brand-dot">.</span></span></Link>
      <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X/> : <Menu/>}</button>
      <nav className={open ? "nav-links open" : "nav-links"}>
        <NavLink to="/" onClick={() => setOpen(false)}>Explore</NavLink>
        {user ? <><NavLink to="/write" className="write-link" onClick={() => setOpen(false)}><PenLine size={15}/> Write a story</NavLink><span className="nav-user"><span className="avatar">{user.name?.[0]?.toUpperCase()}</span>{user.name}</span><button className="text-button" onClick={signOut}><LogOut size={15}/> Sign out</button></> :
        <><NavLink to="/login" onClick={() => setOpen(false)}>Log in</NavLink><Link className="button button-dark nav-join" to="/register" onClick={() => setOpen(false)}>Join EchoLog</Link></>}
      </nav>
    </div></header>
    <main>{children}</main>
    <footer className="footer"><span>EchoLog<span className="brand-dot">.</span></span><span>Dispatches, essays & discourse.</span><span>© {new Date().getFullYear()} EchoLog</span></footer>
  </div>;
}
