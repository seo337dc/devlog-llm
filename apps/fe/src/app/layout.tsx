import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import AIPanel from "@/components/AIPanel";
import Sidebar from "@/components/Sidebar";
import { getPosts } from "@/lib/posts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "devlog-llm",
  description: "개인 개발 블로그",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const posts = await getPosts().catch(() => []);

  const categoryCounts = new Map<string, number>();
  for (const post of posts) {
    categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1);
  }
  const categories = Array.from(categoryCounts, ([name, count]) => ({
    name,
    count,
  }));

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full">
        <Suspense fallback={null}>
          <Sidebar categories={categories} total={posts.length} />
        </Suspense>
        <div className="flex-1">{children}</div>
        <AIPanel />
      </body>
    </html>
  );
}
