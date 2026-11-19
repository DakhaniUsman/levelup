import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBodyWeight extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BodyWeightSchema = new Schema<IBodyWeight>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    weightKg: {
      type: Number,
      required: true,
      min: [20, "Weight must be at least 20 kg"],
      max: [300, "Weight cannot exceed 300 kg"],
    },
    notes: {
      type: String,
      default: "",
      maxlength: [200, "Notes cannot exceed 200 characters"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// One entry per user per day
BodyWeightSchema.index({ userId: 1, date: 1 }, { unique: true });

const BodyWeight: Model<IBodyWeight> =
  mongoose.models.BodyWeight ||
  mongoose.model<IBodyWeight>("BodyWeight", BodyWeightSchema);

export default BodyWeight;
