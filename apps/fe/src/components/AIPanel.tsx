"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function AIPanel() {
  const [open, setOpen] = useState(false);
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
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg"
      >
        AI
      </button>

      <div
        className={`fixed inset-y-0 right-0 z-40 flex w-1/2 flex-col border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2 className="font-medium">AI에게 물어보기</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-black"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
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
          className="flex gap-2 border-t border-zinc-200 p-3"
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
    </>
  );
}
