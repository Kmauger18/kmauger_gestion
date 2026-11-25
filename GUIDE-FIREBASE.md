# Firebase — état et premier démarrage

Projet Firebase : **KMAUGER** (`kmauger-de247`), formule **Spark (gratuite)**.
Console : <https://console.firebase.google.com/project/kmauger-de247>

Déjà fait :
- configuration copiée dans `firebase-config.js` (ce dépôt et le dépôt `kmauger`) ;
- connexion par e-mail/mot de passe activée ;
- inscription libre **désactivée** (seuls les comptes créés dans la console ont accès) ;
- domaine `kmauger18.github.io` autorisé ;
- base Firestore créée en Europe (eur3), mode production, règles de [`firestore.rules`](firestore.rules) publiées.

## Créer ton compte de connexion

**Authentication → Users → Ajouter un utilisateur** → ton e-mail et un mot de passe. Chaque compte ajouté ici a accès à l'espace de gestion.

Si tu modifies `firestore.rules`, recolle-le dans **Firestore Database → Règles → Publier**.

## Premier démarrage

1. Ouvrir l'espace de gestion : <https://kmauger18.github.io/kmauger_gestion/> et se connecter.
2. Le tableau de bord indique « La base est vide » : cliquer sur **Importer le contenu du site**. Les textes, les liens, les 5 livres, les photos et les projets actuels arrivent dans la base.
3. À partir de là, toute modification enregistrée apparaît sur le site public (recharger la page du site pour la voir).

Tant que l'import n'a pas été fait, le site public continue d'afficher son contenu d'origine.

## Limites de la formule gratuite

50 000 lectures et 20 000 écritures par jour, 1 Go de données. Chaque photo de la galerie est réduite automatiquement (environ 150 Ko pour la galerie, 600 Ko pour la grande version), ce qui laisse de la place pour plus d'un millier de photos.
