"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import AIChat from "@/components/AIChat";

export default function AIPanel() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/write") return null;

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
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="font-medium">AI에게 물어보기</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-black"
          >
            ✕ 닫기
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <AIChat />
        </div>
      </div>
    </>
  );
}
