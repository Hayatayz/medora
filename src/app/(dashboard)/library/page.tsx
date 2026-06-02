"use client";

import { useEffect, useState, useCallback } from "react";
import { useBooks } from "@/hooks/useBooks";
import {
  BookOpen,
  Search,
  Trash2,
  Eye,
  Brain,
  ClipboardList,
  MoreVertical,
  Upload,
  CheckCircle2,
  Loader2,
  Globe,
  X,
} from "lucide-react";
import Link from "next/link";
import { formatFileSize, formatDate, truncate } from "@/lib/utils";
import type { Book } from "@/types";
import { toast } from "sonner";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

const CATEGORIES = [
  "All",
  "Medicine",
  "Law",
  "Engineering",
  "Science",
  "History",
  "Other",
];

type UploadState = "idle" | "creating" | "uploading" | "processing" | "done";

interface OnlineBook {
  key: string;
  title: string;
  author: string;
  coverUrl: string | null;
  year: number;
  subject: string | null;
  pages: number;
}

export default function LibraryPage() {
  const { books, loading, total, fetchBooks, deleteBook } = useBooks();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [onlineSearch, setOnlineSearch] = useState("");
  const [onlineBooks, setOnlineBooks] = useState<OnlineBook[]>([]);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    fetchBooks(search, category === "All" ? "" : category);
  }, [search, category, fetchBooks]);

  useEffect(() => {
    function handleClick() {
      setMenuOpen(null);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (!onlineSearch.trim() || !showOnline) return;
    const timer = setTimeout(async () => {
      setOnlineLoading(true);
      try {
        const { data } = await axios.get(
          `/api/books/search-online?q=${encodeURIComponent(onlineSearch)}`
        );
        setOnlineBooks(data.books ?? []);
      } catch {
        toast.error("Online search failed");
      } finally {
        setOnlineLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [onlineSearch, showOnline]);

  async function importOnlineBook(book: OnlineBook) {
    try {
      toast.info(`Adding "${book.title}" to your library...`);
      await axios.post("/api/books", {
        title: book.title,
        author: book.author,
        fileUrl: "",
        fileKey: "",
        fileSize: 0,
        pageCount: book.pages,
        coverUrl: book.coverUrl,
        category: book.subject ?? null,
        description: `Published ${book.year ?? ""}. Imported from Open Library.`,
      });
      toast.success(`"${book.title}" added to library`);
      fetchBooks(search, category === "All" ? "" : category);
    } catch {
      toast.error("Failed to import book");
    }
  }

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are supported");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File must be under 50MB");
        return;
      }

      const title = file.name
        .replace(/\.pdf$/i, "")
        .replace(/[_-]/g, " ");

      try {
        setUploadState("creating");
        const { data: bookData } = await axios.post("/api/books", {
          title,
          fileSize: file.size,
        });
        const bookId = bookData.book.id;

        setUploadState("uploading");
        const formData = new FormData();
        formData.append("file", file);

        await axios.post(`/api/books/${bookId}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total)
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
          },
        });

        setUploadState("processing");
        await new Promise((r) => setTimeout(r, 500));
        setUploadState("done");
        toast.success(`"${title}" added to library`);
        fetchBooks(search, category === "All" ? "" : category);
      } catch (err) {
        console.error(err);
        toast.error("Upload failed. Please try again.");
      } finally {
        setTimeout(() => {
          setUploadState("idle");
          setUploadProgress(0);
        }, 1500);
      }
    },
    [search, category, fetchBooks]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: uploadState !== "idle",
  });

  const uploadLabels: Record<UploadState, string> = {
    idle: "Drag & drop a PDF, or click to browse",
    creating: "Creating book record...",
    uploading: `Uploading... ${uploadProgress}%`,
    processing: "Processing PDF & detecting chapters...",
    done: "Done!",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} book{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            setShowOnline(!showOnline);
            setOnlineBooks([]);
            setOnlineSearch("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            showOnline
              ? "bg-[#0F6E56] text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:border-[#0F6E56] hover:text-[#0F6E56]"
          }`}
        >
          <Globe size={15} />
          Search Online
        </button>
      </div>

      {/* Online Book Search Panel */}
      {showOnline && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Search Open Library
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Millions of free books — search and add to your library
              </p>
            </div>
            <button
              onClick={() => {
                setShowOnline(false);
                setOnlineBooks([]);
              }}
            >
              <X size={16} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <div className="relative mb-4">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={onlineSearch}
              onChange={(e) => setOnlineSearch(e.target.value)}
              placeholder="Search by title, author, subject..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
              autoFocus
            />
          </div>

          {onlineLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-[#0F6E56]" />
            </div>
          )}

          {!onlineLoading && onlineBooks.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 max-h-80 overflow-y-auto">
              {onlineBooks.map((book) => (
                <div
                  key={book.key}
                  className="flex flex-col rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-28 bg-gray-100 flex items-center justify-center">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <BookOpen size={24} className="text-gray-300" />
                    )}
                  </div>
                  <div className="p-2 flex flex-col">
                    <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
                      {book.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {book.author}
                    </p>
                    <button
                      onClick={() => importOnlineBook(book)}
                      className="mt-2 w-full bg-[#F0FAF6] hover:bg-[#0F6E56] hover:text-white text-[#0F6E56] text-xs font-medium py-1.5 rounded-lg transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!onlineLoading && onlineSearch && onlineBooks.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              No results found. Try a different search.
            </p>
          )}

          {!onlineSearch && (
            <p className="text-sm text-gray-400 text-center py-4">
              Type to search millions of books from Open Library
            </p>
          )}
        </div>
      )}

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-6 mb-6 text-center cursor-pointer transition-all ${
          uploadState !== "idle"
            ? "border-[#0F6E56] bg-[#F0FAF6] cursor-default"
            : isDragActive
            ? "border-[#0F6E56] bg-[#F0FAF6]"
            : "border-gray-200 bg-white hover:border-[#0F6E56] hover:bg-[#F0FAF6]"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-[#E8F5F0] rounded-xl flex items-center justify-center">
            {uploadState === "done" ? (
              <CheckCircle2 size={18} className="text-[#0F6E56]" />
            ) : uploadState !== "idle" ? (
              <Loader2 size={18} className="text-[#0F6E56] animate-spin" />
            ) : (
              <Upload size={18} className="text-[#0F6E56]" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-700">
            {uploadLabels[uploadState]}
          </p>
          {uploadState === "idle" && (
            <p className="text-xs text-gray-400">PDF files up to 50MB</p>
          )}
          {uploadState === "uploading" && (
            <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-[#0F6E56] rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your library..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                category === cat
                  ? "bg-[#0F6E56] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#0F6E56] hover:text-[#0F6E56]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse"
              >
                <div className="w-full h-36 bg-gray-100 rounded-xl mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">No books yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload a PDF or search online to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              menuOpen={menuOpen === book.id}
              onMenuToggle={(e) => {
                e.stopPropagation();
                setMenuOpen(menuOpen === book.id ? null : book.id);
              }}
              onDelete={() => {
                setMenuOpen(null);
                deleteBook(book.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookCard({
  book,
  menuOpen,
  onMenuToggle,
  onDelete,
}: {
  book: Book;
  menuOpen: boolean;
  onMenuToggle: (e: React.MouseEvent) => void;
  onDelete: () => void;
}) {
  const gradients = [
    "from-[#0F6E56] to-[#378ADD]",
    "from-[#378ADD] to-[#7C5CBF]",
    "from-[#7C5CBF] to-[#E07B39]",
    "from-[#0F6E56] to-[#7C5CBF]",
    "from-[#E07B39] to-[#0F6E56]",
  ];
  const grad = gradients[book.title.charCodeAt(0) % gradients.length];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div
        className={`relative h-36 bg-gradient-to-br ${grad} flex items-center justify-center`}
      >
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <BookOpen size={32} className="text-white/50" />
        )}
        {book.readingProgress && book.readingProgress.percentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-white"
              style={{ width: `${book.readingProgress.percentage}%` }}
            />
          </div>
        )}
        {book.category && (
          <div className="absolute top-2 left-2 bg-black/20 text-white text-xs px-2 py-0.5 rounded-full">
            {book.category}
          </div>
        )}
        <button
          onClick={onMenuToggle}
          className="absolute top-2 right-2 w-7 h-7 bg-black/20 hover:bg-black/40 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
        >
          <MoreVertical size={13} />
        </button>
        {menuOpen && (
          <div className="absolute top-9 right-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 w-36">
            <Link
              href={`/reader/${book.id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Eye size={13} /> Read
            </Link>
            <Link
              href={`/flashcards/${book.id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Brain size={13} /> Flashcards
            </Link>
            <Link
              href={`/quiz/${book.id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <ClipboardList size={13} /> Quiz
            </Link>
            <button
              onClick={onDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {truncate(book.title, 28)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {book.author ?? "Unknown author"}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">
            {book.fileSize > 0
              ? formatFileSize(book.fileSize)
              : `${book.pageCount}p`}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(book.createdAt)}
          </span>
        </div>
        {book.readingProgress && book.readingProgress.percentage > 0 && (
          <p className="text-xs text-[#0F6E56] mt-1 font-medium">
            {Math.round(book.readingProgress.percentage)}% read
          </p>
        )}
        <Link
          href={`/reader/${book.id}`}
          className="mt-3 w-full bg-[#F0FAF6] hover:bg-[#E1F5EE] text-[#0F6E56] text-xs font-medium py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
        >
          <BookOpen size={12} />
          {book.readingProgress && book.readingProgress.percentage > 0
            ? "Continue Reading"
            : "Start Reading"}
        </Link>
      </div>
    </div>
  );
}