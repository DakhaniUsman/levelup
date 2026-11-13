"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, Search, Star, Loader2 } from "lucide-react";
import { IBookmark, BookmarkCategory } from "@/models/Bookmark";
import BookmarkCard from "@/features/knowledge/components/BookmarkCard";
import BookmarkModal from "@/features/knowledge/components/BookmarkModal";
import { cn } from "@/lib/utils";

const CATEGORIES: (BookmarkCategory | "ALL")[] = [
  "ALL",
  "PROGRAMMING",
  "TECHNOLOGY",
  "BUSINESS",
  "FINANCE",
  "PERSONAL_DEV",
  "BOOKS",
  "TUTORIALS",
  "RESEARCH",
];

export default function KnowledgePage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<BookmarkCategory | "ALL">(
    "ALL"
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [search, setSearch] = useState("");

  const { data: bookmarks = [], isLoading } = useQuery<IBookmark[]>({
    queryKey: ["knowledge", activeCategory, showFavoritesOnly, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory !== "ALL") params.set("category", activeCategory);
      if (showFavoritesOnly) params.set("isFavorite", "true");
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/knowledge?${params.toString()}`);
      const json = await res.json();
      return json.data || [];
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({
      id,
      isFavorite,
    }: {
      id: string;
      isFavorite: boolean;
    }) => {
      const res = await fetch(`/api/knowledge/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1F2435]">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#00F0FF]" />
            KNOWLEDGE ARCHIVE
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Hunter codex repository. Archive key insights, technical docs, and wisdom.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00F0FF] text-[#090A0F] font-mono font-bold text-xs hover:bg-[#00F0FF]/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>NEW ARCHIVE</span>
        </button>
      </div>

      {/* Search & Favorites Toggle */}
      <div className="flex flex-col sm:flex-row items-center gap-3 font-mono text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archives by title, notes, or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#131620] border border-[#1F2435] text-white focus:border-[#00F0FF] focus:outline-none"
          />
        </div>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={cn(
            "w-full sm:w-auto px-4 py-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all cursor-pointer",
            showFavoritesOnly
              ? "bg-amber-400/10 border-amber-400/40 text-amber-400 font-bold"
              : "bg-[#131620] border-[#1F2435] text-[#94A3B8] hover:text-white"
          )}
        >
          <Star
            className={cn("w-4 h-4", showFavoritesOnly && "fill-amber-400")}
          />
          <span>FAVORITES ONLY</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer",
              activeCategory === cat
                ? "bg-[#00F0FF] text-[#090A0F] font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                : "bg-[#131620] text-[#94A3B8] hover:text-white border border-[#1F2435]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bookmarks Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#64748B] font-mono text-xs gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#00F0FF]" />
          <span>QUERYING KNOWLEDGE CODEX...</span>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="hud-card p-12 text-center rounded-2xl border border-[#1F2435] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#1F2435]/50 flex items-center justify-center mx-auto text-[#64748B]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold font-mono text-white">
            No Codex Resources Found
          </h2>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto font-sans">
            Your archive is empty for this category. Save valuable technical articles and notes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((bm) => (
            <BookmarkCard
              key={bm._id.toString()}
              bookmark={bm}
              onToggleFavorite={(id, isFavorite) =>
                toggleFavoriteMutation.mutate({ id, isFavorite })
              }
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <BookmarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["knowledge"] });
        }}
      />
    </div>
  );
}

