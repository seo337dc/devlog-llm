"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-16">
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
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={16}
          className="resize-none rounded border border-zinc-200 px-3 py-3 text-lg leading-8 outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded bg-black px-5 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "저장 중..." : "발행"}
        </button>
      </form>
    </div>
  );
}
