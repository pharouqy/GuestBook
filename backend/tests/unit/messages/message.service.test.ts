/**
 * @file tests/unit/messages/message.service.test.ts
 * @description Tests unitaires du MessageService.
 * 
 * PRINCIPE : On teste la LOGIQUE MÉTIER uniquement.
 * Le Repository est mocké → aucune base de données nécessaire.
 * Si ce test passe, la logique métier est correcte indépendamment de la BDD.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageService } from '../../../src/modules/messages/message.service';
import { MessageRepository } from '../../../src/modules/messages/message.repository';
import { NotFoundError } from '../../../src/shared/errors/AppError';
import type { MessageDTO, PaginatedMessages } from '@guestbook/shared';

// Mock du Repository (Clean Architecture en action)
vi.mock('../../../src/modules/messages/message.repository');

const mockMessage: MessageDTO = {
  id: '507f1f77bcf86cd799439011',
  author: 'Jean Dupont',
  content: 'Super livre d\'or, je reviendrai !',
  createdAt: '2026-01-15T10:00:00.000Z',
  isApproved: true,
};

const mockPaginated: PaginatedMessages = {
  messages: [mockMessage],
  pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
};

describe('MessageService', () => {
  let service: MessageService;
  let repository: jest.Mocked<MessageRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new MessageRepository() as jest.Mocked<MessageRepository>;
    service = new MessageService(repository);
  });

  describe('getPublicMessages', () => {
    it('retourne uniquement les messages approuvés', async () => {
      repository.findApproved = vi.fn().mockResolvedValue(mockPaginated);

      const result = await service.getPublicMessages(1, 10);

      expect(repository.findApproved).toHaveBeenCalledWith(1, 10);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]?.isApproved).toBe(true);
    });
  });

  describe('createMessage', () => {
    it('crée un message avec les données correctes', async () => {
      const pendingMessage = { ...mockMessage, isApproved: false };
      repository.create = vi.fn().mockResolvedValue(pendingMessage);

      const result = await service.createMessage({
        author: 'Jean Dupont',
        content: 'Super livre d\'or !',
      });

      expect(repository.create).toHaveBeenCalledOnce();
      expect(result.isApproved).toBe(false); // Règle métier : toujours non approuvé à la création
    });
  });

  describe('deleteMessage', () => {
    it('lance NotFoundError si le message n\'existe pas', async () => {
      repository.delete = vi.fn().mockResolvedValue(false);

      await expect(service.deleteMessage('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('supprime le message s\'il existe', async () => {
      repository.delete = vi.fn().mockResolvedValue(true);

      await expect(service.deleteMessage('507f1f77bcf86cd799439011')).resolves.toBeUndefined();
    });
  });

  describe('approveMessage', () => {
    it('lance NotFoundError si le message n\'existe pas', async () => {
      repository.updateApproval = vi.fn().mockResolvedValue(null);

      await expect(service.approveMessage('507f1f77bcf86cd799439011', true)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('approuve le message avec succès', async () => {
      const approvedMessage = { ...mockMessage, isApproved: true };
      repository.updateApproval = vi.fn().mockResolvedValue(approvedMessage);

      const result = await service.approveMessage('507f1f77bcf86cd799439011', true);

      expect(result.isApproved).toBe(true);
    });
  });
});
