"use client";

import { ExternalLink, Star, Trash2 } from "lucide-react";
import { IBookmark } from "@/models/Bookmark";
import { cn } from "@/lib/utils";

interface BookmarkCardProps {
  bookmark: IBookmark;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDelete: (id: string) => void;
}

export default function BookmarkCard({
  bookmark,
  onToggleFavorite,
  onDelete,
}: BookmarkCardProps) {
  return (
    <div className="hud-card p-5 rounded-2xl border border-[#1F2435] hover:border-[#00F0FF]/40 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#131620] border border-[#1F2435] text-[#00F0FF]">
            {bookmark.category}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                onToggleFavorite(bookmark._id.toString(), !bookmark.isFavorite)
              }
              className={cn(
                "p-1 rounded-md transition-all cursor-pointer",
                bookmark.isFavorite
                  ? "text-amber-400"
                  : "text-[#64748B] hover:text-amber-400"
              )}
              title={bookmark.isFavorite ? "Unfavorite" : "Favorite"}
            >
              <Star
                className={cn("w-4 h-4", bookmark.isFavorite && "fill-amber-400")}
              />
            </button>

            <button
              onClick={() => onDelete(bookmark._id.toString())}
              className="p-1 rounded-md text-[#64748B] hover:text-[#FF2A55] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              title="Delete Archive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block group/link"
        >
          <h3 className="text-sm font-bold font-mono text-white group-hover/link:text-[#00F0FF] transition-colors flex items-center gap-1.5">
            <span>{bookmark.title}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover/link:opacity-100" />
          </h3>
        </a>

        {bookmark.description && (
          <p className="text-xs text-[#94A3B8] mt-1.5 font-sans line-clamp-2">
            {bookmark.description}
          </p>
        )}

        {bookmark.notes && (
          <div className="mt-3 p-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-[11px] font-mono text-[#94A3B8] leading-relaxed line-clamp-3">
            {bookmark.notes}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#1F2435]/60 flex flex-wrap items-center gap-1.5">
        {bookmark.tags && bookmark.tags.length > 0 ? (
          bookmark.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-[#64748B] bg-[#090A0F] px-2 py-0.5 rounded border border-[#1F2435]"
            >
              #{tag}
            </span>
          ))
        ) : (
          <span className="text-[10px] font-mono text-[#64748B]">
            {new Date(bookmark.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

