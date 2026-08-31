const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_URL}/posts`, { cache: "no-store" });
  if (!res.ok) throw new Error("failed to fetch posts");
  return res.json();
}

export async function createPost(input: {
  title: string;
  content: string;
}): Promise<Post> {
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("failed to create post");
  return res.json();
}
