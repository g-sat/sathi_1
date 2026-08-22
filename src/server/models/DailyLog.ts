import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const MealEntrySchema = new Schema(
  {
    type: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const DailyLogSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'PatientProfile', required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD, one log per day per patient
    glucoseLevel: Number,
    glucoseTiming: { type: String, enum: ['Fasting', 'Post-Meal', 'Random'] },
    meals: { type: [MealEntrySchema], default: [] },
    activityMinutes: Number,
    activityType: String,
    moodNote: String,
  },
  { timestamps: true }
);

DailyLogSchema.index({ patientId: 1, date: 1 }, { unique: true });

export type DailyLogDoc = InferSchemaType<typeof DailyLogSchema>;

export const DailyLog: Model<DailyLogDoc> =
  (mongoose.models.DailyLog as Model<DailyLogDoc>) ||
  mongoose.model<DailyLogDoc>('DailyLog', DailyLogSchema);
