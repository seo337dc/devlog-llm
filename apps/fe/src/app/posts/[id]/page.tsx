import Link from "next/link";
import { getPost } from "@/lib/posts";

export default async function PostDetail({
  params,
}: PageProps<"/posts/[id]">) {
  const { id } = await params;
  const post = await getPost(id);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-zinc-400 hover:underline">
        ← 목록으로
      </Link>

      <p className="mt-8 text-sm text-zinc-400">{post.category}</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight">{post.title}</h1>
      <time className="mt-3 block text-sm text-zinc-400">
        {new Date(post.created_at).toLocaleString()}
      </time>

      <div className="mt-10 whitespace-pre-wrap text-lg leading-8 text-zinc-800">
        {post.content}
      </div>
    </div>
  );
}
