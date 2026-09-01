import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const UserSchema = new Schema(
  {
    role: { type: String, enum: ['chw'], default: 'chw', required: true },
    name: { type: String, required: true, trim: true },

    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true, index: true },
    passwordHash: { type: String, select: false },

    emailVerified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    verificationCodeExpires: { type: Date, select: false },
    resetCode: { type: String, select: false },
    resetCodeExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>('User', UserSchema);
