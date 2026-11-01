import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Editor from "./pages/Editor";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <div className="loading-screen">fieldnotes<span>.</span></div>;
  return <Layout><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/login" element={<Auth mode="login"/>}/>
    <Route path="/register" element={<Auth mode="register"/>}/>
    <Route path="/write" element={<Editor/>}/>
    <Route path="/edit/:id" element={<Editor/>}/>
    <Route path="/posts/:id" element={<PostDetail/>}/>
    <Route path="/profile" element={<Profile/>}/>
    <Route path="/users/:id" element={<Profile/>}/>
    <Route path="/hashtag/:tag" element={<Home/>}/>
    <Route path="/feed" element={<Feed />} />
    <Route path="*" element={<div className="empty-state"><h2>Page not found</h2><a href="/" className="button button-dark">Go home</a></div>}/>
  </Routes></Layout>;
}
export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes/></AuthProvider></BrowserRouter>;
}
