"use client";

import { useState, useRef, useEffect } from "react";
import { ExternalLink, Star, Trash2, MoreVertical, Edit3 } from "lucide-react";
import { IBookmark } from "@/models/Bookmark";
import { cn } from "@/lib/utils";

interface BookmarkCardProps {
  bookmark: IBookmark;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDelete: (bookmark: IBookmark) => void;
  onEdit?: (bookmark: IBookmark) => void;
}

export default function BookmarkCard({
  bookmark,
  onToggleFavorite,
  onDelete,
  onEdit,
}: BookmarkCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="hud-card p-5 rounded-2xl border border-[#1F2435] hover:border-[#00F0FF]/40 transition-all flex flex-col justify-between group relative overflow-visible">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#131620] border border-[#1F2435] text-[#00F0FF]">
            {bookmark.category}
          </span>

          <div className="flex items-center gap-1.5">
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

            {/* 3-Dot Action Menu */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 rounded-md text-[#64748B] hover:text-white hover:bg-[#1F2435]/60 transition-colors cursor-pointer"
                title="Resource Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-36 rounded-xl border border-[#1F2435] bg-[#0E1118] shadow-2xl py-1 z-30 font-mono text-xs animate-in fade-in duration-100">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onEdit(bookmark);
                      }}
                      className="w-full px-3 py-1.5 text-left text-[#CBD5E1] hover:text-white hover:bg-[#1F2435] flex items-center gap-2 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>Edit Resource</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete(bookmark);
                    }}
                    className="w-full px-3 py-1.5 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Resource</span>
                  </button>
                </div>
              )}
            </div>
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

