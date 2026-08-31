import Link from "next/link";
import { getPosts } from "@/lib/posts";

function excerpt(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function Home({
  searchParams,
}: PageProps<"/">) {
  const params = await searchParams;
  const selected =
    typeof params.category === "string" ? params.category : null;

  const posts = await getPosts().catch(() => []);

  const visiblePosts = selected
    ? posts.filter((p) => p.category === selected)
    : posts;

  return (
    <main className="mx-auto max-w-3xl px-10 py-10">
      <h1 className="mb-10 text-center text-2xl font-semibold">
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
              <p className="line-clamp-2 text-zinc-600">
                {excerpt(post.content)}
              </p>
              <time className="text-sm text-zinc-400">
                {new Date(post.created_at).toLocaleDateString()}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
