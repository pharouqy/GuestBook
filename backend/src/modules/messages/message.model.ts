/**
 * @file modules/messages/message.model.ts
 * @description Schéma Mongoose du message.
 * 
 * RÈGLE Clean Architecture : Ce fichier ne contient QUE la définition du schéma
 * et le type Mongoose. Aucune logique métier ici.
 * La logique métier appartient à message.service.ts
 */

import mongoose, { Document, Schema } from 'mongoose';

// Interface TypeScript du document Mongoose (usage interne backend uniquement)
export interface IMessage extends Document {
  author: string;
  content: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    author: {
      type: String,
      required: [true, 'Le nom de l\'auteur est requis'],
      trim: true,
      minlength: [2, 'Le nom doit faire au moins 2 caractères'],
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
    content: {
      type: String,
      required: [true, 'Le contenu du message est requis'],
      trim: true,
      minlength: [10, 'Le message doit faire au moins 10 caractères'],
      maxlength: [500, 'Le message ne peut pas dépasser 500 caractères'],
    },
    isApproved: {
      type: Boolean,
      default: false, // Les messages attendent modération par défaut
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
    versionKey: false, // Supprime le champ __v (inutile pour nous)
  },
);

// Index pour les requêtes fréquentes
MessageSchema.index({ isApproved: 1, createdAt: -1 }); // Liste publique (approuvés, plus récents en premier)
MessageSchema.index({ createdAt: -1 });                 // Dashboard admin (tous les messages)

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
