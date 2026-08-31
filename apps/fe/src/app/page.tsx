"use client";

import { useEffect, useState } from "react";
import { createPost, getPosts, type Post } from "@/lib/posts";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadPosts() {
    try {
      setPosts(await getPosts());
      setError(null);
    } catch {
      setError("글 목록을 불러오지 못했습니다. apps/api가 켜져 있는지 확인하세요.");
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await createPost({ title, content });
    setTitle("");
    setContent("");
    await loadPosts();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold">devlog-llm</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="rounded border border-zinc-300 px-3 py-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          rows={6}
          className="rounded border border-zinc-300 px-3 py-2"
        />
        <button
          type="submit"
          className="self-start rounded bg-black px-4 py-2 text-white"
        >
          작성
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <ul className="flex flex-col gap-6">
        {posts.map((post) => (
          <li key={post.id} className="border-b border-zinc-200 pb-4">
            <h2 className="font-medium">{post.title}</h2>
            <p className="whitespace-pre-wrap text-zinc-600">{post.content}</p>
            <time className="text-sm text-zinc-400">
              {new Date(post.created_at).toLocaleString()}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
}
