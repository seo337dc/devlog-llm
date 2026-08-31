"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
  categories: { name: string; count: number }[];
  total: number;
};

export default function Sidebar({ categories, total }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = pathname === "/" ? searchParams.get("category") : undefined;

  return (
    <aside className="w-52 shrink-0 border-r border-zinc-200 px-4 py-6">
      <Link href="/" className="mb-6 block text-lg font-semibold">
        devlog-llm
      </Link>

      <nav className="flex flex-col gap-1 text-sm">
        <Link
          href="/"
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
        className="mt-6 block rounded bg-black px-3 py-2 text-center text-sm text-white"
      >
        새 글 작성
      </Link>
    </aside>
  );
}
