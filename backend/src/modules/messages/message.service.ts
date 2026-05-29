/**
 * @file modules/messages/message.service.ts
 * @description Logique métier du module Messages.
 * 
 * RÈGLE Clean Architecture :
 * ✅ Le Service connaît le Repository
 * ❌ Le Service ne connaît PAS Express (pas de req, res, next)
 * ❌ Le Service ne connaît PAS Mongoose (pas d'import mongoose ici)
 * 
 * TESTABILITÉ : Ce Service peut être testé unitairement en mockant
 * uniquement le Repository — pas besoin de base de données.
 */

import { MessageRepository } from './message.repository';
import { NotFoundError } from '../../shared/errors/AppError';
import type { MessageDTO, CreateMessagePayload, PaginatedMessages } from '@guestbook/shared';

export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  /**
   * Récupère les messages approuvés pour la page publique
   * Règle métier : seuls les messages approuvés sont visibles du public
   */
  async getPublicMessages(page: number, limit: number): Promise<PaginatedMessages> {
    return this.messageRepository.findApproved(page, limit);
  }

  /**
   * Récupère tous les messages pour le dashboard admin
   * Règle métier : l'admin voit tout (approuvés et en attente)
   */
  async getAllMessages(page: number, limit: number): Promise<PaginatedMessages> {
    return this.messageRepository.findAll(page, limit);
  }

  /**
   * Crée un nouveau message
   * Règle métier : les messages commencent toujours en état "non approuvé"
   */
  async createMessage(payload: CreateMessagePayload): Promise<MessageDTO> {
    // Le Repository gère le default isApproved: false
    return this.messageRepository.create(payload);
  }

  /**
   * Approuve ou rejette un message
   * Règle métier : seul l'admin peut approuver/rejeter
   */
  async approveMessage(id: string, isApproved: boolean): Promise<MessageDTO> {
    const updated = await this.messageRepository.updateApproval(id, isApproved);

    if (!updated) {
      throw new NotFoundError(`Message avec l'ID ${id} introuvable`);
    }

    return updated;
  }

  /**
   * Supprime définitivement un message
   * Règle métier : seul l'admin peut supprimer
   */
  async deleteMessage(id: string): Promise<void> {
    const deleted = await this.messageRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError(`Message avec l'ID ${id} introuvable`);
    }
  }
}
