const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const followUser = (userId) =>
  request(`/users/${userId}/follow`, {
    method: "POST",
  });

export const getFollowStatus = (userId) =>
  request(`/users/${userId}/follow-status`);

export const likePost = (postId) =>
  request(`/posts/${postId}/like`, {
    method: "POST",
  });

export const sharePostCount = (postId) =>
  request(`/posts/${postId}/share`, {
    method: "POST",
  });

export const getUserProfile = (userId) =>
  request(`/users/${userId}`);