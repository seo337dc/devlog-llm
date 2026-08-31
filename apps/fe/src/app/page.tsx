import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getPosts } from "@/lib/posts";

export default async function Home({
  searchParams,
}: PageProps<"/">) {
  const params = await searchParams;
  const selected =
    typeof params.category === "string" ? params.category : null;

  const posts = await getPosts().catch(() => []);

  const categoryCounts = new Map<string, number>();
  for (const post of posts) {
    categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1);
  }
  const categories = Array.from(categoryCounts, ([name, count]) => ({
    name,
    count,
  }));

  const visiblePosts = selected
    ? posts.filter((p) => p.category === selected)
    : posts;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1">
      <Sidebar categories={categories} total={posts.length} selected={selected} />

      <main className="flex-1 px-8 py-8">
        <h1 className="mb-8 text-center text-2xl font-semibold">
          개벼리의 블로그
        </h1>

        {visiblePosts.length === 0 && (
          <p className="text-center text-zinc-400">아직 글이 없습니다.</p>
        )}

        <ul className="flex flex-col gap-6">
          {visiblePosts.map((post) => (
            <li key={post.id} className="border-b border-zinc-200 pb-6">
              <Link href={`/posts/${post.id}`} className="group">
                <span className="text-xs text-zinc-400">{post.category}</span>
                <h2 className="text-lg font-medium group-hover:underline">
                  {post.title}
                </h2>
                <p className="line-clamp-2 text-zinc-600">{post.content}</p>
                <time className="text-sm text-zinc-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
