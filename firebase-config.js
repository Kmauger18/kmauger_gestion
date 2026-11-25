// ============================================================
//  Configuration Firebase — partagée par le site et l'espace de gestion
// ============================================================
//  Les mêmes valeurs doivent être dans CE fichier et dans
//  firebase-config.js du dépôt kmauger_gestion.
//
//  Tant que apiKey est vide, le site affiche le contenu écrit dans
//  index.html et l'espace de gestion fonctionne en MODE DÉMO.
//  Ces valeurs ne sont pas secrètes : la sécurité vient des règles
//  Firestore (firestore.rules) et des mots de passe des comptes.
// ============================================================

export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

export const firebaseActif = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Version du SDK Firebase chargée depuis le CDN officiel de Google
export const FIREBASE_SDK = "https://www.gstatic.com/firebasejs/10.12.2";

// Adresse du site public
export const SITE_URL = "https://kmauger18.github.io/kmauger/";
