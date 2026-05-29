/**
 * @file modules/auth/admin.repository.ts
 * @description Couche d'accès aux données de l'administrateur.
 * 
 * RÈGLE Clean Architecture : Le Repository est l'unique point d'accès à MongoDB.
 * Il convertit les Documents Mongoose en types TypeScript purs et isolés.
 */

import { AdminModel, IAdmin } from './admin.model';

export interface AdminCredentials {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin';
}

function toCredentials(doc: IAdmin): AdminCredentials {
  return {
    id: doc._id.toString(),
    email: doc.email,
    passwordHash: doc.passwordHash,
    role: doc.role,
  };
}

export class AdminRepository {
  /**
   * Trouve un administrateur par son email
   */
  async findByEmail(email: string): Promise<AdminCredentials | null> {
    const doc = await AdminModel.findOne({ email: email.toLowerCase() }).lean();
    if (!doc) return null;
    return toCredentials(doc as IAdmin);
  }

  /**
   * Trouve un administrateur par son identifiant unique
   */
  async findById(id: string): Promise<AdminCredentials | null> {
    const doc = await AdminModel.findById(id).lean();
    if (!doc) return null;
    return toCredentials(doc as IAdmin);
  }

  /**
   * Crée un nouvel administrateur (principalement pour le script de seed)
   */
  async create(adminData: { email: string; passwordHash: string }): Promise<AdminCredentials> {
    const doc = await AdminModel.create({
      email: adminData.email.toLowerCase(),
      passwordHash: adminData.passwordHash,
      role: 'admin',
    });
    return toCredentials(doc);
  }
}
