import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ProtocolSphere =
  | "SPIRITUALITY"
  | "MENTAL"
  | "PHYSICAL"
  | "EMOTIONAL"
  | "FINANCIAL";

export type ProtocolItemType =
  | "CHECKBOX"
  | "PRAYER_TRACKER"
  | "WORKOUT_LOG"
  | "FINANCIAL_AUDIT";

export interface IProtocolItem extends Document {
  userId: Types.ObjectId;
  sphere: ProtocolSphere;
  title: string;
  description?: string;
  type: ProtocolItemType;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProtocolItemSchema = new Schema<IProtocolItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sphere: {
      type: String,
      enum: ["SPIRITUALITY", "MENTAL", "PHYSICAL", "EMOTIONAL", "FINANCIAL"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    type: {
      type: String,
      enum: ["CHECKBOX", "PRAYER_TRACKER", "WORKOUT_LOG", "FINANCIAL_AUDIT"],
      default: "CHECKBOX",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ProtocolItemSchema.index({ userId: 1, isDeleted: 1, sphere: 1, order: 1 });

const ProtocolItem: Model<IProtocolItem> =
  mongoose.models.ProtocolItem ||
  mongoose.model<IProtocolItem>("ProtocolItem", ProtocolItemSchema);

export default ProtocolItem;

