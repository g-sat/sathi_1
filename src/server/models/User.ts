import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const UserSchema = new Schema(
  {
    role: { type: String, enum: ['chw', 'patient'], required: true },
    name: { type: String, required: true, trim: true },

    // Email + password auth. `email` is optional at the schema level because
    // a patient's User record is first created (with no email/password) by
    // their CHW during onboarding — the patient later "claims" it with their
    // own email + password via the Patient ID we handed them.
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true, index: true },
    passwordHash: { type: String, select: false },

    emailVerified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    verificationCodeExpires: { type: Date, select: false },
    resetCode: { type: String, select: false },
    resetCodeExpires: { type: Date, select: false },

    // For patients this is set to their Patient ID at onboarding time, which
    // is what lets the patient-registration flow find & "claim" the right
    // pre-created account.
    loginCode: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>('User', UserSchema);
