import Link from "next/link";

type Props = {
  categories: { name: string; count: number }[];
  total: number;
  selected: string | null;
};

export default function Sidebar({ categories, total, selected }: Props) {
  return (
    <aside className="w-56 shrink-0 border-r border-zinc-200 px-4 py-8">
      <Link href="/" className="mb-8 block text-lg font-semibold">
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
        className="mt-8 block rounded bg-black px-3 py-2 text-center text-sm text-white"
      >
        새 글 작성
      </Link>
    </aside>
  );
}
