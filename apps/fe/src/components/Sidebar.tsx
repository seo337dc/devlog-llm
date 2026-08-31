"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

type Props = {
  categories: { name: string; count: number }[];
  total: number;
};

export default function Sidebar({ categories, total }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = pathname === "/" ? searchParams.get("category") : undefined;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-lg"
        aria-label="메뉴 열기"
      >
        ☰
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/20"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-52 border-r border-zinc-200 bg-white px-4 py-6 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold">
            devlog-llm
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-black"
            aria-label="메뉴 닫기"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1 text-sm">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={`rounded px-2 py-1.5 ${
              selected === null
                ? "bg-zinc-100 font-medium text-black"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            분류 전체보기 ({total})
          </Link>
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`/?category=${encodeURIComponent(c.name)}`}
              onClick={() => setOpen(false)}
              className={`rounded px-2 py-1.5 ${
                selected === c.name
                  ? "bg-zinc-100 font-medium text-black"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {c.name} ({c.count})
            </Link>
          ))}
        </nav>

        <Link
          href="/write"
          onClick={() => setOpen(false)}
          className="mt-6 block rounded bg-black px-3 py-2 text-center text-sm text-white"
        >
          새 글 작성
        </Link>
      </aside>
    </>
  );
}
