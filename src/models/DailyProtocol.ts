import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISpiritualitySphere {
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  quran: boolean;
  arabic: boolean;
}

export interface IMentalSphere {
  dayPlanning: boolean;
  reading: boolean; // 10 pages
  selfLearning: boolean; // coding / business
}

export interface IPhysicalSphere {
  morningWorkout: boolean; // light workout + walk
  healthyBreakfast: boolean;
  healthyLunch: boolean;
  gymWorkout: boolean; // 7:30-8:00pm with progressive overload
  sleepTarget: boolean; // 7-9h, in bed by 11pm
}

export interface IEmotionalSphere {
  mentalPreparedness: boolean; // framed daily scenarios
  mushfaTime: boolean; // dedicated quality focus & planning
  familyTime: boolean; // family, love, friends check-in
}

export interface IFinancialSphere {
  auditCompleted: boolean;
  totalSpentToday: number;
}

export interface IPenaltyProgress {
  pushupsDone: number;
  pushupsTarget: number; // 20
  squatsDone: number;
  squatsTarget: number; // 20
  stepsDone: number;
  stepsTarget: number; // 10,000
  isCleared: boolean;
}

export interface IDailyProtocol extends Document {
  userId: Types.ObjectId;
  targetDate: string; // YYYY-MM-DD
  spirituality: ISpiritualitySphere;
  mentally: IMentalSphere;
  physically: IPhysicalSphere;
  emotionally: IEmotionalSphere;
  financially: IFinancialSphere;
  overallScore: number; // 0 - 100%
  inPenaltyZone: boolean;
  penalty: IPenaltyProgress;
  isTransgressed: boolean; // If true: purged XP for the day & broken streak
  transgressionReason?: string;
  transgressedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DailyProtocolSchema = new Schema<IDailyProtocol>(
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
    spirituality: {
      prayers: {
        fajr: { type: Boolean, default: false },
        dhuhr: { type: Boolean, default: false },
        asr: { type: Boolean, default: false },
        maghrib: { type: Boolean, default: false },
        isha: { type: Boolean, default: false },
      },
      quran: { type: Boolean, default: false },
      arabic: { type: Boolean, default: false },
    },
    mentally: {
      dayPlanning: { type: Boolean, default: false },
      reading: { type: Boolean, default: false },
      selfLearning: { type: Boolean, default: false },
    },
    physically: {
      morningWorkout: { type: Boolean, default: false },
      healthyBreakfast: { type: Boolean, default: false },
      healthyLunch: { type: Boolean, default: false },
      gymWorkout: { type: Boolean, default: false },
      sleepTarget: { type: Boolean, default: false },
    },
    emotionally: {
      mentalPreparedness: { type: Boolean, default: false },
      mushfaTime: { type: Boolean, default: false },
      familyTime: { type: Boolean, default: false },
    },
    financially: {
      auditCompleted: { type: Boolean, default: false },
      totalSpentToday: { type: Number, default: 0 },
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    inPenaltyZone: {
      type: Boolean,
      default: false,
      index: true,
    },
    penalty: {
      pushupsDone: { type: Number, default: 0 },
      pushupsTarget: { type: Number, default: 20 },
      squatsDone: { type: Number, default: 0 },
      squatsTarget: { type: Number, default: 20 },
      stepsDone: { type: Number, default: 0 },
      stepsTarget: { type: Number, default: 10000 },
      isCleared: { type: Boolean, default: false },
    },
    isTransgressed: {
      type: Boolean,
      default: false,
    },
    transgressionReason: {
      type: String,
      default: "",
    },
    transgressedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

DailyProtocolSchema.index({ userId: 1, targetDate: 1 }, { unique: true });

const DailyProtocol: Model<IDailyProtocol> =
  mongoose.models.DailyProtocol ||
  mongoose.model<IDailyProtocol>("DailyProtocol", DailyProtocolSchema);

export default DailyProtocol;

