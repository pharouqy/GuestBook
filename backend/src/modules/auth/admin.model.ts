/**
 * @file modules/auth/admin.model.ts
 * @description Schéma Mongoose de l'administrateur.
 * 
 * RÈGLE Clean Architecture : Ce fichier ne contient QUE la définition du schéma
 * et le type Mongoose. Aucune logique métier ici.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  role: 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: [true, "L'adresse email est requise"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Veuillez fournir une adresse email valide'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Le mot de passe haché est requis'],
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Index unique sur l'email pour garantir l'unicité et optimiser les recherches
AdminSchema.index({ email: 1 }, { unique: true });

export const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema);
