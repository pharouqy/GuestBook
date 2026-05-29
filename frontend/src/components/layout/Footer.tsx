/**
 * @file components/layout/Footer.tsx
 * @description Pied de page du site.
 * 
 * SERVER COMPONENT : affichage pur.
 */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t-2 border-border/50 bg-muted/20 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section Branding */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-foreground">📖 Livre d'Or</h3>
            <p className="text-sm text-muted-foreground">
              Un espace de partage pour laisser vos impressions et souvenirs.
            </p>
          </div>

          {/* Section Liens */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Voir tous les messages
                </a>
              </li>
              <li>
                <a href="/#form" className="text-muted-foreground hover:text-primary transition-colors">
                  Ajouter un message
                </a>
              </li>
              <li>
                <a href="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                  Espace administration
                </a>
              </li>
            </ul>
          </div>

          {/* Section Informations */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Informations</h4>
            <p className="text-sm text-muted-foreground">
              Tous les messages sont modérés avant publication pour assurer un espace respectueux.
            </p>
          </div>
        </div>

        {/* Séparateur */}
        <div className="my-8 border-t border-border/50" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {currentYear} Livre d'Or. Tous droits réservés.
          </p>
          <p>
            Conçu avec 💙 pour partager les bons moments
          </p>
        </div>
      </div>
    </footer>
  );
}
