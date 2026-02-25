import config from '../config';
import { Schema, model, Document } from 'mongoose';
import { hashPassword, verifyPassword } from '../services/auth.service';

//TODO Put more data for verification of emails, and paths for images, etc

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;

  createdAt: Date; //! auto-generated
  updatedAt: Date; //! auto-generated
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'username is required'],
      unique: true,
      trim: true,
      minlength: [1, 'username is too short']
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'email is invalid']
    },
    passwordHash: {
      type: String,
      required: [true, 'password is required']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

//? -middleware- for hashing the password
userSchema.pre<IUser>('save', async function () {
  if (!this.isModified('passwordHash')) return;

  this.passwordHash = await hashPassword(this.passwordHash);
});

//? -instance- compare password
userSchema.methods.comparePassword = async function (inputPassword: string): Promise<boolean> {
  try {
    return await verifyPassword(this.passwordHash, inputPassword);
  } catch (err) {
    return false;
  }
}

export const Users = model<IUser>('Users', userSchema, config.collections.users);