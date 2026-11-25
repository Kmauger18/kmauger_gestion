# Mise en service de Firebase (gratuit)

L'espace de gestion fonctionne déjà en **mode démonstration** : on peut tout essayer, mais rien n'est envoyé sur le site. Pour le relier au site KMAUGER., il faut un projet Firebase. Compter environ 15 minutes.

Formule utilisée : **Spark (gratuite)**. Aucune carte bancaire n'est demandée. Les images sont enregistrées dans Firestore, pas dans Firebase Storage (qui demande la formule payante).

## 1. Créer le projet

1. Aller sur <https://console.firebase.google.com> → **Créer un projet** → nom : `kmauger`.
2. Google Analytics : inutile, on peut le désactiver.
3. Dans le projet : icône **</>** (Ajouter une application Web) → surnom `KMAUGER site` → **Enregistrer** (ne pas cocher Hosting).
4. Firebase affiche un bloc `firebaseConfig`. Copier les valeurs dans **`firebase-config.js`**, dans **les deux dépôts** :
   - `kmauger_gestion/firebase-config.js`
   - `kmauger/firebase-config.js`

## 2. Activer la connexion par e-mail

1. Menu **Créer → Authentication → Commencer**.
2. Onglet **Sign-in method** → **E-mail/Mot de passe** → activer seulement la première option → **Enregistrer**.

## 3. Créer ton compte

Onglet **Users** → **Ajouter un utilisateur** → adresse e-mail et mot de passe. Chaque compte ajouté ici a **automatiquement** accès à l'espace de gestion.

## 4. Bloquer l'inscription libre (important)

**Authentication → Paramètres → Actions de l'utilisateur** → **décocher « Activer la création (inscription) »** → Enregistrer.

Sans cela, n'importe qui pourrait se créer un compte et modifier le site.

## 5. Autoriser l'adresse GitHub Pages

**Authentication → Paramètres → Domaines autorisés** → **Ajouter un domaine** → `kmauger18.github.io`.

## 6. Créer la base de données

1. Menu **Créer → Firestore Database → Créer une base de données**.
2. Emplacement : **eur3 (Europe)**. Mode : **production** → **Créer**.
3. Onglet **Règles** : remplacer tout le contenu par celui du fichier [`firestore.rules`](firestore.rules) → **Publier**.

## 7. Premier démarrage

1. Ouvrir l'espace de gestion : <https://kmauger18.github.io/kmauger_gestion/> et se connecter.
2. Le tableau de bord indique « La base est vide » : cliquer sur **Importer le contenu du site**. Les textes, les liens, les 5 livres, les photos et les projets actuels arrivent dans la base.
3. À partir de là, toute modification enregistrée apparaît sur le site public (recharger la page du site pour la voir).

Tant que l'import n'a pas été fait, le site public continue d'afficher son contenu d'origine.

## Limites de la formule gratuite

50 000 lectures et 20 000 écritures par jour, 1 Go de données. Chaque photo de la galerie est réduite automatiquement (environ 150 Ko pour la galerie, 600 Ko pour la grande version), ce qui laisse de la place pour plus d'un millier de photos.
