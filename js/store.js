// Couche de données : Firebase (Firestore + Authentication) ou mode démo (navigateur)
import { firebaseConfig, firebaseActif, FIREBASE_SDK } from '../firebase-config.js?v=202611252017';
import { TEXTES_ORIGINE, LIENS_ORIGINE, LIVRES_ORIGINE, PHOTOS_ORIGINE, CATEGORIES_ORIGINE, REALISATIONS_ORIGINE } from './donnees.js?v=202611252017';

export const COLLECTIONS = ['contenu', 'images', 'livres', 'photos', 'projets', 'realisations', 'cosplays'];
export const mode = firebaseActif ? 'firebase' : 'demo';

// Données en mémoire : { livres: { id: {...} }, ... }
export const db = Object.fromEntries(COLLECTIONS.map(c => [c, {}]));
const abonnes = new Set();
let notifPrevue = false;
function notifier() {
  if (notifPrevue) return;
  notifPrevue = true;
  queueMicrotask(() => { notifPrevue = false; abonnes.forEach(f => { try { f(); } catch (e) { console.error(e); } }); });
}
export function surChangement(f) { abonnes.add(f); return () => abonnes.delete(f); }

// ---------- Erreurs ----------
export let erreurLecture = null;
let gestionnaireErreur = () => {};
export function surErreur(f) { gestionnaireErreur = f; }
export function utilisateurCourant() { return fb?.auth?.currentUser?.email || (mode === 'demo' ? 'mode démo' : ''); }
export function messageErreur(err) {
  const code = err?.code || '';
  if (code === 'categorie-non-vide') return err.message;
  if (code.includes('permission-denied')) return `Firebase a refusé l'accès (compte : ${utilisateurCourant() || 'aucun'}). Vérifiez que les règles du fichier firestore.rules sont bien publiées dans Firebase, puis reconnectez-vous.`;
  if (code.includes('unavailable') || code.includes('network')) return 'Firebase est injoignable (pas de réseau, ou un bloqueur de publicité). Les modifications sont gardées sur l\'appareil et partiront dès que la connexion revient.';
  if (code.includes('unauthenticated')) return 'Session expirée : déconnectez-vous puis reconnectez-vous.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') || code.includes('invalid-email')) return 'E-mail ou mot de passe incorrect.';
  if (code.includes('too-many-requests')) return 'Trop d\'essais. Patientez quelques minutes ou réinitialisez le mot de passe.';
  if (code.includes('user-disabled')) return 'Ce compte a été désactivé.';
  if (code.includes('resource-exhausted') || /exceeds the maximum/i.test(err?.message || '')) return 'Fichier trop lourd pour la base. Essayez une image plus petite.';
  if (code.includes('quota') || err?.name === 'QuotaExceededError') return 'Mémoire du navigateur pleine (mode démo) : supprimez quelques images de démonstration.';
  return 'Erreur : ' + (err?.message || code || 'inconnue');
}

// Attend la confirmation du serveur au plus 8 s ; au-delà, l'écriture reste en file
// d'attente sur l'appareil et une erreur éventuelle est signalée plus tard.
function suivre(promesse) {
  let regle = false;
  const delai = new Promise(res => setTimeout(() => { if (!regle) { regle = true; res('attente'); } }, 8000));
  const suivie = promesse.then(v => { regle = true; return v; }, e => { if (regle) gestionnaireErreur(e); regle = true; throw e; });
  suivie.catch(() => {});
  return Promise.race([suivie, delai]);
}

export function liste(col) {
  return Object.entries(db[col]).map(([id, v]) => ({ id, ...v })).sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
}
export function obtenir(col, id) { const v = db[col][id]; return v ? { id, ...v } : null; }
export function textes() { return { ...TEXTES_ORIGINE, ...(db.contenu.textes || {}) }; }
export function liens() { return { ...LIENS_ORIGINE, ...(db.contenu.liens || {}) }; }
export function image(cle) { return db.images[cle]?.data || ''; }
export function projetsAImporter() { return Object.keys(db.projets).length > 0 && !Object.keys(db.realisations).length; }
export function baseVide() { return !Object.keys(db.contenu).length && !Object.keys(db.livres).length && !Object.keys(db.photos).length; }

function idAleatoire() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }
function nettoyer(obj) { return JSON.parse(JSON.stringify(obj)); }

// =====================================================================
//  MODE DÉMO
// =====================================================================
const CLE_DEMO = 'kmauger-gestion-demo-v3';
function contenuOrigine() {
  const d = Object.fromEntries(COLLECTIONS.map(c => [c, {}]));
  d.contenu = { textes: { ...TEXTES_ORIGINE }, liens: { ...LIENS_ORIGINE } };
  LIVRES_ORIGINE.forEach((e, i) => d.livres['liv' + i] = { ...e });
  PHOTOS_ORIGINE.forEach((e, i) => d.photos['pho' + i] = { ...e });
  CATEGORIES_ORIGINE.forEach(({ id, ...e }) => d.projets[id] = e);
  REALISATIONS_ORIGINE.forEach((e, i) => d.realisations['rea' + i] = { ...e });
  return d;
}
const demo = {
  charger() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(CLE_DEMO)); } catch (e) { d = null; }
    if (!d) d = contenuOrigine();
    COLLECTIONS.forEach(c => { db[c] = d[c] || {}; });
    try { this.sauver(); } catch (e) {}
  },
  sauver() { localStorage.setItem(CLE_DEMO, JSON.stringify(db)); },
  reinitialiser() { try { localStorage.removeItem(CLE_DEMO); } catch (e) {} this.charger(); notifier(); }
};
export function reinitialiserDemo() { demo.reinitialiser(); }
// En démo, une écriture qui dépasse la mémoire du navigateur est annulée
function sauverDemo(annuler) { try { demo.sauver(); } catch (e) { annuler(); throw e; } notifier(); }

// =====================================================================
//  FIREBASE
// =====================================================================
let fb = null;
async function chargerFirebase() {
  const [appMod, authMod, fsMod] = await Promise.all([
    import(`${FIREBASE_SDK}/firebase-app.js`),
    import(`${FIREBASE_SDK}/firebase-auth.js`),
    import(`${FIREBASE_SDK}/firebase-firestore.js`)
  ]);
  const app = appMod.initializeApp(firebaseConfig);
  const auth = authMod.getAuth(app);
  let fs;
  try {
    fs = fsMod.initializeFirestore(app, { localCache: fsMod.persistentLocalCache({ tabManager: fsMod.persistentMultipleTabManager() }) });
  } catch (e) {
    fs = fsMod.getFirestore(app);
  }
  fb = { auth, fs, a: authMod, f: fsMod };
}

let desabonnements = [];
let premiersChargements = new Set();
export function chargementTermine() { return mode === 'demo' || premiersChargements.size >= COLLECTIONS.length; }
function ecouterTout() {
  desabonnements.forEach(u => u());
  premiersChargements = new Set();
  desabonnements = COLLECTIONS.map(c => fb.f.onSnapshot(fb.f.collection(fb.fs, c), snap => {
    const m = {};
    snap.forEach(d => { m[d.id] = d.data(); });
    db[c] = m;
    premiersChargements.add(c);
    if (erreurLecture) erreurLecture = null;
    notifier();
  }, err => { console.error('Lecture ' + c, err); erreurLecture = err; premiersChargements.add(c); notifier(); }));
}

// =====================================================================
//  API commune
// =====================================================================
export async function initialiser() {
  if (mode === 'demo') { demo.charger(); return; }
  await chargerFirebase();
}

export function surConnexion(cb) {
  if (mode === 'demo') {
    let connecte = false;
    try { connecte = sessionStorage.getItem('kmauger-demo-session') === '1'; } catch (e) {}
    cb(connecte ? { email: 'demo@exemple.fr', demo: true } : null);
    return;
  }
  fb.a.onAuthStateChanged(fb.auth, user => {
    if (user) ecouterTout(); else { desabonnements.forEach(u => u()); desabonnements = []; }
    cb(user);
  });
}

export async function connexion(email, motDePasse) {
  if (mode === 'demo') {
    try { sessionStorage.setItem('kmauger-demo-session', '1'); } catch (e) {}
    return { email: 'demo@exemple.fr', demo: true };
  }
  await fb.a.setPersistence(fb.auth, fb.a.browserLocalPersistence);
  const r = await fb.a.signInWithEmailAndPassword(fb.auth, email, motDePasse);
  return r.user;
}

export async function motDePasseOublie(email) {
  if (mode === 'demo') return;
  await fb.a.sendPasswordResetEmail(fb.auth, email);
}

export async function deconnexion() {
  if (mode === 'demo') { try { sessionStorage.removeItem('kmauger-demo-session'); } catch (e) {} location.reload(); return; }
  await fb.a.signOut(fb.auth);
}

export async function enregistrer(col, id, donnees) {
  const data = nettoyer(donnees);
  if (mode === 'demo') { const avant = db[col][id]; db[col][id] = data; sauverDemo(() => { if (avant) db[col][id] = avant; else delete db[col][id]; }); return; }
  return suivre(fb.f.setDoc(fb.f.doc(fb.fs, col, id), data));
}
export async function creer(col, donnees) {
  const id = idAleatoire();
  await enregistrer(col, id, donnees);
  return id;
}
export async function modifier(col, id, champs) {
  const data = nettoyer(champs);
  if (mode === 'demo') { const avant = db[col][id]; db[col][id] = { ...(avant || {}), ...data }; sauverDemo(() => { if (avant) db[col][id] = avant; else delete db[col][id]; }); return; }
  return suivre(fb.f.setDoc(fb.f.doc(fb.fs, col, id), data, { merge: true }));
}
export async function supprimer(col, id) {
  if (mode === 'demo') { delete db[col][id]; demo.sauver(); notifier(); return; }
  return suivre(fb.f.deleteDoc(fb.f.doc(fb.fs, col, id)));
}

// Plusieurs écritures : [{ type: 'set'|'merge'|'delete', col, id, data }]
export async function lot(operations) {
  if (mode === 'demo') {
    operations.forEach(o => {
      if (o.type === 'delete') delete db[o.col][o.id];
      else if (o.type === 'merge') db[o.col][o.id] = { ...(db[o.col][o.id] || {}), ...nettoyer(o.data) };
      else db[o.col][o.id] = nettoyer(o.data);
    });
    demo.sauver(); notifier(); return;
  }
  for (let i = 0; i < operations.length; i += 400) {
    const b = fb.f.writeBatch(fb.fs);
    operations.slice(i, i + 400).forEach(o => {
      const ref = fb.f.doc(fb.fs, o.col, o.id);
      if (o.type === 'delete') b.delete(ref);
      else if (o.type === 'merge') b.set(ref, nettoyer(o.data), { merge: true });
      else b.set(ref, nettoyer(o.data));
    });
    const r = await suivre(b.commit());
    if (r === 'attente') return 'attente';
  }
}

// ---------- Photos de la galerie : aperçu dans « photos », grande version dans « photos_hd » ----------
export async function ajouterPhoto(meta, apercu, hd) {
  const id = idAleatoire();
  if (mode === 'demo') {
    // Le navigateur a peu de place : en démo on ne garde que l'aperçu
    db.photos[id] = nettoyer({ ...meta, apercu, hd: false });
    sauverDemo(() => { delete db.photos[id]; });
    return id;
  }
  await suivre(fb.f.setDoc(fb.f.doc(fb.fs, 'photos_hd', id), { data: hd }));
  await suivre(fb.f.setDoc(fb.f.doc(fb.fs, 'photos', id), nettoyer({ ...meta, apercu, hd: true })));
  return id;
}
export async function supprimerPhoto(id) {
  const p = obtenir('photos', id);
  await supprimer('photos', id);
  if (p?.hd && mode === 'firebase') await suivre(fb.f.deleteDoc(fb.f.doc(fb.fs, 'photos_hd', id)));
}

// ---------- Images fixes du site (bannières, cartes, portrait) ----------
export function changerImage(cle, data) { return enregistrer('images', cle, { data, modifieLe: Date.now() }); }
export function retirerImage(cle) { return supprimer('images', cle); }

// ---------- Contenu d'origine ----------
export async function importerOrigine({ ecraser = false } = {}) {
  const ops = [];
  const set = (col, id, data) => ops.push({ type: 'set', col, id, data });
  if (ecraser || !db.contenu.textes) set('contenu', 'textes', TEXTES_ORIGINE);
  if (ecraser || !db.contenu.liens) set('contenu', 'liens', LIENS_ORIGINE);
  if (ecraser || !Object.keys(db.livres).length) LIVRES_ORIGINE.forEach((e, i) => set('livres', 'origine' + i, e));
  // Catégories : reprend celles qui existent déjà (même nom), crée les autres
  const norm = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const idCat = {};
  CATEGORIES_ORIGINE.forEach(({ id, ...e }) => {
    const exist = Object.entries(db.projets).find(([, c]) => norm(c.titre) === norm(e.titre));
    if (exist && !ecraser) {
      idCat[id] = exist[0];
      // Ancienne image d'exemple : remplacée par la nouvelle
      if (/images\.unsplash\.com\/photo-(1559028012|1551650975)/.test(exist[1].image || '')) ops.push({ type: 'merge', col: 'projets', id: exist[0], data: { image: e.image } });
    } else { idCat[id] = exist ? exist[0] : id; set('projets', idCat[id], e); }
  });
  if (ecraser || !Object.keys(db.realisations).length) REALISATIONS_ORIGINE.forEach((e, i) => set('realisations', 'origine' + i, { ...e, categorie: idCat[e.categorie] || e.categorie }));
  const deja = new Set(Object.values(db.photos).map(p => p.apercu));
  PHOTOS_ORIGINE.forEach((p, i) => { if (!deja.has(p.apercu)) set('photos', 'origine' + i, { ...p, ajouteLe: Date.now() }); });
  if (!ops.length) return 0;
  await lot(ops);
  return ops.length;
}

// ---------- Sauvegarde ----------
export function exporter() {
  return JSON.stringify({ application: 'kmauger-gestion', version: 1, date: new Date().toISOString(), donnees: db }, null, 2);
}
