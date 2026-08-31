"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "아직 실제 학습된 답변은 아니에요. 대화 수집/RAG 연동 전까지는 화면만 먼저 만들어둔 상태입니다.",
    },
  ]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-black text-white"
                : "bg-zinc-100 text-zinc-800"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-zinc-200 p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm outline-none"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          전송
        </button>
      </form>
    </div>
  );
}
