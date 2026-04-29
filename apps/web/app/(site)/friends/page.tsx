import { db } from "@/lib/db";
import { friendLinks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Friends",
  description: "友情链接",
};

interface FriendLink {
  id: number;
  name: string;
  url: string;
  description: string | null;
  avatarUrl: string | null;
}

function FriendCard({ friend }: { friend: FriendLink }) {
  return (
    <Link
      href={friend.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/30 hover:bg-[var(--card)] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[var(--code-bg)]">
        {friend.avatarUrl ? (
          <img
            src={friend.avatarUrl}
            alt={friend.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[var(--primary)]">
            {friend.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-[var(--text)] truncate group-hover:text-[var(--primary)] transition-colors">
          {friend.name}
        </h3>
        {friend.description && (
          <p className="text-sm text-[var(--muted)] truncate mt-0.5">
            {friend.description}
          </p>
        )}
      </div>
    </Link>
  );
}

export default async function FriendsPage() {
  let friends: FriendLink[] = [];

  try {
    friends = await db
      .select()
      .from(friendLinks)
      .where(eq(friendLinks.isVisible, true))
      .orderBy(asc(friendLinks.sortOrder));
  } catch {
    friends = [];
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-2 text-[var(--text)]">My Friends</h1>
      <p className="text-[var(--muted)] mb-8">友情链接</p>

      {friends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </div>
      ) : (
        <p className="text-[var(--muted)]">暂无友链数据</p>
      )}
    </div>
  );
}
