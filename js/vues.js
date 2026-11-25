// Écrans de l'espace de gestion KMAUGER.
import * as S from './store.js?v=202611251915';
import { $, $$, esc, ic, toast, ouvrirFenetre, fermerFenetre, confirmer, champ, lireFormulaire, preparerPhoto, preparerImage, telecharger, isoJour } from './ui.js?v=202611251915';
import { PAGES_TEXTES, TEXTES_ORIGINE, CHAMPS_LIENS, IMAGES_SITE, STATUTS_LIVRE, TYPES_PROJET, CATEGORIES_PHOTO } from './donnees.js?v=202611251915';
import { SITE_URL } from '../firebase-config.js?v=202611251915';

const erreur = e => { console.error(e); toast(S.messageErreur(e), 'erreur'); };
const okEnregistre = r => toast(r === 'attente' ? 'Enregistré sur l\'appareil, envoi dès que la connexion revient.' : 'Enregistré');
const lienSite = (ancre = '') => SITE_URL + ancre;
const vide = (titre, texte) => `<div class="vide">${ic('alerte')}<h3>${esc(titre)}</h3><p>${esc(texte)}</p></div>`;
// *mot* → italique, retour à la ligne → <br> (même rendu que sur le site)
const fmt = t => esc(t).replace(/\*([^*\n]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');

// Remet les ordres à 1..n puis échange deux éléments voisins
async function deplacer(col, id, sens) {
  const l = S.liste(col);
  const i = l.findIndex(x => x.id === id), j = i + sens;
  if (i < 0 || j < 0 || j >= l.length) return;
  [l[i], l[j]] = [l[j], l[i]];
  await S.lot(l.map((x, k) => ({ type: 'merge', col, id: x.id, data: { ordre: k + 1 } }))).catch(erreur);
}
const prochainOrdre = col => S.liste(col).reduce((m, x) => Math.max(m, x.ordre || 0), 0) + 1;
const boutonsOrdre = (id, i, n) => `<button class="btn-icone" data-haut="${id}" ${i === 0 ? 'disabled' : ''} title="Monter" aria-label="Monter">${ic('haut')}</button><button class="btn-icone" data-bas="${id}" ${i === n - 1 ? 'disabled' : ''} title="Descendre" aria-label="Descendre">${ic('bas')}</button>`;

// Branche les boutons communs d'une liste (ordre, visibilité, modifier, supprimer)
function brancherListe(el, col, { formulaire, nom, supprimer = id => S.supprimer(col, id) }) {
  $$('[data-haut]', el).forEach(b => b.onclick = () => deplacer(col, b.dataset.haut, -1));
  $$('[data-bas]', el).forEach(b => b.onclick = () => deplacer(col, b.dataset.bas, 1));
  $$('[data-vis]', el).forEach(b => b.onclick = () => { const x = S.obtenir(col, b.dataset.vis); S.modifier(col, x.id, { visible: x.visible === false }).catch(erreur); });
  $$('[data-modif]', el).forEach(b => b.onclick = () => formulaire(S.obtenir(col, b.dataset.modif)));
  $$('[data-suppr]', el).forEach(b => b.onclick = async () => {
    const x = S.obtenir(col, b.dataset.suppr);
    if (await confirmer(`Supprimer « ${nom(x)} » ?`)) supprimer(x.id).then(() => toast('Supprimé')).catch(erreur);
  });
}
const actions = (x, i, n, ordre = true) => `
  <div class="photo-actions">
    ${ordre ? boutonsOrdre(x.id, i, n) : ''}
    <button class="btn-icone" data-vis="${x.id}" title="${x.visible === false ? 'Afficher sur le site' : 'Masquer du site'}">${ic(x.visible === false ? 'oeil' : 'oeilBarre')}</button>
    <button class="btn-icone" data-modif="${x.id}" title="Modifier">${ic('modifier')}</button>
    <button class="btn-icone danger" data-suppr="${x.id}" title="Supprimer">${ic('supprimer')}</button>
  </div>`;
const etiquetteMasque = x => x.visible === false ? '<span class="pastille grise">Masqué</span>' : '';
const visibles = l => l.filter(x => x.visible !== false).length;

// Champ « image » d'un formulaire : aperçu + choisir / retirer. Renvoie une fonction qui lit la valeur.
function champImage({ valeur = '', label = 'Image', portrait = false, largeur = 900, plafond = 220000 }) {
  let courante = valeur;
  const html = `<div class="champ"><label>${esc(label)}</label>
    <div class="choix-image ${portrait ? 'portrait' : ''}">
      <img class="apercu-img" data-ci-img alt="" ${valeur ? `src="${esc(valeur)}"` : ''}>
      <div class="actions-img">
        <label class="btn btn-clair">${ic('televerser')} Choisir une image<input type="file" accept="image/*" data-ci-fichier hidden></label>
        <button type="button" class="btn btn-clair danger" data-ci-retirer ${valeur ? '' : 'hidden'}>Retirer</button>
        <span class="aide" data-ci-etat></span>
      </div>
    </div></div>`;
  const brancher = racine => {
    const img = $('[data-ci-img]', racine), etat = $('[data-ci-etat]', racine), retirer = $('[data-ci-retirer]', racine);
    $('[data-ci-fichier]', racine).onchange = async e => {
      const f = e.target.files[0]; e.target.value = '';
      if (!f) return;
      etat.textContent = 'Préparation…';
      try { courante = await preparerImage(f, largeur, plafond); img.src = courante; retirer.hidden = false; etat.textContent = ''; }
      catch (err) { etat.textContent = err.message; }
    };
    retirer.onclick = () => { courante = ''; img.removeAttribute('src'); retirer.hidden = true; };
  };
  return { html, brancher, lire: () => courante };
}
const piedForm = id => `<button type="button" class="btn btn-clair" data-annuler>Annuler</button><button type="submit" form="${id}" class="btn btn-primaire">${ic('ok')} Enregistrer</button>`;

// =====================================================================
export const VUES = {

  // -------------------------------------------------------------- Tableau de bord
  tableau: {
    titre: 'Tableau de bord', icone: 'tableau',
    rendre(el) {
      const livres = S.liste('livres'), photos = S.liste('photos'), projets = S.liste('projets'), cosplays = S.liste('cosplays');
      const imagesPerso = IMAGES_SITE.filter(i => S.image(i.cle)).length;
      el.innerHTML = `
        ${S.mode === 'firebase' && S.chargementTermine() && S.baseVide() ? `
        <div class="carte carte-alerte">
          <div><h3>La base est vide</h3><p>Le site affiche encore son contenu d'origine. Importez-le dans la base pour pouvoir le modifier d'ici.</p></div>
          <button class="btn btn-primaire" id="importer">${ic('telecharger')} Importer le contenu du site</button>
        </div>` : ''}
        <div class="tuiles t5">
          <a class="tuile" href="#livres"><span>${ic('livre')}</span><b>${visibles(livres)}</b><small>Livres en ligne</small></a>
          <a class="tuile" href="#photos"><span>${ic('photos')}</span><b>${visibles(photos)}</b><small>Photos en ligne</small></a>
          <a class="tuile" href="#projets"><span>${ic('projet')}</span><b>${visibles(projets)}</b><small>Projets en ligne</small></a>
          <a class="tuile" href="#cosplays"><span>${ic('cosplay')}</span><b>${visibles(cosplays)}</b><small>Cosplays en ligne</small></a>
          <a class="tuile" href="#images"><span>${ic('image')}</span><b>${imagesPerso}<small style="font-size:.9rem"> / ${IMAGES_SITE.length}</small></b><small>Images personnalisées</small></a>
        </div>
        <div class="grille-2">
          <section class="carte">
            <div class="carte-tete"><h3>Dernières photos</h3><a href="#photos" class="lien">Photographie →</a></div>
            ${photos.length ? `<div class="mini-galerie">${[...photos].sort((a, b) => (b.ajouteLe || 0) - (a.ajouteLe || 0) || (b.ordre || 0) - (a.ordre || 0)).slice(0, 6).map(p => `<img src="${esc(p.apercu)}" alt="${esc(p.legende)}" loading="lazy">`).join('')}</div>` : '<p class="muet">Aucune photo.</p>'}
            <a href="#photos" class="btn btn-sombre">${ic('televerser')} Ajouter des photos</a>
          </section>
          <section class="carte">
            <div class="carte-tete"><h3>Livres</h3><a href="#livres" class="lien">Gérer →</a></div>
            ${livres.length ? `<ul class="liste-evt">${livres.slice(0, 5).map(l => `<li><div><b>${esc(l.titre)}</b><small>${esc([l.genre, STATUTS_LIVRE[l.statut]].filter(Boolean).join(' · '))}</small></div>${etiquetteMasque(l)}</li>`).join('')}</ul>` : '<p class="muet">Aucun livre.</p>'}
            <button class="btn btn-sombre" id="nouveau-livre">${ic('plus')} Ajouter un livre</button>
          </section>
        </div>
        <section class="carte">
          <div class="carte-tete"><h3>Raccourcis</h3></div>
          <div class="raccourcis">
            <a href="#textes">${ic('textes')} Modifier les textes</a>
            <a href="#images">${ic('image')} Changer les images du site</a>
            <a href="#liens">${ic('lien')} Liens & contact</a>
            <a href="${lienSite()}" target="_blank" rel="noopener">${ic('externe')} Voir le site</a>
          </div>
        </section>`;
      $('#importer', el)?.addEventListener('click', async e => {
        e.currentTarget.disabled = true;
        try { const n = await S.importerOrigine(); toast(n ? 'Contenu du site importé' : 'Rien à importer'); } catch (err) { erreur(err); }
      });
      $('#nouveau-livre', el).onclick = () => formLivre();
    }
  },

  // -------------------------------------------------------------- Livres
  livres: {
    titre: 'Livres', icone: 'livre',
    rendre(el) {
      const l = S.liste('livres');
      el.innerHTML = `
        <div class="barre"><p class="intro">L'ordre ici est celui de la page Livres du site. Chaque livre a sa fiche détaillée sur le site.</p><button class="btn btn-primaire" id="ajout">${ic('plus')} Nouveau livre</button></div>
        ${l.length ? `<div class="galerie livres">${l.map((x, i) => `
          <figure class="photo ${x.visible === false ? 'masque' : ''}">
            <div class="photo-img portrait">${x.couverture ? `<img src="${esc(x.couverture)}" alt="" loading="lazy">` : `<div class="vide-img">${esc(x.titre)}</div>`}${etiquetteMasque(x)}</div>
            <figcaption><b>${esc(x.titre)}</b><small class="type">${esc([x.genre, STATUTS_LIVRE[x.statut]].filter(Boolean).join(' · '))}</small></figcaption>
            ${actions(x, i, l.length)}
          </figure>`).join('')}</div>` : vide('Aucun livre', 'Ajoutez vos romans : couverture, description et liens d\'achat.')}`;
      $('#ajout', el).onclick = () => formLivre();
      brancherListe(el, 'livres', { formulaire: formLivre, nom: x => x.titre });
    }
  },

  // -------------------------------------------------------------- Photographie
  photos: {
    titre: 'Photographie', icone: 'photos',
    filtre: 'tout',
    rendre(el) {
      const toutes = S.liste('photos');
      const l = this.filtre === 'tout' ? toutes : toutes.filter(p => p.categorie === this.filtre);
      el.innerHTML = `
        <div class="barre">
          <div class="filtres">${[['tout', 'Toutes'], ...Object.entries(CATEGORIES_PHOTO)].map(([k, v]) => `<button class="${k === this.filtre ? 'on' : ''}" data-f="${k}">${esc(v)} <span>${k === 'tout' ? toutes.length : toutes.filter(p => p.categorie === k).length}</span></button>`).join('')}</div>
          <label class="btn btn-primaire">${ic('televerser')} Ajouter des photos<input type="file" id="fichiers" accept="image/*" multiple hidden></label>
        </div>
        <p class="intro">Les photos sont réduites automatiquement avant l'envoi. L'ordre ici est celui de la galerie du site ; les filtres du site n'affichent que les catégories utilisées.</p>
        ${l.length ? `<div class="galerie">${l.map((p, i) => `
          <figure class="photo ${p.visible === false ? 'masque' : ''}">
            <div class="photo-img"><img src="${esc(p.apercu)}" alt="${esc(p.legende)}" loading="lazy">${p.visible === false ? '<span class="pastille grise">Masquée</span>' : ''}</div>
            <figcaption><b>${esc(p.legende || 'Sans légende')}</b><small class="type">${esc(CATEGORIES_PHOTO[p.categorie] || '')}</small></figcaption>
            ${actions(p, i, l.length, this.filtre === 'tout')}
          </figure>`).join('')}</div>` : vide('Aucune photo', 'Ajoutez vos photos : elles apparaîtront dans la galerie de la page Photographie.')}`;
      $$('[data-f]', el).forEach(b => b.onclick = () => { this.filtre = b.dataset.f; this.rendre(el); });
      $('#fichiers', el).onchange = e => { const f = [...e.target.files]; e.target.value = ''; if (f.length) formTeleversement(f, this.filtre === 'tout' ? 'paysages' : this.filtre); };
      brancherListe(el, 'photos', { formulaire: formPhoto, nom: p => p.legende || 'sans légende', supprimer: id => S.supprimerPhoto(id) });
    }
  },

  // -------------------------------------------------------------- Projets
  projets: {
    titre: 'Projets numériques', icone: 'projet',
    rendre(el) {
      const l = S.liste('projets');
      el.innerHTML = `
        <div class="barre"><p class="intro">Sites, applications, jeux… L'ordre ici est celui de la page Projets.</p><button class="btn btn-primaire" id="ajout">${ic('plus')} Nouveau projet</button></div>
        ${l.length ? `<div class="galerie">${l.map((x, i) => `
          <figure class="photo ${x.visible === false ? 'masque' : ''}">
            <div class="photo-img">${x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : `<div class="vide-img">${esc(x.titre)}</div>`}${etiquetteMasque(x)}</div>
            <figcaption><b>${esc(x.titre)}</b><small class="type">${esc(TYPES_PROJET[x.type] || '')}</small></figcaption>
            ${actions(x, i, l.length)}
          </figure>`).join('')}</div>` : vide('Aucun projet', 'Présentez vos sites, applications et jeux.')}`;
      $('#ajout', el).onclick = () => formProjet();
      brancherListe(el, 'projets', { formulaire: formProjet, nom: x => x.titre });
    }
  },

  // -------------------------------------------------------------- Cosplay
  cosplays: {
    titre: 'Cosplay', icone: 'cosplay',
    rendre(el) {
      const l = S.liste('cosplays');
      el.innerHTML = `
        <div class="barre"><p class="intro">Un cosplay = une photo, le personnage et son univers. L'ordre ici est celui de la page Cosplay.</p><button class="btn btn-primaire" id="ajout">${ic('plus')} Nouveau cosplay</button></div>
        ${l.length ? `<div class="galerie livres">${l.map((x, i) => `
          <figure class="photo ${x.visible === false ? 'masque' : ''}">
            <div class="photo-img portrait">${x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : `<div class="vide-img">${esc(x.titre)}</div>`}${etiquetteMasque(x)}</div>
            <figcaption><b>${esc(x.titre)}</b><small class="type">${esc([x.univers, x.annee].filter(Boolean).join(' · '))}</small></figcaption>
            ${actions(x, i, l.length)}
          </figure>`).join('')}</div>` : vide('Aucun cosplay', 'Ajoutez votre premier cosplay : tant qu\'il n\'y en a pas, le site affiche « Les premières réalisations arrivent bientôt ».')}`;
      $('#ajout', el).onclick = () => formCosplay();
      brancherListe(el, 'cosplays', { formulaire: formCosplay, nom: x => x.titre });
    }
  },

  // -------------------------------------------------------------- Textes
  textes: {
    titre: 'Textes du site', icone: 'textes', formulaire: true,
    pageId: 'accueil',
    brouillon: {},            // modifications pas encore enregistrées : { cle: texte }
    rendre(el) {
      const enregistres = S.textes();
      const val = cle => (cle in this.brouillon ? this.brouillon[cle] : enregistres[cle]) ?? '';
      const page = PAGES_TEXTES.find(p => p.id === this.pageId) || PAGES_TEXTES[0];
      const clesPage = p => p.zones.flatMap(z => z.champs.map(c => c.cle));
      const nbBrouillon = p => clesPage(p).filter(c => c in this.brouillon).length;
      const nbPerso = p => clesPage(p).filter(c => val(c) !== TEXTES_ORIGINE[c]).length;

      const carte = c => {
        const v = val(c.cle), id = 't_' + c.cle;
        const entree = c.type === 'ligne'
          ? `<input id="${id}" data-cle="${c.cle}" type="text" value="${esc(v)}">`
          : `<textarea id="${id}" data-cle="${c.cle}" rows="${c.type === 'titre' ? 2 : 3}">${esc(v)}</textarea>`;
        return `
          <div class="champ-cms" data-champ="${c.cle}">
            <div class="champ-cms-tete"><label for="${id}">${esc(c.label)}</label><span class="compteur"></span></div>
            ${entree}
            <div class="champ-cms-pied">
              <span class="etat-champ"></span>
              <button type="button" class="lien petit" data-origine="${c.cle}">Remettre le texte d'origine</button>
            </div>
            ${c.aide ? `<p class="aide">${esc(c.aide)}</p>` : ''}
          </div>`;
      };

      el.innerHTML = `
        <div class="textes">
          <nav class="textes-pages" aria-label="Pages du site">
            <p class="textes-pages-titre">Pages du site</p>
            ${PAGES_TEXTES.map(p => `
              <button type="button" data-page="${p.id}" class="${p.id === page.id ? 'on' : ''}">
                <span>${esc(p.titre)}</span>
                <small data-badge="${p.id}"></small>
              </button>`).join('')}
          </nav>
          <div class="textes-editeur">
            <div class="textes-tete">
              <div><h3>${esc(page.titre)}</h3><p class="muet">${clesPage(page).length} textes modifiables · <span data-perso></span></p></div>
              <a class="btn btn-clair" href="${lienSite(page.ancre)}" target="_blank" rel="noopener">${ic('externe')} Voir la page en ligne</a>
            </div>
            <div class="apercu-page" aria-label="Aperçu"><span class="apercu-etiquette">Aperçu du haut de la page</span><div id="apercu" class="apercu"></div></div>
            <p class="aide-format">Astuce : un mot entre astérisques s'affiche en italique sur le site (<code>*Des univers.*</code>). Un retour à la ligne dans un titre est conservé.</p>
            ${page.note ? `<p class="note-page">${ic('alerte')}<span>${esc(page.note)} <a class="lien" href="${page.lienNote}">Y aller →</a></span></p>` : ''}
            ${page.zones.map((z, i) => `
              <section class="zone">
                <h4><span>${i + 1}</span>${esc(z.titre)}</h4>
                <div class="zone-champs">${z.champs.map(carte).join('')}</div>
              </section>`).join('')}
          </div>
        </div>
        <div class="barre-enregistrer" id="barre-enr" hidden>
          <span id="barre-enr-texte"></span>
          <div><button type="button" class="btn btn-clair" id="annuler-tout">Annuler</button><button type="button" class="btn btn-primaire" id="enregistrer-tout">${ic('ok')} Enregistrer</button></div>
        </div>`;

      const definitions = Object.fromEntries(PAGES_TEXTES.flatMap(p => p.zones.flatMap(z => z.champs)).map(c => [c.cle, c]));
      const ajuster = t => { if (t.tagName === 'TEXTAREA') { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; } };

      const majChamp = cle => {
        const boite = $(`[data-champ="${cle}"]`, el); if (!boite) return;
        const v = val(cle);
        $('.compteur', boite).textContent = `${v.length}`;
        const etat = $('.etat-champ', boite);
        const brouillon = cle in this.brouillon, perso = v !== TEXTES_ORIGINE[cle];
        etat.className = 'etat-champ ' + (brouillon ? 'non-enr' : perso ? 'perso' : '');
        etat.textContent = brouillon ? 'Non enregistré' : perso ? 'Personnalisé' : 'Texte d\'origine';
        boite.classList.toggle('modifie', brouillon);
        $('[data-origine]', boite).hidden = !perso;
      };
      const majApercu = () => {
        const z = page.zones[0].champs;
        $('#apercu', el).innerHTML = `<p class="ap-eyebrow">${esc(val(z[0].cle))}</p><p class="ap-h1">${fmt(val(z[1].cle))}</p><p class="ap-texte">${esc(val(z[2].cle))}</p>`;
      };
      const majCompteurs = () => {
        PAGES_TEXTES.forEach(p => {
          const b = $(`[data-badge="${p.id}"]`, el), n = nbBrouillon(p);
          b.textContent = n ? `${n} non enreg.` : (nbPerso(p) ? 'modifiée' : '');
          b.className = n ? 'non-enr' : nbPerso(p) ? 'perso' : '';
        });
        const n = nbPerso(page);
        $('[data-perso]', el).textContent = n ? `${n} personnalisé${n > 1 ? 's' : ''}` : 'tous d\'origine';
        const total = Object.keys(this.brouillon).length;
        $('#barre-enr', el).hidden = !total;
        $('#barre-enr-texte', el).innerHTML = `<b>${total}</b> modification${total > 1 ? 's' : ''} non enregistrée${total > 1 ? 's' : ''}${Object.keys(this.brouillon).some(c => !clesPage(page).includes(c)) ? ' <span class="muet">(dont sur d\'autres pages)</span>' : ''}`;
        el.dataset.modifie = total ? '1' : '0';
      };

      Object.keys(definitions).forEach(majChamp); majApercu(); majCompteurs();
      $$('[data-cle]', el).forEach(ajuster);

      $$('[data-cle]', el).forEach(t => t.addEventListener('input', () => {
        const cle = t.dataset.cle;
        let v = t.value;
        if (definitions[cle].type === 'ligne') v = v.replace(/\n/g, ' ');
        if (v === (enregistres[cle] ?? '')) delete this.brouillon[cle]; else this.brouillon[cle] = v;
        ajuster(t); majChamp(cle); majApercu(); majCompteurs();
      }));
      $$('[data-origine]', el).forEach(b => b.onclick = () => {
        const cle = b.dataset.origine, t = $(`[data-cle="${cle}"]`, el);
        t.value = TEXTES_ORIGINE[cle]; t.dispatchEvent(new Event('input', { bubbles: true }));
        t.focus();
      });
      $$('[data-page]', el).forEach(b => b.onclick = () => { this.pageId = b.dataset.page; this.rendre(el); window.scrollTo(0, 0); });

      const enregistrer = async () => {
        const modifs = { ...this.brouillon };
        if (!Object.keys(modifs).length) return;
        const videTrouve = Object.entries(modifs).find(([, v]) => !v.trim());
        if (videTrouve) {
          if (!await confirmer(`Le texte « ${definitions[videTrouve[0]].label} » est vide : le texte d'origine sera affiché sur le site à la place. Enregistrer quand même ?`, { libelle: 'Enregistrer', danger: false })) return;
        }
        const bouton = $('#enregistrer-tout', el); bouton.disabled = true;
        try {
          const r = await S.modifier('contenu', 'textes', modifs);
          this.brouillon = {}; okEnregistre(r); this.rendre(el);
        } catch (err) { erreur(err); bouton.disabled = false; }
      };
      $('#enregistrer-tout', el).onclick = enregistrer;
      $('#annuler-tout', el).onclick = async () => {
        if (await confirmer('Annuler toutes les modifications non enregistrées ?', { libelle: 'Annuler les modifications' })) { this.brouillon = {}; this.rendre(el); }
      };
      el.onkeydown = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); enregistrer(); } };
    },
    aDesModifications() { return Object.keys(this.brouillon).length > 0; },
  },

  // -------------------------------------------------------------- Images du site
  images: {
    titre: 'Images du site', icone: 'image',
    rendre(el) {
      el.innerHTML = `
        <p class="intro">Bannières, cartes de l'accueil et portrait. Une image remplacée est réduite automatiquement ; « Remettre l'originale » revient à l'image d'origine.</p>
        <div class="galerie images">${IMAGES_SITE.map(i => {
          const perso = S.image(i.cle);
          return `<figure class="photo">
            <div class="photo-img"><img src="${esc(perso || i.origine)}" alt="" loading="lazy">${perso ? '<span class="pastille verte">Personnalisée</span>' : ''}</div>
            <figcaption><b>${esc(i.label)}</b><small class="type">${esc(i.page)}</small></figcaption>
            <div class="photo-actions">
              ${perso ? `<button class="btn-icone" data-origine="${i.cle}" title="Remettre l'originale">${ic('supprimer')}</button>` : ''}
              <label class="btn-icone" title="Remplacer l'image" style="cursor:pointer">${ic('televerser')}<input type="file" accept="image/*" data-remplacer="${i.cle}" hidden></label>
            </div>
          </figure>`;
        }).join('')}</div>`;
      $$('[data-remplacer]', el).forEach(inp => inp.onchange = async e => {
        const f = e.target.files[0]; e.target.value = '';
        if (!f) return;
        const cle = inp.dataset.remplacer;
        toast('Envoi de l\'image…');
        try {
          const data = await preparerImage(f, cle === 'apropos_portrait' ? 1000 : 1800, 700000);
          okEnregistre(await S.changerImage(cle, data));
        } catch (err) { erreur(err); }
      });
      $$('[data-origine]', el).forEach(b => b.onclick = async () => {
        if (await confirmer('Remettre l\'image d\'origine à cet endroit du site ?', { libelle: 'Remettre l\'originale' })) S.retirerImage(b.dataset.origine).then(() => toast('Image d\'origine remise')).catch(erreur);
      });
    }
  },

  // -------------------------------------------------------------- Liens
  liens: {
    titre: 'Liens & contact', icone: 'lien', formulaire: true,
    rendre(el) {
      const l = S.liens();
      el.innerHTML = `
        <form class="carte" id="f">
          <div class="carte-tete"><h3>Affichés sur la page Contact et en bas de chaque page</h3></div>
          <div class="grille-champs">${CHAMPS_LIENS.map(ch => champ({ ...ch, valeur: l[ch.cle] })).join('')}</div>
          <div class="actions"><button class="btn btn-primaire" type="submit">${ic('ok')} Enregistrer</button></div>
        </form>`;
      $('#f', el).onsubmit = async e => {
        e.preventDefault();
        const v = lireFormulaire(e.target);
        if ([v.instagram_perso, v.instagram_projets].some(u => u && !/^https?:\/\//i.test(u))) return toast('Les liens doivent commencer par https://', 'erreur');
        if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) return toast('Adresse e-mail invalide', 'erreur');
        try { okEnregistre(await S.enregistrer('contenu', 'liens', v)); } catch (err) { erreur(err); }
      };
    }
  },

  // -------------------------------------------------------------- Paramètres
  parametres: {
    titre: 'Paramètres', icone: 'parametres',
    rendre(el) {
      const email = S.utilisateurCourant();
      el.innerHTML = `
        <div class="grille-2">
          <section class="carte">
            <div class="carte-tete"><h3>Mon compte</h3></div>
            <p class="compte">${ic('utilisateur')} <b>${esc(email)}</b></p>
            ${S.mode === 'firebase' ? `<button class="btn btn-clair" id="mdp">${ic('cle')} Recevoir un e-mail pour changer de mot de passe</button>` : ''}
            <button class="btn btn-clair" id="deco">${ic('sortie')} Se déconnecter</button>
          </section>
          <section class="carte">
            <div class="carte-tete"><h3>Comptes ayant accès</h3></div>
            <p>Les comptes se gèrent dans <b>Firebase → Authentication → Users</b>. Chaque compte ajouté a accès automatiquement à l'espace de gestion.</p>
            <p class="muet">Pour retirer un accès : menu ⋮ du compte → Désactiver ou Supprimer.</p>
            <a class="lien" href="https://console.firebase.google.com/" target="_blank" rel="noopener">Ouvrir la console Firebase ${ic('externe')}</a>
          </section>
        </div>
        <div class="grille-2">
          <section class="carte">
            <div class="carte-tete"><h3>Contenu d'origine du site</h3></div>
            <p>Ajoute dans la base les textes, les liens, les livres, les photos et les projets du site tels qu'ils ont été créés. Ce qui existe déjà est conservé.</p>
            <button class="btn btn-sombre" id="importer">${ic('telecharger')} Importer ce qui manque</button>
            <button class="btn btn-clair danger" id="ecraser">Tout remettre comme à l'origine</button>
          </section>
          <section class="carte">
            <div class="carte-tete"><h3>Sauvegarde</h3></div>
            <p>Télécharge tout le contenu (sauf les grandes versions des photos) dans un fichier, à garder en lieu sûr.</p>
            <button class="btn btn-sombre" id="export">${ic('telecharger')} Télécharger une sauvegarde</button>
            ${S.mode === 'demo' ? `<button class="btn btn-clair danger" id="reset">Réinitialiser les données de démonstration</button>` : ''}
          </section>
        </div>
        <section class="carte">
          <div class="carte-tete"><h3>État</h3></div>
          <ul class="etat">
            <li><span>Mode</span><b>${S.mode === 'firebase' ? 'Connecté à Firebase' : 'Démonstration (rien n\'est envoyé sur le site)'}</b></li>
            <li><span>Site public</span><a class="lien" href="${SITE_URL}" target="_blank" rel="noopener">${esc(SITE_URL)}</a></li>
          </ul>
        </section>`;
      $('#deco', el).onclick = () => S.deconnexion();
      $('#mdp', el)?.addEventListener('click', async () => {
        try { await S.motDePasseOublie(email); toast('E-mail envoyé à ' + email); } catch (err) { erreur(err); }
      });
      $('#importer', el).onclick = async () => { try { const n = await S.importerOrigine(); toast(n ? 'Contenu importé' : 'Tout est déjà dans la base'); } catch (err) { erreur(err); } };
      $('#ecraser', el).onclick = async () => {
        if (!await confirmer('Remettre les textes, les liens et les livres et projets d\'origine ? Vos modifications sur ces éléments seront remplacées. Les photos, cosplays et éléments ajoutés sont conservés.', { libelle: 'Tout remettre' })) return;
        try { await S.importerOrigine({ ecraser: true }); toast('Contenu d\'origine remis'); } catch (err) { erreur(err); }
      };
      $('#export', el).onclick = () => telecharger(S.exporter(), `sauvegarde-kmauger-${isoJour()}.json`);
      $('#reset', el)?.addEventListener('click', async () => { if (await confirmer('Effacer les modifications de démonstration ?', { libelle: 'Réinitialiser' })) { S.reinitialiserDemo(); toast('Démo réinitialisée'); } });
    }
  },
};

// =====================================================================
//  Formulaires
// =====================================================================
function formulaireAvecImage({ id, titre, col, element, defaut, corps, image, valider }) {
  const v = element || defaut;
  const ci = champImage({ valeur: v[image.cle], ...image });
  ouvrirFenetre({
    titre, large: true,
    contenu: `<form id="${id}">${ci.html}${corps(v)}</form>`,
    pied: piedForm(id),
    onOuvert(racine, pied) {
      ci.brancher(racine);
      $('[data-annuler]', pied).onclick = fermerFenetre;
      $('#' + id, racine).onsubmit = async ev => {
        ev.preventDefault();
        const d = { ...lireFormulaire(ev.target), [image.cle]: ci.lire() };
        const probleme = valider(d);
        if (probleme) return toast(probleme, 'erreur');
        try {
          if (element) await S.modifier(col, element.id, d);
          else await S.creer(col, { ...d, ordre: prochainOrdre(col) });
          fermerFenetre(); toast(element ? 'Modifié' : 'Ajouté');
        } catch (err) { erreur(err); }
      };
    }
  });
}
const lienValide = u => !u || /^https?:\/\//i.test(u);

function formLivre(l = null) {
  formulaireAvecImage({
    id: 'fl', col: 'livres', element: l, titre: l ? 'Modifier le livre' : 'Nouveau livre',
    defaut: { titre: '', genre: '', statut: 'bientot', accroche: '', description: '', couverture: '', pages: '', format: 'Poche · 11 × 17 cm', dateParution: '', isbn: '', langue: 'Français', prix: '', lienAmazon: '', lienCoolLibri: '', visible: true },
    image: { cle: 'couverture', label: 'Couverture', portrait: true, largeur: 800, plafond: 260000 },
    corps: v => `
      ${champ({ cle: 'titre', label: 'Titre', valeur: v.titre, requis: true })}
      <div class="grille-champs">
        ${champ({ cle: 'genre', label: 'Genre', valeur: v.genre, placeholder: 'Ex. : Urban fantasy' })}
        ${champ({ cle: 'statut', label: 'Statut', type: 'select', valeur: v.statut, options: STATUTS_LIVRE })}
      </div>
      ${champ({ cle: 'accroche', label: 'Accroche (liste des livres)', valeur: v.accroche, placeholder: 'Une phrase courte' })}
      ${champ({ cle: 'description', label: 'Description (fiche du livre)', type: 'texte', valeur: v.description, aide: 'Une ligne vide = nouveau paragraphe. *mot* = italique.' })}
      <div class="grille-champs">
        ${champ({ cle: 'lienAmazon', label: 'Lien Amazon', valeur: v.lienAmazon, placeholder: 'https://www.amazon.fr/…' })}
        ${champ({ cle: 'lienCoolLibri', label: 'Lien CoolLibri', valeur: v.lienCoolLibri, placeholder: 'https://www.coollibri.com/…' })}
      </div>
      <p class="aide">Les boutons d'achat n'apparaissent que si un lien est rempli ; sans lien, la fiche affiche « Bientôt disponible ».</p>
      <div class="grille-champs">
        ${champ({ cle: 'pages', label: 'Nombre de pages', valeur: v.pages })}
        ${champ({ cle: 'format', label: 'Format', valeur: v.format })}
        ${champ({ cle: 'dateParution', label: 'Date de parution', valeur: v.dateParution, placeholder: 'Ex. : 29 octobre 2026' })}
        ${champ({ cle: 'isbn', label: 'ISBN', valeur: v.isbn })}
        ${champ({ cle: 'langue', label: 'Langue', valeur: v.langue })}
        ${champ({ cle: 'prix', label: 'Prix (facultatif)', valeur: v.prix, placeholder: 'Ex. : 14,08 €' })}
      </div>
      ${champ({ cle: 'visible', label: 'Afficher sur le site', type: 'case', valeur: v.visible !== false })}`,
    valider: d => !d.titre ? 'Le titre est obligatoire' : !lienValide(d.lienAmazon) || !lienValide(d.lienCoolLibri) ? 'Les liens doivent commencer par https://' : '',
  });
}

function formProjet(p = null) {
  formulaireAvecImage({
    id: 'fpr', col: 'projets', element: p, titre: p ? 'Modifier le projet' : 'Nouveau projet',
    defaut: { titre: '', type: 'site', description: '', technologies: '', lien: '', libelleLien: '', image: '', visible: true },
    image: { cle: 'image', label: 'Image', largeur: 1000, plafond: 220000 },
    corps: v => `
      <div class="grille-champs">
        ${champ({ cle: 'titre', label: 'Nom du projet', valeur: v.titre, requis: true })}
        ${champ({ cle: 'type', label: 'Type', type: 'select', valeur: v.type, options: TYPES_PROJET })}
      </div>
      ${champ({ cle: 'description', label: 'Description', type: 'texte', valeur: v.description })}
      ${champ({ cle: 'technologies', label: 'Technologies (séparées par des virgules)', valeur: v.technologies, placeholder: 'Ex. : HTML, Firebase, React Native' })}
      <div class="grille-champs">
        ${champ({ cle: 'lien', label: 'Lien (facultatif)', valeur: v.lien, placeholder: 'https://…' })}
        ${champ({ cle: 'libelleLien', label: 'Texte du lien', valeur: v.libelleLien, placeholder: 'Voir le projet' })}
      </div>
      ${champ({ cle: 'visible', label: 'Afficher sur le site', type: 'case', valeur: v.visible !== false })}`,
    valider: d => !d.titre ? 'Le nom est obligatoire' : !lienValide(d.lien) ? 'Le lien doit commencer par https://' : '',
  });
}

function formCosplay(c = null) {
  formulaireAvecImage({
    id: 'fc', col: 'cosplays', element: c, titre: c ? 'Modifier le cosplay' : 'Nouveau cosplay',
    defaut: { titre: '', univers: '', annee: '', description: '', image: '', visible: true },
    image: { cle: 'image', label: 'Photo', portrait: true, largeur: 1000, plafond: 250000 },
    corps: v => `
      ${champ({ cle: 'titre', label: 'Personnage', valeur: v.titre, requis: true })}
      <div class="grille-champs">
        ${champ({ cle: 'univers', label: 'Univers (film, jeu, série…)', valeur: v.univers })}
        ${champ({ cle: 'annee', label: 'Année', valeur: v.annee })}
      </div>
      ${champ({ cle: 'description', label: 'Fabrication, détails, événement', type: 'texte', valeur: v.description })}
      ${champ({ cle: 'visible', label: 'Afficher sur le site', type: 'case', valeur: v.visible !== false })}`,
    valider: d => !d.titre ? 'Le personnage est obligatoire' : '',
  });
}

function formPhoto(p) {
  ouvrirFenetre({
    titre: 'Modifier la photo',
    contenu: `<form id="fp"><img class="photo-grande" src="${esc(p.apercu)}" alt="">
      ${champ({ cle: 'legende', label: 'Légende', valeur: p.legende })}
      <div class="grille-champs">
        ${champ({ cle: 'categorie', label: 'Catégorie', type: 'select', valeur: p.categorie, options: CATEGORIES_PHOTO })}
        <div class="champ champ-case">${champ({ cle: 'visible', label: 'Afficher sur le site', type: 'case', valeur: p.visible !== false })}</div>
      </div></form>`,
    pied: piedForm('fp'),
    onOuvert(corps, pied) {
      $('[data-annuler]', pied).onclick = fermerFenetre;
      $('#fp', corps).onsubmit = async ev => {
        ev.preventDefault();
        try { await S.modifier('photos', p.id, lireFormulaire(ev.target)); fermerFenetre(); toast('Photo modifiée'); } catch (err) { erreur(err); }
      };
    }
  });
}

function formTeleversement(fichiers, categorieDefaut) {
  const nom = f => f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/^(img|dsc|pxl|imgp|photo)\s*\d*/i, '').trim();
  let enCours = false;
  const envoyes = new Set();
  ouvrirFenetre({
    titre: fichiers.length > 1 ? `Ajouter ${fichiers.length} photos` : 'Ajouter une photo',
    large: true,
    contenu: `<form id="ft">
      <div class="grille-champs">
        ${champ({ cle: 'categorie', label: 'Catégorie', type: 'select', valeur: categorieDefaut, options: CATEGORIES_PHOTO })}
        <div class="champ champ-case">${champ({ cle: 'visible', label: 'Afficher tout de suite sur le site', type: 'case', valeur: true })}</div>
      </div>
      <ul class="televersement">${fichiers.map((f, i) => `<li><img data-i="${i}" alt=""><input name="leg${i}" value="${esc(nom(f))}" placeholder="Légende de la photo"><span class="etat-envoi" data-etat="${i}"></span></li>`).join('')}</ul>
    </form>`,
    pied: `<button type="button" class="btn btn-clair" data-annuler>Annuler</button><button type="submit" form="ft" class="btn btn-primaire" id="envoyer">${ic('televerser')} Envoyer</button>`,
    onOuvert(corps, pied) {
      fichiers.forEach((f, i) => { const u = URL.createObjectURL(f); const im = $(`img[data-i="${i}"]`, corps); im.onload = () => URL.revokeObjectURL(u); im.src = u; });
      $('[data-annuler]', pied).onclick = () => { if (!enCours) fermerFenetre(); };
      $('#ft', corps).onsubmit = async ev => {
        ev.preventDefault();
        if (enCours) return;
        enCours = true; $('#envoyer', pied).disabled = true;
        const f = ev.target, categorie = f.categorie.value, visible = f.visible.checked;
        let ordre = prochainOrdre('photos'), ok = 0;
        for (let i = 0; i < fichiers.length; i++) {
          if (envoyes.has(i)) continue;
          const etat = $(`[data-etat="${i}"]`, corps);
          etat.textContent = 'Envoi…'; etat.className = 'etat-envoi';
          try {
            const { apercu, hd } = await preparerPhoto(fichiers[i]);
            await S.ajouterPhoto({ legende: f['leg' + i].value.trim(), categorie, visible, ordre: ordre++, ajouteLe: Date.now() }, apercu, hd);
            etat.textContent = 'Envoyée'; etat.classList.add('ok'); ok++; envoyes.add(i);
          } catch (err) {
            console.error(err); etat.textContent = S.messageErreur(err); etat.classList.add('ko');
          }
        }
        enCours = false;
        toast(`${ok} photo${ok > 1 ? 's' : ''} ajoutée${ok > 1 ? 's' : ''}`, ok ? 'ok' : 'erreur');
        if (envoyes.size === fichiers.length) fermerFenetre(); else $('#envoyer', pied).disabled = false;
      };
    }
  });
}
