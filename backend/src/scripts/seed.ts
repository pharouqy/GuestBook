/**
 * @file scripts/seed.ts
 * @description Script de seeding pour initialiser la base de données avec l'administrateur
 * et des messages de démonstration.
 */

import { config } from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Charger le fichier .env avant toute importation du schéma ou de la config
config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB, disconnectDB } from '../config/db';
import { AdminModel } from '../modules/auth/admin.model';
import { MessageModel } from '../modules/messages/message.model';

async function seed() {
  console.log('🌱 Début du seeding de la base de données...');

  try {
    // 1. Connexion
    await connectDB();

    // 2. Récupérer les variables du seed
    const email = process.env['ADMIN_EMAIL'] ?? 'admin@example.com';
    const password = process.env['ADMIN_PASSWORD'] ?? 'AdminSecurePassword2026!';

    console.log(`Email de l'admin à créer : ${email}`);

    // 3. Vérifier si l'admin existe déjà
    const existingAdmin = await AdminModel.findOne({ email });

    if (existingAdmin) {
      console.log('ℹ️  L\'administrateur initial existe déjà. Passage.');
    } else {
      console.log('➕ Création de l\'administrateur initial...');
      const passwordHash = await bcrypt.hash(password, 10);
      await AdminModel.create({
        email,
        passwordHash,
        role: 'admin',
      });
      console.log('✅ Administrateur initial créé avec succès.');
    }

    // 4. Ajouter des messages de démonstration s'il n'y en a pas
    const messageCount = await MessageModel.countDocuments();
    if (messageCount === 0) {
      console.log('➕ Ajout des messages de démonstration...');
      await MessageModel.create([
        {
          author: 'Alice',
          content: 'Le site est absolument magnifique ! Bravo pour ce super design minimaliste et performant.',
          isApproved: true,
        },
        {
          author: 'Bob',
          content: 'L\'expérience utilisateur est fluide, les pages chargent instantanément. Hâte de voir la suite.',
          isApproved: true,
        },
        {
          author: 'Charlie',
          content: 'Ceci est un message en attente de modération pour tester le tableau de bord admin.',
          isApproved: false,
        },
      ]);
      console.log('✅ Messages de démonstration créés avec succès.');
    } else {
      console.log('ℹ️  La base contient déjà des messages. Aucun message de démo inséré.');
    }

    console.log('🎉 Seeding terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du seeding de la base de données :', error);
  } finally {
    await disconnectDB();
  }
}

void seed();
