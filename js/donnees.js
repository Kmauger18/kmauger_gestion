// Contenu d'origine du site KMAUGER. (tel qu'il est écrit dans index.html du dépôt kmauger)
// et description des écrans de saisie.

const U = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// ---------------------------------------------------------------- Textes
// *mot* = italique sur le site ; un retour à la ligne = retour à la ligne sur le site
export const TEXTES_ORIGINE = {
  accueil_eyebrow: 'Personal creative universe · Bienvenue',
  accueil_titre: 'Des idées.\n*Des univers.*\nUne signature.',
  accueil_intro: 'Je suis Kéliann Mauger. J’explore différentes formes de création, de l’écriture à l’image, du numérique au costume. Voici mon univers.',
  accueil_bouton: 'Découvrir mon univers',
  accueil_image_tag: 'KMAUGER. — Creative universe',
  accueil_citation: '« Créer, explorer, raconter. »',
  accueil_citation_sous: 'Une identité · Plusieurs passions',
  accueil_univers_eyebrow: 'Explorer',
  accueil_univers_titre: 'Mes univers',
  carte_livres: 'Livres & écriture',
  carte_photo: 'Photographie',
  carte_projets: 'Projets numériques',
  carte_cosplay: 'Cosplay',
  accueil_edito_eyebrow: 'Au-delà du portfolio',
  accueil_edito: 'Un espace pour présenter ce que je crée, partager ce qui m’inspire et faire découvrir les coulisses de chaque projet. Bienvenue dans mon monde.',

  livres_eyebrow: '01 — Mots & imagination',
  livres_titre: 'Livres *&*\nécriture.',
  livres_intro: 'Des histoires, des personnages et des univers imaginés pour prendre vie au fil des pages.',
  livres_section_eyebrow: 'Bibliothèque personnelle',
  livres_section_titre: 'Mes ouvrages',

  photo_eyebrow: '02 — Lumière & regard',
  photo_titre: 'Photographie*.*',
  photo_intro: 'Capturer une ambiance, raconter un instant et porter un regard singulier sur ce qui nous entoure.',
  photo_section_eyebrow: 'Sélection visuelle',
  photo_section_titre: 'Galerie photographique',

  projets_eyebrow: '03 — Idées & expérimentations',
  projets_titre: 'Projets\n*numériques.*',
  projets_intro: 'Sites web, applications et jeux : des idées transformées en expériences concrètes.',
  projets_section_eyebrow: 'Portfolio',
  projets_section_titre: 'Projets sélectionnés',

  cosplay_eyebrow: '04 — Personnages & savoir-faire',
  cosplay_titre: 'Cosplay*.*',
  cosplay_intro: 'Donner corps à des personnages, fabriquer des détails et faire passer l’imaginaire dans le réel.',
  cosplay_edito_eyebrow: 'De l’idée au costume',
  cosplay_edito: 'Chaque personnage commence par l’observation, puis se construit pièce par pièce : costume, accessoires, détails de fabrication et photos finales.',
  cosplay_section_titre: 'Mes cosplays',

  apropos_eyebrow: 'Derrière la signature',
  apropos_titre: 'Enchanté,\n*moi c’est Kéliann.*',
  apropos_intro: 'Créativité, curiosité et envie d’explorer différents moyens de donner vie aux idées.',
  apropos_bloc_eyebrow: 'Kéliann Mauger · KMAUGER.',
  apropos_bloc_titre: 'Plusieurs passions.\nUne même envie de créer.',
  apropos_p1: 'Je suis Kéliann Mauger. J’ai créé cet espace pour réunir les différents univers qui me passionnent : l’écriture, la photographie, la création numérique et le cosplay.',
  apropos_p2: 'KMAUGER. est à la fois un portfolio et un lieu de partage. J’y présente mes réalisations, mes expérimentations et les projets qui évoluent au fil du temps.',

  contact_eyebrow: 'Entrer en contact',
  contact_titre: 'Une idée ?\n*Parlons-en.*',
  contact_intro: 'Une question, une proposition, une collaboration ou simplement l’envie d’échanger autour d’un projet ? Retrouve-moi sur mes réseaux.',
  contact_bloc_eyebrow: 'Restons connectés',
  contact_bloc_titre: 'Let’s create\nsomething.',
};

// type : ligne (une ligne), titre (titre avec retours à la ligne), texte (paragraphe)
const c = (cle, label, type = 'texte', aide = '') => ({ cle, label, type, aide });
const ENTETE = p => [
  c(p + '_eyebrow', 'Petit titre au-dessus', 'ligne'),
  c(p + '_titre', 'Grand titre', 'titre', 'Mettez un mot entre astérisques pour l’écrire en italique : *comme ça*.'),
  c(p + '_intro', 'Texte d’introduction'),
];
export const PAGES_TEXTES = [
  { id: 'accueil', titre: 'Accueil', ancre: '', apercu: 'accueil', zones: [
    { titre: 'Haut de page', champs: [...ENTETE('accueil'), c('accueil_bouton', 'Texte du bouton', 'ligne'), c('accueil_image_tag', 'Étiquette sur la photo', 'ligne')] },
    { titre: 'Bandeau noir', champs: [c('accueil_citation', 'Citation', 'ligne'), c('accueil_citation_sous', 'Texte à droite', 'ligne')] },
    { titre: 'Mes univers', champs: [c('accueil_univers_eyebrow', 'Petit titre', 'ligne'), c('accueil_univers_titre', 'Titre', 'ligne'), c('carte_livres', 'Carte 1', 'ligne'), c('carte_photo', 'Carte 2', 'ligne'), c('carte_projets', 'Carte 3', 'ligne'), c('carte_cosplay', 'Carte 4', 'ligne')] },
    { titre: 'Texte de fin', champs: [c('accueil_edito_eyebrow', 'Petit titre', 'ligne'), c('accueil_edito', 'Texte')] },
  ] },
  { id: 'livres', titre: 'Livres', ancre: '#livres', zones: [
    { titre: 'Haut de page', champs: ENTETE('livres') },
    { titre: 'Liste des livres', champs: [c('livres_section_eyebrow', 'Petit titre', 'ligne'), c('livres_section_titre', 'Titre', 'ligne')] },
  ], note: 'Les livres eux-mêmes se gèrent dans l’écran « Livres ».', lienNote: '#livres' },
  { id: 'photographie', titre: 'Photographie', ancre: '#photographie', zones: [
    { titre: 'Haut de page', champs: ENTETE('photo') },
    { titre: 'Galerie', champs: [c('photo_section_eyebrow', 'Petit titre', 'ligne'), c('photo_section_titre', 'Titre', 'ligne')] },
  ], note: 'Les photos se gèrent dans l’écran « Photographie ».', lienNote: '#photos' },
  { id: 'projets', titre: 'Projets', ancre: '#projets', zones: [
    { titre: 'Haut de page', champs: ENTETE('projets') },
    { titre: 'Liste des projets', champs: [c('projets_section_eyebrow', 'Petit titre', 'ligne'), c('projets_section_titre', 'Titre', 'ligne')] },
  ], note: 'Les projets se gèrent dans l’écran « Projets ».', lienNote: '#projets' },
  { id: 'cosplay', titre: 'Cosplay', ancre: '#cosplay', zones: [
    { titre: 'Haut de page', champs: ENTETE('cosplay') },
    { titre: 'Présentation', champs: [c('cosplay_edito_eyebrow', 'Petit titre', 'ligne'), c('cosplay_edito', 'Texte'), c('cosplay_section_titre', 'Titre de la liste', 'ligne')] },
  ], note: 'Les cosplays se gèrent dans l’écran « Cosplay ».', lienNote: '#cosplays' },
  { id: 'apropos', titre: 'À propos', ancre: '#apropos', zones: [
    { titre: 'Haut de page', champs: ENTETE('apropos') },
    { titre: 'Présentation', champs: [c('apropos_bloc_eyebrow', 'Petit titre', 'ligne'), c('apropos_bloc_titre', 'Titre', 'titre'), c('apropos_p1', 'Paragraphe 1'), c('apropos_p2', 'Paragraphe 2')] },
  ] },
  { id: 'contact', titre: 'Contact', ancre: '#contact', zones: [
    { titre: 'Haut de page', champs: ENTETE('contact') },
    { titre: 'Bloc noir', champs: [c('contact_bloc_eyebrow', 'Petit titre', 'ligne'), c('contact_bloc_titre', 'Titre', 'titre')] },
  ], note: 'Les liens Instagram et l’e-mail se gèrent dans l’écran « Liens & contact ».', lienNote: '#liens' },
];

// ---------------------------------------------------------------- Liens
export const LIENS_ORIGINE = {
  instagram_perso: 'https://www.instagram.com/kmauger18/',
  instagram_projets: 'https://www.instagram.com/kmauger.studio/',
  email: '',
};
export const CHAMPS_LIENS = [
  { cle: 'instagram_perso', label: 'Instagram personnel', type: 'url' },
  { cle: 'instagram_projets', label: 'Instagram projets', type: 'url' },
  { cle: 'email', label: 'Adresse e-mail publique', type: 'email', aide: 'Laissez vide pour ne pas afficher de bouton e-mail sur la page Contact.' },
];

// ---------------------------------------------------------------- Images du site
export const IMAGES_SITE = [
  { cle: 'accueil_hero', label: 'Grande photo de l’accueil', page: 'Accueil', origine: U('photo-1497366754035-f200968a6e72', 1400) },
  { cle: 'carte_livres', label: 'Carte « Livres »', page: 'Accueil', origine: U('photo-1512820790803-83ca734da794', 1000) },
  { cle: 'carte_photo', label: 'Carte « Photographie »', page: 'Accueil', origine: U('photo-1452587925148-ce544e77e70d', 1000) },
  { cle: 'carte_projets', label: 'Carte « Projets »', page: 'Accueil', origine: U('photo-1460925895917-afdab827c52f', 1000) },
  { cle: 'carte_cosplay', label: 'Carte « Cosplay »', page: 'Accueil', origine: U('photo-1531058020387-3be344556be6', 1000) },
  { cle: 'livres_banniere', label: 'Bannière', page: 'Livres', origine: U('photo-1512820790803-83ca734da794', 1800) },
  { cle: 'photo_banniere', label: 'Bannière', page: 'Photographie', origine: U('photo-1470770841072-f978cf4d019e', 1800) },
  { cle: 'projets_banniere', label: 'Bannière', page: 'Projets', origine: U('photo-1460925895917-afdab827c52f', 1800) },
  { cle: 'cosplay_banniere', label: 'Bannière', page: 'Cosplay', origine: U('photo-1531058020387-3be344556be6', 1800) },
  { cle: 'apropos_portrait', label: 'Portrait (à la place du logo)', page: 'À propos', origine: 'img/logo.png' },
];

// ---------------------------------------------------------------- Listes
export const STATUTS_LIVRE = { disponible: 'Disponible', bientot: 'Bientôt', ecriture: 'En écriture' };
export const TYPES_PROJET = { site: 'Site web', application: 'Application', jeu: 'Jeu', autre: 'Autre' };
export const CATEGORIES_PHOTO = { paysages: 'Paysages', lumieres: 'Lumières', atmospheres: 'Atmosphères', portraits: 'Portraits', macro: 'Macro', urbain: 'Urbain', autres: 'Autres' };

const IMG = 'https://kmauger18.github.io/kmauger/assets/img/livres/';
export const LIVRES_ORIGINE = [
  {
    titre: 'L’encre du dernier jour', genre: 'Thriller psychologique', statut: 'disponible',
    accroche: 'Il existe des morts que personne n’a vu venir.',
    description: 'Il existe des morts que personne n’a vu venir.\nArthur souriait. Arthur écrivait. Arthur s’est tu.\n\nLe jour de ses funérailles, sous la pluie de Rennes, Aurore reçoit un livre et une lettre. Une seule phrase l’empêche de tourner la page : *ce que l’on cherche n’est pas caché dans ce que l’on lit, mais dans ce que l’on ne remarque pas.*\n\nAu lycée, les silences se fissurent. Un procès. Une salle de théâtre. Une cérémonie. Un compte sans nom qui publie chaque nuit à 3 h 12. Ceux qui ont blessé Arthur, et ceux qui ont choisi de ne rien dire, tombent un à un. À chaque fois, un lys blanc, la tige coupée en biais.\n\nIci, chaque mot laisse une trace.\nChaque silence a un prix.\nEt chaque page rapproche d’une vérité que personne ne voulait lire.',
    couverture: IMG + 'lencre-du-dernier-jour.jpg',
    pages: '455', format: 'Poche · 11 × 17 cm', dateParution: '29 octobre 2026', isbn: '979-8166225740', langue: 'Français', prix: '',
    lienAmazon: 'https://www.amazon.fr/dp/B0HPY7LDP6', lienCoolLibri: '', visible: true, ordre: 1,
  },
  {
    titre: 'De l’autre côté du sort', genre: 'Urban fantasy', statut: 'bientot',
    accroche: 'Elle maîtrise l’ombre. Il ne croit qu’à l’acier.',
    description: '*Elle maîtrise l’ombre. Il ne croit qu’à l’acier.*\n\nVespera est une sorcière de magie noire traquée par le Conseil. Julian est un chasseur sans magie, immunisé contre tous les sortilèges.\n\nLorsque leur affrontement révèle une trahison bien plus sombre, le chasseur et sa proie n’ont plus qu’un choix : s’allier ou périr.\n\n*Attention : ce grimoire est vivant.*',
    couverture: IMG + 'de-lautre-cote-du-sort.jpg',
    pages: '296', format: 'Poche · 11 × 17 cm', dateParution: '', isbn: '', langue: 'Français', prix: '',
    lienAmazon: '', lienCoolLibri: '', visible: true, ordre: 2,
  },
  {
    titre: 'Ce qu’on ne se dit pas encore', genre: 'Romance young adult', statut: 'bientot',
    accroche: 'Aux yeux de tout le lycée, Léo et Camille forment le couple parfait.',
    description: 'Aux yeux de tout le lycée, Léo et Camille forment le couple parfait.\n\nPourtant, derrière les sourires, chacun cache un secret qui bouleverse tout ce qu’il croyait savoir de lui-même.\n\nLéo tombe amoureux d’un garçon.\nCamille tombe amoureuse d’une fille.\n\nAvant d’affronter le regard des autres, ils devront trouver le courage de se dire la vérité — et de se choisir comme alliés.',
    couverture: IMG + 'ce-quon-ne-se-dit-pas-encore.jpg',
    pages: '', format: 'Poche · 11 × 17 cm', dateParution: '', isbn: '', langue: 'Français', prix: '',
    lienAmazon: '', lienCoolLibri: '', visible: true, ordre: 3,
  },
  {
    titre: 'Distribué, jamais lu', genre: 'Comédie romantique', statut: 'bientot',
    accroche: '30 jours. 3 règles. 0 photo.',
    description: '*02 h 14.* Chloé, fleuriste un brin gaffeuse, envoie un message à sa meilleure amie… au mauvais numéro. À l’autre bout, Mathis, pâtissier insomniaque, répond au lieu de bloquer.\n\nTrois règles : pas de prénoms, pas de photos, pas de rencontre avant trente jours.\n\nCe qu’ils ignorent ? Ils vivent dans le même immeuble, travaillent face à face… et chacun confie à l’autre son béguin pour l’autre.\n\nUne comédie romantique racontée entièrement en SMS, où un simple « Distribué » peut tout faire basculer.',
    couverture: IMG + 'distribue-jamais-lu.jpg',
    pages: '', format: 'Poche · 11 × 17 cm', dateParution: '', isbn: '', langue: 'Français', prix: '',
    lienAmazon: '', lienCoolLibri: '', visible: true, ordre: 4,
  },
  {
    titre: '08:14 Point de rupture', genre: 'Thriller', statut: 'bientot',
    accroche: 'Deux ennemis. Quatorze minutes.',
    description: '08:00. Le train quitte la gare.\n08:14. Tout explose.\nPuis le temps revient à zéro.\n\nSeuls deux passagers se souviennent.\nNolan veut sauver tout le monde.\nSora doit s’assurer que la bombe explose.\n\nDeux ennemis. Quatorze minutes.\nUne seule vérité, selon le filtre que vous choisissez.\n\n*Un filtre rouge, un filtre cyan : deux lectures.*',
    couverture: IMG + '08h14-point-de-rupture.jpg',
    pages: '', format: 'Poche · 11 × 17 cm', dateParution: '', isbn: '', langue: 'Français', prix: '',
    lienAmazon: '', lienCoolLibri: '', visible: true, ordre: 5,
  },
];

export const PHOTOS_ORIGINE = [
  { legende: 'Paysages', categorie: 'paysages', apercu: U('photo-1470770841072-f978cf4d019e', 900), hd: false, visible: true, ordre: 1 },
  { legende: 'Lumières', categorie: 'lumieres', apercu: U('photo-1490730141103-6cac27aaab94', 900), hd: false, visible: true, ordre: 2 },
  { legende: 'Atmosphères', categorie: 'atmospheres', apercu: U('photo-1519608487953-e999c86e7455', 900), hd: false, visible: true, ordre: 3 },
];
export const PROJETS_ORIGINE = [
  { titre: 'Sites web', type: 'site', description: 'Design, développement et expériences web.', technologies: '', lien: '', libelleLien: '', image: U('photo-1559028012-481c04fa702d', 900), visible: true, ordre: 1 },
  { titre: 'Applications', type: 'application', description: 'Outils numériques et interfaces utiles.', technologies: '', lien: '', libelleLien: '', image: U('photo-1551650975-87deedd944c3', 900), visible: true, ordre: 2 },
  { titre: 'Jeux', type: 'jeu', description: 'Concepts, univers et prototypes interactifs.', technologies: '', lien: '', libelleLien: '', image: U('photo-1542751371-adc38448a05e', 900), visible: true, ordre: 3 },
];
