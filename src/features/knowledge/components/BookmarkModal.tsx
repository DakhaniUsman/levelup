"use client";

import { useState, useEffect } from "react";
import { X, BookOpen, Loader2, Edit3 } from "lucide-react";
import { IBookmark, BookmarkCategory } from "@/models/Bookmark";

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookmarkToEdit?: IBookmark | null;
}

const CATEGORIES: BookmarkCategory[] = [
  "PROGRAMMING",
  "TECHNOLOGY",
  "BUSINESS",
  "FINANCE",
  "PERSONAL_DEV",
  "BOOKS",
  "TUTORIALS",
  "RESEARCH",
];

export default function BookmarkModal({
  isOpen,
  onClose,
  onSuccess,
  bookmarkToEdit,
}: BookmarkModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<BookmarkCategory>("PROGRAMMING");
  const [tagsInput, setTagsInput] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookmarkToEdit) {
      setTitle(bookmarkToEdit.title || "");
      setUrl(bookmarkToEdit.url || "");
      setDescription(bookmarkToEdit.description || "");
      setNotes(bookmarkToEdit.notes || "");
      setCategory(bookmarkToEdit.category || "PROGRAMMING");
      setTagsInput(bookmarkToEdit.tags?.join(", ") || "");
      setIsFavorite(Boolean(bookmarkToEdit.isFavorite));
    } else {
      setTitle("");
      setUrl("");
      setDescription("");
      setNotes("");
      setCategory("PROGRAMMING");
      setTagsInput("");
      setIsFavorite(false);
    }
  }, [bookmarkToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const endpoint = bookmarkToEdit
        ? `/api/knowledge/${bookmarkToEdit._id}`
        : "/api/knowledge";
      const method = bookmarkToEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          url,
          description: description || undefined,
          notes: notes || undefined,
          category,
          tags,
          isFavorite,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to ${bookmarkToEdit ? "update" : "save"} bookmark`);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to ${bookmarkToEdit ? "update" : "save"} bookmark`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="hud-card w-full max-w-lg p-4 sm:p-6 rounded-2xl border border-[#1F2435] shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#1F2435]">
          <div className="flex items-center gap-2 text-[#00F0FF] font-mono text-sm font-bold">
            {bookmarkToEdit ? (
              <Edit3 className="w-4 h-4 text-[#00F0FF]" />
            ) : (
              <BookOpen className="w-4 h-4" />
            )}
            <span>
              {bookmarkToEdit
                ? "RECONFIGURE KNOWLEDGE RESOURCE"
                : "ARCHIVE KNOWLEDGE RESOURCE"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-[#FF2A55]/10 border border-[#FF2A55]/30 text-xs text-[#FF2A55] font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[#94A3B8] uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js 15 App Router Architecture Guide"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#94A3B8] uppercase tracking-wider mb-1">
              URL / Link *
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://nextjs.org/docs"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#94A3B8] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BookmarkCategory)}
                className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white focus:border-[#00F0FF] focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#94A3B8] uppercase tracking-wider mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="react, fullstack, nextjs"
                className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white focus:border-[#00F0FF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#94A3B8] uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of the resource..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#94A3B8] uppercase tracking-wider mb-1">
              Personal Notes & Takeaways (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key concepts to review..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#00F0FF] focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="favorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="rounded border-[#1F2435] bg-[#090A0F] text-[#00F0FF] focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="favorite"
              className="text-xs text-[#94A3B8] cursor-pointer font-mono"
            >
              Star as Priority Knowledge Bookmark
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-[#1F2435] text-[#94A3B8] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-[#00F0FF] text-[#090A0F] font-bold hover:bg-[#00F0FF]/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{bookmarkToEdit ? "UPDATE RESOURCE" : "SAVE TO ARCHIVE"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

