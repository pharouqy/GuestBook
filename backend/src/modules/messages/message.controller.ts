/**
 * @file modules/messages/message.controller.ts
 * @description Handlers HTTP du module Messages.
 * 
 * RÈGLE Clean Architecture :
 * ✅ Le Controller connaît Express (req, res)
 * ✅ Le Controller connaît le Service
 * ❌ Le Controller ne connaît PAS Mongoose
 * ❌ Le Controller ne contient PAS de logique métier
 * 
 * RESPONSABILITÉ UNIQUE :
 * 1. Parser les données HTTP entrantes (body, params, query)
 * 2. Appeler le Service avec les données parsées
 * 3. Formater la réponse HTTP (status code + body JSON)
 */

import { Request, Response, NextFunction } from 'express';
import { MessageService } from './message.service';
import type { CreateMessageInput, PaginationQuery, ApproveMessageInput } from './message.validation';
import type { ApiSuccessResponse, PaginatedMessages, MessageDTO } from '@guestbook/shared';

export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * GET /api/messages
   * Public — liste des messages approuvés avec pagination
   */
  getPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = req.query as unknown as PaginationQuery;
      const result = await this.messageService.getPublicMessages(page, limit);

      const response: ApiSuccessResponse<PaginatedMessages> = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/messages
   * Admin uniquement — tous les messages
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = req.query as unknown as PaginationQuery;
      const result = await this.messageService.getAllMessages(page, limit);

      const response: ApiSuccessResponse<PaginatedMessages> = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/messages
   * Public — soumettre un nouveau message
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateMessageInput;
      const message = await this.messageService.createMessage(body);

      const response: ApiSuccessResponse<MessageDTO> = {
        success: true,
        data: message,
        message: 'Votre message a été soumis et sera visible après modération.',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/admin/messages/:id/approve
   * Admin uniquement — approuver ou rejeter un message
   */
  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { isApproved } = req.body as ApproveMessageInput;
      const message = await this.messageService.approveMessage(id, isApproved);

      const response: ApiSuccessResponse<MessageDTO> = {
        success: true,
        data: message,
        message: `Message ${isApproved ? 'approuvé' : 'rejeté'} avec succès.`,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/admin/messages/:id
   * Admin uniquement — supprimer définitivement un message
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.messageService.deleteMessage(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
