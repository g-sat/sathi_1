import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const NudgeSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'PatientProfile', required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    language: { type: String, required: true },
    message: { type: String, required: true }, // English source
    translatedMessage: { type: String, required: true }, // in patient's local language
  },
  { timestamps: true }
);

NudgeSchema.index({ patientId: 1, date: 1 }, { unique: true });

export type NudgeDoc = InferSchemaType<typeof NudgeSchema>;

export const Nudge: Model<NudgeDoc> =
  (mongoose.models.Nudge as Model<NudgeDoc>) || mongoose.model<NudgeDoc>('Nudge', NudgeSchema);
