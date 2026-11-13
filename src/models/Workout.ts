import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type WorkoutSplit = "PUSH" | "PULL" | "LEGS" | "UPPER" | "LOWER" | "CUSTOM";

export interface IWorkoutSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  isPersonalRecord?: boolean;
}

export interface IWorkoutExercise {
  exerciseName: string;
  sets: IWorkoutSet[];
  notes?: string;
}

export interface IWorkout extends Document {
  userId: Types.ObjectId;
  targetDate: string; // YYYY-MM-DD
  split: WorkoutSplit;
  title: string;
  durationMinutes: number;
  exercises: IWorkoutExercise[];
  intensityRating: number; // 1-10
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutSetSchema = new Schema<IWorkoutSet>(
  {
    setNumber: { type: Number, required: true },
    reps: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    isPersonalRecord: { type: Boolean, default: false },
  },
  { _id: false }
);

const WorkoutExerciseSchema = new Schema<IWorkoutExercise>(
  {
    exerciseName: { type: String, required: true, trim: true },
    sets: [WorkoutSetSchema],
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const WorkoutSchema = new Schema<IWorkout>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetDate: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    split: {
      type: String,
      enum: ["PUSH", "PULL", "LEGS", "UPPER", "LOWER", "CUSTOM"],
      default: "PUSH",
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    durationMinutes: {
      type: Number,
      default: 60,
    },
    exercises: [WorkoutExerciseSchema],
    intensityRating: {
      type: Number,
      min: 1,
      max: 10,
      default: 8,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

WorkoutSchema.index({ userId: 1, targetDate: -1 });

const Workout: Model<IWorkout> =
  mongoose.models.Workout || mongoose.model<IWorkout>("Workout", WorkoutSchema);

export default Workout;

