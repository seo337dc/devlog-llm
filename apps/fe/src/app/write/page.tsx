"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AIChat from "@/components/AIChat";
import Editor from "@/components/Editor";
import { createPost } from "@/lib/posts";

export default function Write() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("일상");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    const post = await createPost({ title, content, category });
    router.push(`/posts/${post.id}`);
  }

  return (
    <div className="flex h-screen">
      <div className="flex w-1/2 flex-col gap-4 overflow-y-auto px-8 py-16">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="border-b border-zinc-200 pb-2 text-3xl font-bold outline-none"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="분류"
          className="w-32 rounded border border-zinc-300 px-2 py-1 text-sm"
        />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Editor content={content} onChange={setContent} />
          <button
            type="submit"
            disabled={submitting}
            className="self-start rounded bg-black px-5 py-2 text-white disabled:opacity-50"
          >
            {submitting ? "저장 중..." : "발행"}
          </button>
        </form>
      </div>

      <div className="w-1/2 border-l border-zinc-200">
        <AIChat />
      </div>
    </div>
  );
}
