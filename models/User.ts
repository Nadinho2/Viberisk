import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  resetToken?: string;
  resetExpires?: Date;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    resetToken: {
      type: String
    },
    resetExpires: {
      type: Date
    },
    tokenVersion: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function preSave() {
  const user = this as IUser;

  if (!user.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user.tokenVersion += 1;
  return;
});

userSchema.methods.comparePassword = function comparePassword(
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

