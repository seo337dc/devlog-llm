"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AIChat, { type Message } from "@/components/AIChat";
import Editor from "@/components/Editor";
import { createPost } from "@/lib/posts";

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildDraftHtml(messages: Message[]) {
  return messages
    .map(
      (m) =>
        `<p><strong>${m.role === "user" ? "나" : "AI"}:</strong> ${escapeHtml(m.content)}</p>`
    )
    .join("");
}

export default function Write() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("일상");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  function handleUseAsDraft(messages: Message[]) {
    setContent((prev) => prev + buildDraftHtml(messages));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    const post = await createPost({ title, content, category });
    router.push(`/posts/${post.id}`);
  }

  return (
    <div className="flex h-screen">
      <form
        onSubmit={handleSubmit}
        className="flex w-1/2 flex-col gap-4 overflow-y-auto px-8 py-16"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="flex-1 text-3xl font-bold outline-none"
          />
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className="shrink-0 rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            {preview ? "편집으로" : "미리보기"}
          </button>
        </div>

        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="분류"
          className="w-32 rounded border border-zinc-300 px-2 py-1 text-sm"
        />

        {preview ? (
          <div
            className="prose prose-zinc max-w-none rounded border border-zinc-100 px-4 py-3"
            dangerouslySetInnerHTML={{ __html: content || "<p class='text-zinc-400'>내용이 없습니다.</p>" }}
          />
        ) : (
          <Editor content={content} onChange={setContent} />
        )}

        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded bg-black px-5 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "저장 중..." : "발행"}
        </button>
      </form>

      <div className="w-1/2 border-l border-zinc-200">
        <AIChat onUseAsDraft={handleUseAsDraft} />
      </div>
    </div>
  );
}
