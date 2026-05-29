/**
 * Ajoute les entrées @next/swc-* sous frontend/node_modules/ dans package-lock.json.
 * Next.js 15 vérifie ces chemins en monorepo npm ; sans eux, il tente un patch qui échoue (ENOWORKSPACES).
 */
const fs = require('fs');
const path = require('path');

const lockPath = path.join(__dirname, '../package-lock.json');
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));

if (!lock.packages) {
  console.log('Lockfile v1 — rien à patcher.');
  process.exit(0);
}

let nextPkgPath = null;
for (const pkg of Object.keys(lock.packages)) {
  if (pkg.endsWith('node_modules/next')) {
    nextPkgPath = pkg;
    break;
  }
}

if (!nextPkgPath) {
  console.error('Package next introuvable dans package-lock.json');
  process.exit(1);
}

const prefix = nextPkgPath.slice(0, -'next'.length);
const swcPackages = Object.keys(lock.packages[nextPkgPath]?.optionalDependencies ?? {})
  .filter((name) => name.startsWith('@next/swc-'));

let patched = 0;
for (const swc of swcPackages) {
  const srcKey = `node_modules/${swc}`;
  const destKey = `${prefix}${swc}`;
  if (lock.packages[srcKey] && !lock.packages[destKey]) {
    lock.packages[destKey] = { ...lock.packages[srcKey] };
    patched++;
  }
}

if (patched === 0) {
  console.log('Lockfile déjà à jour pour les dépendances SWC.');
  process.exit(0);
}

fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
console.log(`Lockfile patché : ${patched} entrée(s) SWC ajoutée(s). Exécutez "npm install".`);
