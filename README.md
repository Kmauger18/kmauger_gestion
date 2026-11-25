# KMAUGER. — Espace de gestion

Espace privé pour modifier le site [KMAUGER.](https://kmauger18.github.io/kmauger/) sans toucher au code : textes, images, livres, photos, projets, cosplays et liens. Même principe que l'espace de gestion de Normandy Soldiers Memory.

🔐 **Adresse :** https://kmauger18.github.io/kmauger_gestion/

## Ce qu'on peut gérer

| Écran | Sur le site |
|---|---|
| Livres | Page Livres : couverture, genre, année, statut, résumé, lien d'achat |
| Photographie | Galerie avec filtres par catégorie et visionneuse en grand |
| Projets numériques | Page Projets : image, type, description, technologies, lien |
| Cosplay | Page Cosplay : photo, personnage, univers, fabrication |
| Textes du site | Tous les titres et paragraphes des 7 pages, avec aperçu |
| Images du site | Grande photo d'accueil, cartes, bannières, portrait de la page À propos |
| Liens & contact | Instagram personnel, Instagram projets, e-mail public |

Chaque élément peut être masqué, réordonné ou supprimé. Les images sont réduites automatiquement avant l'envoi.

## Fonctionnement

- Site statique (HTML, CSS, JavaScript), sans compilation, publié avec GitHub Pages.
- Les données sont dans **Firebase** (Firestore + Authentication, formule gratuite). Le site public lit la base avec `js/cms.js` (dépôt `kmauger`).
- Accès : tout compte créé dans Firebase → Authentication → Users.
- Tant que `firebase-config.js` est vide, l'espace fonctionne en **mode démonstration** (modifications gardées dans le navigateur uniquement).

👉 Mise en service : voir [GUIDE-FIREBASE.md](GUIDE-FIREBASE.md).

## Structure

```
index.html          Écrans de connexion et application
css/gestion.css     Styles
js/app.js           Démarrage, connexion, menu
js/store.js         Données (Firebase ou démo)
js/vues.js          Écrans et formulaires
js/donnees.js       Contenu d'origine du site
js/ui.js            Outils d'interface (fenêtres, champs, réduction des images)
firebase-config.js  Configuration Firebase (identique dans le dépôt kmauger)
firestore.rules     Règles de sécurité à publier dans Firebase
```
