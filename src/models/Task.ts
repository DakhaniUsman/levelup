import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type TaskCategory =
  | "PERSONAL"
  | "CAREER"
  | "FITNESS"
  | "LEARNING"
  | "SPIRITUAL"
  | "FINANCE"
  | "BUSINESS";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface ISubtask {
  _id?: Types.ObjectId;
  title: string;
  isCompleted: boolean;
}

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  estimatedMinutes?: number;
  xpReward: number;
  isArchived: boolean;
  completedAt?: Date;
  subtasks: ISubtask[];
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskSchema = new Schema<ISubtask>({
  title: { type: String, required: true, trim: true },
  isCompleted: { type: Boolean, default: false },
});

const TaskSchema = new Schema<ITask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [150, "Task title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    category: {
      type: String,
      enum: [
        "PERSONAL",
        "CAREER",
        "FITNESS",
        "LEARNING",
        "SPIRITUAL",
        "FINANCE",
        "BUSINESS",
      ],
      default: "PERSONAL",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "TODO",
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedMinutes: {
      type: Number,
      min: 1,
      default: 30,
    },
    xpReward: {
      type: Number,
      default: 15,
      min: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    subtasks: [SubtaskSchema],
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ userId: 1, isArchived: 1, status: 1, dueDate: 1 });

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;

