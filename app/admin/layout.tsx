import type { Metadata } from "next";

/**
 * The admin panel and login screen must never be indexed. The root layout
 * defaults to index/follow, so the whole /admin tree opts out here (and
 * robots.txt disallows crawling it as a second layer).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
