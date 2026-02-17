# Feature Specification: Suivi des Enfants Bénéficiaires

**Feature Branch**: `001-child-beneficiary-tracking`
**Created**: 2026-02-17
**Status**: Draft
**Input**: Plateforme de suivi des enfants bénéficiaires du programme de parrainage Anayi

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enregistrer un enfant bénéficiaire (Priority: P1)

Un volontaire sur le terrain remplit un formulaire d'enquête pour enregistrer un nouvel enfant bénéficiaire. Il saisit les informations d'identité, la situation scolaire, sanitaire, les conditions de vie, et télécharge les documents requis (acte de naissance, certificat de scolarité, photo récente).

**Why this priority**: C'est la fonctionnalité fondamentale. Sans enregistrement des enfants, aucune autre fonctionnalité n'a de sens. C'est le point d'entrée de toute la plateforme.

**Independent Test**: Un volontaire peut créer un dossier complet d'un enfant avec tous les champs requis et les documents joints, puis retrouver ce dossier.

**Acceptance Scenarios**:

1. **Given** un volontaire connecté, **When** il remplit le formulaire avec toutes les informations obligatoires et soumet, **Then** le dossier de l'enfant est créé et un numéro de référence unique est attribué.
2. **Given** un volontaire remplissant le formulaire, **When** il télécharge une photo, un acte de naissance et un certificat de scolarité, **Then** les documents sont enregistrés et associés au dossier de l'enfant.
3. **Given** un volontaire remplissant le formulaire, **When** il omet un champ obligatoire, **Then** un message d'erreur clair indique le champ manquant.
4. **Given** un volontaire ayant soumis un formulaire, **When** il consulte la liste des enfants enregistrés, **Then** le nouvel enfant apparaît dans la liste.

---

### User Story 2 - Consulter et rechercher les dossiers d'enfants (Priority: P2)

Un administrateur ou un volontaire consulte la liste des enfants bénéficiaires enregistrés. Il peut rechercher par nom, village, école ou statut de parrainage. Il peut ouvrir un dossier pour voir toutes les informations détaillées de l'enfant.

**Why this priority**: Une fois les enfants enregistrés, la consultation et la recherche sont essentielles pour le suivi quotidien et la prise de décision.

**Independent Test**: Un utilisateur peut afficher la liste paginée des enfants, filtrer par critères, et consulter le détail complet d'un dossier.

**Acceptance Scenarios**:

1. **Given** un utilisateur connecté, **When** il accède à la liste des bénéficiaires, **Then** il voit une liste paginée avec nom, photo, village, école et statut de parrainage.
2. **Given** un utilisateur sur la liste, **When** il recherche par nom "Koffi", **Then** seuls les enfants dont le nom ou prénom contient "Koffi" sont affichés.
3. **Given** un utilisateur sur la liste, **When** il filtre par village "Abomey", **Then** seuls les enfants résidant à Abomey sont affichés.
4. **Given** un utilisateur sur la liste, **When** il clique sur un enfant, **Then** il voit le dossier complet avec toutes les informations et les documents joints.

---

### User Story 3 - Gérer les demandes de parrainage (Priority: P3)

Un administrateur identifie les enfants souhaitant être inscrits au programme de parrainage (ayant le consentement du responsable). Il peut mettre à jour le statut de parrainage d'un enfant (en attente, parrainé, non éligible).

**Why this priority**: Le parrainage est l'objectif final de la collecte de données. Cette fonctionnalité permet de concrétiser l'aide apportée aux enfants.

**Independent Test**: Un administrateur peut filtrer les enfants éligibles au parrainage et mettre à jour leur statut.

**Acceptance Scenarios**:

1. **Given** un administrateur connecté, **When** il filtre les enfants par "souhaite être parrainé" avec consentement obtenu, **Then** il voit la liste des enfants éligibles au parrainage.
2. **Given** un administrateur consultant un dossier, **When** il change le statut de parrainage de "en attente" à "parrainé", **Then** le statut est mis à jour et la date de changement est enregistrée.
3. **Given** un administrateur, **When** il consulte le tableau de bord, **Then** il voit les statistiques globales : nombre total d'enfants, en attente de parrainage, parrainés, non éligibles.

---

### User Story 4 - Gérer les comptes utilisateurs (Priority: P4)

Un administrateur crée et gère les comptes des volontaires qui effectuent les enquêtes terrain. Il peut activer, désactiver ou modifier les droits d'un volontaire.

**Why this priority**: La gestion des accès est nécessaire pour sécuriser la plateforme et contrôler qui peut enregistrer ou modifier des dossiers.

**Independent Test**: Un administrateur peut créer un compte volontaire, et ce volontaire peut se connecter et accéder au formulaire d'enregistrement.

**Acceptance Scenarios**:

1. **Given** un administrateur connecté, **When** il crée un compte volontaire avec nom, contact et rôle, **Then** le volontaire reçoit ses identifiants de connexion.
2. **Given** un administrateur, **When** il désactive un compte volontaire, **Then** le volontaire ne peut plus se connecter.
3. **Given** un volontaire connecté, **When** il tente d'accéder aux fonctions d'administration, **Then** l'accès est refusé.

---

### Edge Cases

- Que se passe-t-il si deux volontaires enregistrent le même enfant ? Le système DOIT détecter les doublons potentiels (même nom + même date de naissance + même village) et alerter.
- Que se passe-t-il si un document téléchargé est corrompu ou dans un format non supporté ? Le système DOIT valider le format (JPG, PNG, PDF) et la taille (max 5 Mo) avant enregistrement.
- Que se passe-t-il si le volontaire perd sa connexion en cours de saisie ? Les données du formulaire DOIVENT être sauvegardées localement dans le navigateur pour permettre la reprise.
- Que se passe-t-il si un enfant change de village ou d'école ? Le système DOIT conserver l'historique des modifications.

## Requirements *(mandatory)*

### Functional Requirements

**Identité de l'enfant**
- **FR-001**: Le système DOIT permettre la saisie du nom et prénom(s) de l'enfant.
- **FR-002**: Le système DOIT permettre le téléchargement d'une photo de l'enfant.
- **FR-003**: Le système DOIT permettre la saisie du sexe (Masculin/Féminin).
- **FR-004**: Le système DOIT permettre la saisie de la date de naissance ou de l'âge approximatif.
- **FR-005**: Le système DOIT permettre la saisie du lieu de naissance.
- **FR-006**: Le système DOIT permettre la saisie du village de résidence actuelle.
- **FR-007**: Le système DOIT permettre la saisie de la nationalité.
- **FR-008**: Le système DOIT permettre la saisie du statut familial.
- **FR-009**: Le système DOIT permettre la saisie du nombre de frères et soeurs à charge dans le foyer.

**Situation scolaire**
- **FR-010**: Le système DOIT permettre la saisie de l'école fréquentée.
- **FR-011**: Le système DOIT permettre la saisie du niveau/classe actuel(le).
- **FR-012**: Le système DOIT permettre la saisie de la fréquence de présence à l'école.
- **FR-013**: Le système DOIT permettre la saisie des besoins scolaires identifiés.

**Situation sanitaire**
- **FR-014**: Le système DOIT permettre la saisie de l'état de santé général.
- **FR-015**: Le système DOIT permettre d'indiquer si les vaccinations principales sont à jour (Oui/Non).
- **FR-016**: Le système DOIT permettre la saisie optionnelle de problèmes de santé spécifiques.

**Conditions de vie**
- **FR-017**: Le système DOIT permettre la saisie du type de logement.
- **FR-018**: Le système DOIT permettre d'indiquer l'accès à l'eau potable (Oui/Non).
- **FR-019**: Le système DOIT permettre d'indiquer l'accès à l'électricité (Oui/Non).
- **FR-020**: Le système DOIT permettre d'indiquer si l'alimentation est suffisante (Oui/Non).
- **FR-021**: Le système DOIT permettre la saisie de l'activité de la personne en charge de l'enfant.

**Parrainage**
- **FR-022**: Le système DOIT permettre d'indiquer si l'enfant souhaite être inscrit au programme de parrainage (Oui/Non).
- **FR-023**: Le système DOIT permettre d'enregistrer le consentement de la personne responsable pour le parrainage.
- **FR-024**: Le système DOIT permettre la saisie de commentaires et besoins spécifiques pour le parrainage.

**Documents**
- **FR-025**: Le système DOIT permettre le téléchargement de l'acte de naissance (image/photo).
- **FR-026**: Le système DOIT permettre le téléchargement du certificat de scolarité (image/photo).
- **FR-027**: Le système DOIT permettre le téléchargement d'une photo récente de l'enfant.

**Enquête**
- **FR-028**: Le système DOIT enregistrer le nom du volontaire ayant mené l'enquête.
- **FR-029**: Le système DOIT enregistrer le contact (Téléphone/WhatsApp) du volontaire.
- **FR-030**: Le système DOIT enregistrer la date de l'enquête.

**Gestion et recherche**
- **FR-031**: Le système DOIT permettre la recherche d'enfants par nom, village, école ou statut de parrainage.
- **FR-032**: Le système DOIT afficher la liste des enfants avec pagination.
- **FR-033**: Le système DOIT permettre la consultation du dossier complet d'un enfant.
- **FR-034**: Le système DOIT permettre la modification d'un dossier existant avec traçabilité des changements.
- **FR-035**: Le système DOIT détecter les doublons potentiels lors de l'enregistrement.

**Authentification et rôles**
- **FR-036**: Le système DOIT permettre la connexion par identifiant et mot de passe.
- **FR-037**: Le système DOIT gérer deux rôles : Administrateur et Volontaire.
- **FR-038**: Le système DOIT restreindre les fonctions d'administration (gestion des comptes, statistiques, modification des statuts de parrainage) aux administrateurs.

**Tableau de bord**
- **FR-039**: Le système DOIT afficher un tableau de bord avec les statistiques clés : nombre total d'enfants, répartition par statut de parrainage, par village, par sexe.

### Key Entities

- **Enfant (Child)**: Bénéficiaire principal. Contient toutes les informations d'identité, situation scolaire, sanitaire, conditions de vie, et statut de parrainage.
- **Document**: Pièce jointe associée à un enfant (acte de naissance, certificat de scolarité, photo). Contient le type, le chemin du fichier, la date de téléchargement.
- **Enquête (Survey)**: Informations sur la collecte de données terrain. Contient le volontaire responsable, la date, et le lien vers l'enfant enregistré.
- **Utilisateur (User)**: Personne ayant accès à la plateforme. Peut être Administrateur ou Volontaire. Contient nom, contact, rôle, statut du compte.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un volontaire peut enregistrer un enfant complet (tous les champs + 3 documents) en moins de 10 minutes.
- **SC-002**: La recherche d'un enfant parmi 10 000 dossiers retourne des résultats en moins de 2 secondes.
- **SC-003**: 95% des volontaires réussissent à enregistrer un enfant sans assistance dès leur première utilisation.
- **SC-004**: Le tableau de bord affiche les statistiques actualisées en moins de 3 secondes.
- **SC-005**: Aucune donnée personnelle d'enfant ne doit être accessible sans authentification.
- **SC-006**: Le système détecte 90% des doublons potentiels lors de l'enregistrement.
- **SC-007**: Les données saisies dans le formulaire sont préservées en cas de perte de connexion temporaire.

## Assumptions

- Les volontaires disposent d'un smartphone ou d'un ordinateur avec un navigateur web moderne.
- La connexion internet peut être intermittente sur le terrain (d'où la sauvegarde locale du formulaire).
- Les photos et documents sont pris avec le téléphone du volontaire (formats JPG/PNG courants).
- L'organisation Anayi dispose d'au moins un administrateur pour gérer les comptes.
- La plateforme sera utilisée principalement au Bénin, l'interface sera en français.
- Le nombre initial de bénéficiaires est estimé à quelques milliers, avec une croissance progressive.
