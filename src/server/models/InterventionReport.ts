import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

// Each of the 9 sections in the master report template has a different
// internal shape (see src/types/index.ts ReportSectionDataMap), so `data` is
// stored loosely as Mixed here — the section `key` tells every layer
// (Gemini prompt builder, review UI, PDF export) how to interpret it.
const ReportSectionSchema = new Schema(
  {
    key: {
      type: String,
      enum: [
        'summary',
        'nutrition',
        'grocery',
        'recipes',
        'exercise',
        'behavioral',
        'weeklyPlan',
        'progression',
        'safety',
      ],
      required: true,
    },
    data: { type: Schema.Types.Mixed, required: true },
    version: { type: Number, default: 1 },
    lastPrompt: String,
  },
  { _id: false }
);

const InterventionReportSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'PatientProfile', required: true, index: true },
    chwId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    sections: { type: [ReportSectionSchema], default: [] },
    publishedAt: Date,
  },
  { timestamps: true }
);

export type InterventionReportDoc = InferSchemaType<typeof InterventionReportSchema>;

export const InterventionReport: Model<InterventionReportDoc> =
  (mongoose.models.InterventionReport as Model<InterventionReportDoc>) ||
  mongoose.model<InterventionReportDoc>('InterventionReport', InterventionReportSchema);
