/**
 * @file modules/messages/message.repository.ts
 * @description Couche d'accès aux données — SEULE couche qui connaît Mongoose.
 * 
 * RÈGLE Clean Architecture : Le Repository est l'unique point d'accès à MongoDB.
 * Il retourne des types métier (MessageDTO), pas des Documents Mongoose.
 * Le Service n'importe jamais Mongoose directement.
 * 
 * AVANTAGE : Pour migrer de MongoDB vers PostgreSQL, on ne touche QUE ce fichier.
 */

import { MessageModel } from './message.model';
import type { MessageDTO, CreateMessagePayload, PaginatedMessages } from '@guestbook/shared';

interface MessageRecord {
  _id: { toString(): string };
  author: string;
  content: string;
  createdAt: Date;
  isApproved: boolean;
}

/**
 * Convertit un Document Mongoose en DTO sérialisable
 * (évite d'exposer les internals Mongoose au Service)
 */
function toDTO(doc: MessageRecord): MessageDTO {
  return {
    id: doc._id.toString(),
    author: doc.author,
    content: doc.content,
    createdAt: doc.createdAt.toISOString(),
    isApproved: doc.isApproved,
  };
}

export class MessageRepository {
  /** Récupère les messages approuvés (page publique) avec pagination */
  async findApproved(page: number, limit: number): Promise<PaginatedMessages> {
    const skip = (page - 1) * limit;
    const filter = { isApproved: true };

    const [messages, total] = await Promise.all([
      MessageModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      MessageModel.countDocuments(filter),
    ]);

    return {
      messages: messages.map((m) => toDTO(m)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Récupère TOUS les messages (dashboard admin) avec pagination */
  async findAll(page: number, limit: number): Promise<PaginatedMessages> {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      MessageModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      MessageModel.countDocuments(),
    ]);

    return {
      messages: messages.map((m) => toDTO(m)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Récupère un message par son ID */
  async findById(id: string): Promise<MessageDTO | null> {
    const doc = await MessageModel.findById(id).lean();
    if (!doc) return null;
    return toDTO(doc);
  }

  /** Crée un nouveau message (non approuvé par défaut) */
  async create(payload: CreateMessagePayload): Promise<MessageDTO> {
    const doc = await MessageModel.create({
      author: payload.author,
      content: payload.content,
      isApproved: false,
    });
    return toDTO(doc);
  }

  /** Met à jour le statut d'approbation d'un message */
  async updateApproval(id: string, isApproved: boolean): Promise<MessageDTO | null> {
    const doc = await MessageModel.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true, runValidators: true },
    ).lean();
    if (!doc) return null;
    return toDTO(doc);
  }

  /** Supprime un message */
  async delete(id: string): Promise<boolean> {
    const result = await MessageModel.findByIdAndDelete(id);
    return result !== null;
  }
}
