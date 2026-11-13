import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type BookmarkCategory =
  | "PROGRAMMING"
  | "TECHNOLOGY"
  | "BUSINESS"
  | "FINANCE"
  | "PERSONAL_DEV"
  | "BOOKS"
  | "TUTORIALS"
  | "RESEARCH";

export interface IBookmark extends Document {
  userId: Types.ObjectId;
  title: string;
  url: string;
  description?: string;
  notes?: string;
  category: BookmarkCategory;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Bookmark title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "PROGRAMMING",
        "TECHNOLOGY",
        "BUSINESS",
        "FINANCE",
        "PERSONAL_DEV",
        "BOOKS",
        "TUTORIALS",
        "RESEARCH",
      ],
      default: "PROGRAMMING",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

BookmarkSchema.index({ userId: 1, isArchived: 1, isFavorite: 1 });
BookmarkSchema.index({
  title: "text",
  description: "text",
  notes: "text",
  tags: "text",
});

const Bookmark: Model<IBookmark> =
  mongoose.models.Bookmark ||
  mongoose.model<IBookmark>("Bookmark", BookmarkSchema);

export default Bookmark;

