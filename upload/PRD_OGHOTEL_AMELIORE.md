# PRD AMÉLIORÉ — OGHOTEL

**Product Requirements Document**  
**SaaS de gestion d’hôtels et résidences meublées — Marché de Côte d’Ivoire**

---

## Informations générales

| Élément | Détail |
|---|---|
| Nom du produit | **OGHOTEL** |
| Type de produit | SaaS web multi-tenant |
| Marché cible | Côte d’Ivoire |
| Langue principale | Français |
| Devise | FCFA |
| Porteur de projet / Super Admin | ogouromain@gmail.com |
| Contact WhatsApp commercial | +225 05 76 10 32 77 |
| Version du PRD | 2.0 améliorée |
| Date | Juillet 2026 |
| Stack technique cible | Frontend via GLM-5 / React ou Next.js · Supabase · GitHub · Vercel |

> **Note de sécurité obligatoire**  
> Les clés Supabase, la clé `service_role`, les tokens personnels GitHub/Supabase et les mots de passe ne doivent jamais être placés dans le frontend, dans GitHub, dans un PRD public ou dans un fichier partagé. Ils doivent être stockés uniquement dans les variables d’environnement de Vercel/Supabase. Toute clé déjà exposée doit être régénérée avant la mise en production.

---

# 1. Résumé exécutif

OGHOTEL est une plateforme SaaS multi-tenant destinée aux propriétaires, gérants et responsables d’hôtels, résidences meublées, auberges et autres structures d’hébergement en Côte d’Ivoire.

L’application centralise dans une interface simple :

- la gestion des chambres ;
- la gestion des réservations ;
- le calendrier de disponibilité ;
- les check-in et check-out ;
- les fiches clients ;
- les paiements ;
- les factures et reçus ;
- les dépenses ;
- le personnel ;
- le ménage ;
- la maintenance ;
- les rapports et statistiques.

Le modèle commercial repose sur trois formules d’abonnement annuel :

- **ESSENTIEL — 30 000 FCFA/an** ;
- **PRIVILÈGE — 50 000 FCFA/an** ;
- **PREMIUM — 75 000 FCFA/an**.

Le processus de vente est volontairement semi-manuel au lancement :

1. le prospect visite la landing page ;
2. il remplit un formulaire de demande ;
3. le Super Admin reçoit la demande dans son tableau de bord ;
4. le Super Admin contacte le prospect par WhatsApp ou appel ;
5. le prospect paie par Mobile Money ou autre moyen convenu ;
6. le Super Admin valide le paiement ;
7. le Super Admin génère un code d’activation unique ;
8. le client utilise ce code pour créer son compte administrateur d’hôtel/résidence.

OGHOTEL doit être professionnel, mais suffisamment simple pour être utilisé par une personne peu habituée aux logiciels de gestion.

---

# 2. Contexte et problématique

De nombreux hôtels et résidences en Côte d’Ivoire gèrent encore leurs activités avec :

- des cahiers papier ;
- des fichiers Excel ;
- des conversations WhatsApp ;
- des appels téléphoniques ;
- des reçus manuels ;
- une mémoire humaine non centralisée.

Cette organisation crée plusieurs difficultés :

- risque de double réservation ;
- manque de visibilité sur les chambres disponibles ;
- erreurs dans les calculs de nuitées, acomptes et soldes ;
- absence d’historique fiable des clients ;
- difficulté à suivre les paiements en espèces et Mobile Money ;
- manque de statistiques sur le taux d’occupation ou le chiffre d’affaires ;
- contrôle limité sur les employés ;
- perte d’informations entre réception, ménage, comptabilité et direction ;
- facturation peu professionnelle ;
- absence d’outil local abordable et adapté aux usages ivoiriens.

OGHOTEL apporte une réponse locale, simple et structurée à ces problèmes.

---

# 3. Vision produit

## 3.1 Vision

Faire d’OGHOTEL une solution locale de référence pour la gestion numérique des hôtels et résidences en Côte d’Ivoire, avec un produit simple, fiable, abordable et adapté aux réalités du terrain : Mobile Money, WhatsApp, FCFA, interface française et utilisation sur mobile.

## 3.2 Proposition de valeur

OGHOTEL permet à un établissement de :

- connaître en temps réel les chambres libres, occupées, réservées, en nettoyage ou hors service ;
- éviter les doubles réservations ;
- créer des réservations rapidement ;
- suivre les paiements, acomptes, soldes et impayés ;
- générer des reçus et factures professionnels ;
- suivre les recettes, dépenses et performances ;
- organiser le ménage et la maintenance ;
- limiter les accès du personnel selon les rôles ;
- obtenir des rapports simples pour piloter son activité.

## 3.3 Positionnement

OGHOTEL n’est pas une application complexe réservée aux grands hôtels internationaux. C’est un outil local et accessible, conçu pour les petites et moyennes structures hôtelières, résidences meublées et établissements qui veulent professionnaliser leur gestion sans complexité.

---

# 4. Objectifs du produit

| Objectif | Description |
|---|---|
| Simplicité | Interface intuitive, vocabulaire clair, parcours guidé, peu de champs obligatoires. |
| Fiabilité | Zéro double réservation, disponibilité en temps réel, calcul fiable des paiements. |
| Autonomie commerciale | Le Super Admin contrôle les prospects, paiements, abonnements, activations et renouvellements. |
| Adaptation locale | FCFA, WhatsApp, Mobile Money, usage mobile, langue française. |
| Évolutivité | Architecture multi-tenant permettant d’ajouter de nouveaux hôtels sans développement supplémentaire. |
| Sécurité | Isolation stricte des données entre établissements grâce à Supabase RLS. |
| Professionnalisme | Facturation, reçus, rapports, journal d’activité et tableaux de bord clairs. |

---

# 5. Personas et rôles

## 5.1 Super Admin — éditeur de l’application

Le Super Admin est le propriétaire/concepteur d’OGHOTEL. Il n’est pas un client hôtelier. Son compte est global et non lié à un établissement.

### Responsabilités

- gérer la plateforme OGHOTEL ;
- consulter les demandes venant de la landing page ;
- contacter les prospects ;
- enregistrer les paiements reçus ;
- générer les codes d’activation ;
- créer, activer, suspendre ou renouveler les comptes clients ;
- suivre les revenus SaaS ;
- gérer les formules et fonctionnalités ;
- consulter les statistiques globales ;
- exporter les données commerciales.

## 5.2 Prospect / visiteur

Personne intéressée par OGHOTEL. Elle visite la landing page, consulte les tarifs et remplit le formulaire de demande d’abonnement.

## 5.3 Admin Hôtel — client final

Propriétaire ou gérant d’un hôtel/résidence ayant souscrit à OGHOTEL. Il administre son propre établissement.

### Responsabilités

- configurer l’établissement ;
- créer les chambres et types de chambres ;
- gérer les réservations ;
- suivre les paiements ;
- créer des comptes employés selon la formule ;
- consulter les rapports ;
- renouveler son abonnement.

## 5.4 Personnel hôtelier

Comptes secondaires créés par l’Admin Hôtel, selon la formule souscrite.

### Rôles possibles

- **Manager** : supervision opérationnelle ;
- **Réceptionniste** : réservations, clients, check-in/check-out, paiements ;
- **Comptable** : paiements, dépenses, rapports ;
- **Ménage** : suivi de l’état des chambres ;
- **Maintenance** : incidents et réparations.

---

# 6. Parcours utilisateur global

```text
[Landing Page OGHOTEL]
        │
        ▼
[Formulaire prospect : nom, structure, contact, formule souhaitée]
        │
        ▼
[Enregistrement en base + notification dashboard Super Admin]
        │
        ▼
[Super Admin contacte le prospect via WhatsApp / appel]
        │
        ▼
[Accord commercial conclu]
        │
        ▼
[Paiement Mobile Money direct au Super Admin]
        │
        ▼
[Super Admin valide le paiement dans son dashboard]
        │
        ▼
[Génération d’un code d’activation unique]
        │
        ▼
[Code envoyé au client]
        │
        ▼
[Client saisit le code sur la page d’activation]
        │
        ▼
[Création du compte Admin Hôtel + espace de gestion dédié]
        │
        ▼
[Client utilise OGHOTEL pour gérer son établissement]
```

---

# 7. Périmètre fonctionnel

## 7.1 Inclus dans le MVP

- Landing page publique ;
- formulaire prospect ;
- tableau de bord Super Admin ;
- gestion des prospects ;
- gestion des paiements SaaS manuels ;
- génération de codes d’activation ;
- activation client par code ;
- création du compte Admin Hôtel ;
- authentification Supabase ;
- espace établissement multi-tenant ;
- gestion des chambres ;
- gestion des types de chambres ;
- calendrier de disponibilité ;
- gestion des clients hébergés ;
- réservations ;
- check-in/check-out ;
- paiements séjour ;
- reçus/factures simples ;
- tableau de bord établissement ;
- dépenses ;
- rapports basiques ;
- gestion limitée des utilisateurs selon formule ;
- paramètres établissement ;
- alertes internes de base.

## 7.2 À prévoir après le MVP

- Paiement Mobile Money automatisé via agrégateur ;
- WhatsApp Business API ;
- notifications email automatiques ;
- réservation en ligne par les clients finaux des hôtels ;
- application mobile native ;
- export comptable avancé ;
- module restaurant/bar ;
- module stock ;
- channel manager Booking/Airbnb ;
- multi-pays ;
- intelligence artificielle pour prévisions et prix dynamiques.

---

# 8. Modules fonctionnels détaillés

---

## 8.1 Landing page publique

### Objectif

Présenter OGHOTEL, rassurer les prospects et générer des demandes qualifiées.

### Pages/sections recommandées

- Accueil ;
- présentation du problème ;
- présentation de la solution ;
- bénéfices clés ;
- fonctionnalités ;
- captures d’écran ou maquettes ;
- tarifs ;
- comparatif des formules ;
- témoignages ou section prévue pour témoignages ;
- FAQ ;
- contact ;
- mentions légales ;
- page “Activer mon compte”.

### Contenu commercial recommandé

- Slogan possible : **“Gérez votre hôtel ou résidence simplement, depuis une seule interface.”**
- Arguments principaux :
  - éviter les doubles réservations ;
  - suivre les chambres en temps réel ;
  - encaisser et suivre les paiements ;
  - générer des reçus professionnels ;
  - piloter l’activité grâce aux rapports ;
  - solution adaptée à la Côte d’Ivoire.

### Formulaire prospect

Champs :

- nom complet ;
- nom de la structure ;
- ville/commune ;
- type d’établissement : hôtel, résidence, auberge, autre ;
- nombre de chambres ;
- numéro WhatsApp ;
- email ;
- formule souhaitée ;
- message complémentaire ;
- consentement à être contacté.

### À la soumission

- Enregistrement dans la table `leads` ou `prospects` ;
- statut initial : `new` ;
- affichage d’un message de confirmation ;
- notification interne dans le dashboard Super Admin ;
- option phase 2 : notification email automatique au Super Admin.

### Critères d’acceptation

- Un visiteur peut soumettre une demande valide ;
- les champs obligatoires sont vérifiés ;
- le Super Admin voit la demande sans intervention technique ;
- un bouton WhatsApp ouvre une discussion vers le contact commercial ;
- la landing page est responsive mobile.

---

## 8.2 Interface Super Admin

### 8.2.1 Authentification

- Connexion par email et mot de passe via Supabase Auth ;
- accès réservé au rôle `super_admin` ;
- compte initial configuré via script sécurisé ou variable d’environnement ;
- changement obligatoire du mot de passe à la première connexion ;
- réinitialisation de mot de passe ;
- déconnexion.

> Le mot de passe initial ne doit pas être codé en dur dans le frontend ou dans GitHub.

### 8.2.2 Tableau de bord Super Admin

Indicateurs principaux :

- nombre total de prospects ;
- nouveaux prospects en attente ;
- prospects contactés ;
- prospects convertis ;
- prospects perdus ;
- clients actifs ;
- clients expirés ;
- clients suspendus ;
- revenus cumulés ;
- revenus du mois ;
- revenus par formule ;
- codes générés ;
- codes utilisés ;
- codes expirés ;
- abonnements proches expiration.

### 8.2.3 Gestion des prospects

Fonctions :

- liste paginée des prospects ;
- recherche par nom, établissement, téléphone ou email ;
- filtres par statut, ville, formule, date ;
- fiche prospect ;
- modification du statut : `new`, `contacted`, `negotiating`, `won`, `lost` ;
- notes internes ;
- bouton WhatsApp avec message prérempli ;
- bouton appel téléphonique ;
- conversion en client après validation paiement ;
- historique des interactions.

### 8.2.4 Gestion des clients / établissements

Fonctions :

- liste de tous les établissements abonnés ;
- détail client ;
- coordonnées ;
- formule active ;
- date de souscription ;
- date d’expiration ;
- statut : `active`, `expired`, `suspended`, `trial` si besoin ;
- nombre d’utilisateurs autorisés ;
- nombre d’établissements autorisés ;
- historique des paiements ;
- historique des codes ;
- suspension / réactivation ;
- changement de formule ;
- renouvellement manuel ;
- prolongation de la date d’expiration.

### 8.2.5 Gestion des paiements SaaS

Au lancement, les paiements sont validés manuellement.

Champs :

- prospect ou client lié ;
- formule ;
- montant ;
- moyen de paiement : Orange Money, MTN Mobile Money, Moov Money, Wave, espèces, virement ;
- référence de transaction ;
- date de paiement ;
- statut : `pending`, `validated`, `rejected`, `refunded` ;
- validé par ;
- note interne.

Fonctions :

- enregistrer un paiement ;
- valider un paiement ;
- rejeter un paiement ;
- générer un code après validation ;
- exporter les paiements en CSV ;
- visualiser les revenus par mois/année/formule.

### 8.2.6 Gestion des codes d’activation

Règles :

- code unique ;
- usage unique ;
- durée de validité limitée ;
- lié à une formule ;
- lié à un prospect ou un client ;
- utilisable seulement si statut valide ;
- devient `used` après activation.

Format recommandé :

```text
OGH-2026-XXXXXX
```

Statuts :

- `generated` ;
- `sent` ;
- `used` ;
- `expired` ;
- `cancelled`.

Fonctions :

- générer ;
- copier ;
- marquer comme envoyé ;
- annuler ;
- voir l’historique ;
- relier à un paiement ;
- relier à une formule ;
- afficher la date d’expiration.

### 8.2.7 Gestion des formules et fonctionnalités

Le Super Admin peut gérer les plans sans modifier le code.

Fonctions :

- modifier le prix annuel ;
- modifier la description ;
- activer/désactiver une formule ;
- gérer les limites : utilisateurs, établissements, modules, exports ;
- gérer les fonctionnalités incluses sous forme de configuration JSON.

### 8.2.8 Gestion financière Super Admin

Fonctions :

- revenus par période ;
- revenus par formule ;
- revenus par moyen de paiement ;
- liste des paiements validés ;
- export CSV ;
- indicateur de renouvellements à venir ;
- indicateur d’abonnements expirés.

### 8.2.9 Paramètres Super Admin

- gestion du profil ;
- changement de mot de passe ;
- configuration du contact commercial ;
- configuration du texte WhatsApp par défaut ;
- configuration des plans ;
- sécurité du compte.

### 8.2.10 Journal d’activité Super Admin

Tracer :

- connexions ;
- création/modification de prospects ;
- validation de paiements ;
- génération de codes ;
- suspension/réactivation de comptes ;
- modification des plans ;
- renouvellement d’abonnements.

---

## 8.3 Processus d’onboarding client

### Objectif

Permettre à un client ayant payé de créer son espace hôtel/résidence grâce au code d’activation fourni par le Super Admin.

### Étapes

1. Le client va sur la page “Activer mon compte”.
2. Il saisit son code d’activation.
3. Le système vérifie :
   - existence du code ;
   - statut valide ;
   - non-utilisation ;
   - non-expiration ;
   - formule associée.
4. Si le code est valide, le formulaire d’inscription s’ouvre.
5. Le client renseigne :
   - nom du gérant ;
   - nom de l’établissement ;
   - type d’établissement ;
   - adresse ;
   - ville ;
   - téléphone ;
   - email ;
   - mot de passe ;
   - logo optionnel.
6. Le système crée :
   - le tenant / établissement ;
   - le compte Admin Hôtel ;
   - le profil utilisateur ;
   - l’abonnement actif ;
   - les paramètres par défaut.
7. Le code passe au statut `used`.
8. L’utilisateur est redirigé vers son tableau de bord.

### Critères d’acceptation

- un code invalide affiche un message clair ;
- un code expiré ne peut pas être utilisé ;
- un code déjà utilisé ne peut pas être réutilisé ;
- un espace établissement est automatiquement isolé ;
- l’Admin Hôtel accède uniquement à ses données.

---

## 8.4 Interface Admin Hôtel — cœur de l’application

### 8.4.1 Tableau de bord établissement

Indicateurs :

- chambres disponibles ;
- chambres occupées ;
- chambres réservées ;
- chambres en nettoyage ;
- chambres hors service ;
- arrivées du jour ;
- départs du jour ;
- réservations en attente ;
- paiements partiels ;
- impayés ;
- recettes du jour ;
- recettes du mois ;
- dépenses du mois ;
- résultat net simplifié ;
- taux d’occupation ;
- alertes ménage ;
- alertes maintenance ;
- expiration prochaine de l’abonnement OGHOTEL.

### 8.4.2 Gestion des types de chambres

Fonctions :

- créer un type : Simple, Double, Suite, Studio, Appartement, Villa, VIP, etc. ;
- définir un prix par défaut ;
- définir une capacité ;
- ajouter une description ;
- ajouter des photos ;
- activer/désactiver un type.

### 8.4.3 Gestion des chambres

Champs :

- numéro ou nom ;
- type de chambre ;
- étage/bâtiment ;
- capacité ;
- prix par nuit ;
- prix demi-journée optionnel ;
- équipements : climatisation, TV, Wi-Fi, cuisine, douche, parking, etc. ;
- statut ;
- notes ;
- photos optionnelles.

Statuts :

- `available` : libre ;
- `reserved` : réservée ;
- `occupied` : occupée ;
- `cleaning` : en nettoyage ;
- `maintenance` : hors service / maintenance ;
- `inactive` : désactivée.

### 8.4.4 Calendrier de disponibilité

Fonctions :

- vue jour ;
- vue semaine ;
- vue mois ;
- vue par chambre ;
- couleurs par statut ;
- création rapide d’une réservation ;
- détection automatique des conflits ;
- filtre par type de chambre ;
- affichage des arrivées et départs.

### 8.4.5 Réservations

Champs :

- client ;
- chambre ;
- date d’arrivée ;
- date de départ ;
- nombre de nuits ;
- nombre d’adultes ;
- nombre d’enfants ;
- tarif appliqué ;
- remise éventuelle ;
- montant total ;
- acompte ;
- solde ;
- source : direct, téléphone, WhatsApp, agence, autre ;
- statut ;
- notes.

Statuts :

- `pending` : en attente ;
- `confirmed` : confirmée ;
- `checked_in` : client arrivé ;
- `checked_out` : séjour terminé ;
- `cancelled` : annulée ;
- `no_show` : client non présenté.

Fonctions :

- créer ;
- modifier ;
- annuler ;
- rechercher ;
- filtrer par date/statut/chambre ;
- check-in en un clic ;
- check-out en un clic ;
- paiement partiel ou total ;
- génération de reçu/facture ;
- impression ou export PDF.

### 8.4.6 Check-in

Actions :

- sélectionner une réservation confirmée ;
- vérifier ou créer la fiche client ;
- attribuer la chambre ;
- enregistrer l’acompte ou paiement ;
- passer la chambre en `occupied` ;
- passer la réservation en `checked_in` ;
- générer une fiche d’arrivée si nécessaire.

### 8.4.7 Check-out

Actions :

- calculer le montant final ;
- ajouter frais supplémentaires si besoin ;
- afficher le solde restant ;
- encaisser le solde ;
- générer reçu/facture ;
- passer la réservation en `checked_out` ;
- passer la chambre en `cleaning`.

### 8.4.8 Gestion des clients hébergés / CRM basique

Champs :

- nom complet ;
- téléphone ;
- email ;
- nationalité ;
- type de pièce : CNI, passeport, permis, autre ;
- numéro de pièce ;
- adresse ;
- notes ;
- historique des séjours.

Fonctions :

- créer une fiche ;
- rechercher rapidement ;
- réutiliser un client existant lors d’une réservation ;
- consulter l’historique ;
- voir les paiements liés.

### 8.4.9 Facturation, reçus et paiements

Fonctions :

- enregistrer paiement total ou partiel ;
- gérer plusieurs paiements par réservation ;
- moyens : espèces, Orange Money, MTN Money, Moov Money, Wave, virement, carte ;
- statut : payé, partiel, impayé ;
- référence transaction ;
- reçu simple ;
- facture simple ;
- export PDF ;
- impression navigateur ;
- historique des transactions ;
- rapport des impayés.

### 8.4.10 Dépenses

Champs :

- catégorie : salaire, électricité, eau, internet, maintenance, fournitures, carburant, nettoyage, autre ;
- montant ;
- date ;
- description ;
- responsable ;
- pièce jointe optionnelle ;
- moyen de paiement.

Rapports :

- dépenses par période ;
- dépenses par catégorie ;
- recettes moins dépenses ;
- résultat net simplifié.

### 8.4.11 Gestion du ménage

Fonctions :

- liste des chambres à nettoyer ;
- statut : sale, en cours, propre, inspectée ;
- attribution à un employé ;
- notes ;
- historique ;
- passage automatique en nettoyage après check-out.

### 8.4.12 Gestion de la maintenance

Fonctions :

- déclarer un incident ;
- chambre concernée ou incident général ;
- titre ;
- description ;
- priorité : faible, normale, urgente ;
- statut : ouvert, en cours, résolu ;
- coût ;
- responsable ;
- date de résolution ;
- passage de la chambre en maintenance si nécessaire.

### 8.4.13 Gestion du personnel

Disponible selon la formule.

Rôles :

- `hotel_admin` ;
- `manager` ;
- `receptionist` ;
- `accountant` ;
- `housekeeping` ;
- `maintenance`.

Fonctions :

- créer un utilisateur ;
- assigner un rôle ;
- activer/désactiver un compte ;
- réinitialiser un mot de passe ;
- consulter les actions d’un utilisateur ;
- limiter les permissions.

### 8.4.14 Rapports et statistiques

Rapports MVP :

- taux d’occupation ;
- chiffre d’affaires par jour/semaine/mois/année ;
- chiffre d’affaires par type de chambre ;
- réservations par statut ;
- paiements reçus ;
- paiements partiels ;
- impayés ;
- dépenses ;
- résultat net simplifié ;
- top chambres utilisées ;
- clients fréquents.

Exports :

- CSV pour le MVP ;
- PDF pour les rapports importants ;
- export comptable avancé pour Premium en phase 2.

### 8.4.15 Notifications internes

MVP :

- arrivées du jour ;
- départs du jour ;
- réservations en attente ;
- chambres à nettoyer ;
- chambres en maintenance ;
- paiements impayés ;
- abonnement expirant bientôt.

Phase 2 :

- email automatique ;
- WhatsApp Business API ;
- SMS ;
- rappels de renouvellement.

### 8.4.16 Multi-établissement

Fonction prévue principalement pour la formule Premium.

Principe :

- un même Admin peut gérer plusieurs établissements ;
- chaque établissement garde ses chambres, réservations, clients et rapports ;
- l’Admin peut basculer d’un établissement à l’autre ;
- un tableau consolidé peut afficher les performances globales.

### 8.4.17 Paramètres établissement

- nom ;
- logo ;
- adresse ;
- ville ;
- téléphone ;
- email ;
- devise : FCFA ;
- fuseau horaire ;
- heure standard check-in ;
- heure standard check-out ;
- texte des reçus/factures ;
- informations fiscales si nécessaires ;
- affichage de la formule active ;
- date d’expiration ;
- bouton contacter le Super Admin pour renouveler.

---

# 9. Formules tarifaires et limitations

| Formule | Prix | Public cible | Limites et fonctionnalités indicatives |
|---|---:|---|---|
| **ESSENTIEL** | **30 000 FCFA/an** | Petite résidence, auberge, petit hôtel | 1 établissement · 1 utilisateur Admin · chambres · réservations · clients · paiements · facturation simple · statistiques de base |
| **PRIVILÈGE** | **50 000 FCFA/an** | Hôtel/résidence de taille moyenne | Tout Essentiel · jusqu’à 3 comptes personnel · rapports avancés · dépenses · ménage · maintenance · exports CSV/PDF · support prioritaire |
| **PREMIUM** | **75 000 FCFA/an** | Groupe, grande résidence, multi-sites | Tout Privilège · multi-établissements · utilisateurs illimités ou limite configurable · exports comptables avancés · assistance dédiée |

> La répartition exacte des fonctionnalités doit être modifiable depuis l’interface Super Admin, afin de pouvoir ajuster l’offre commerciale sans redéployer l’application.

## 9.1 Feature gating recommandé

| Module | Essentiel | Privilège | Premium |
|---|---:|---:|---:|
| Chambres | Oui | Oui | Oui |
| Réservations | Oui | Oui | Oui |
| Clients hébergés | Oui | Oui | Oui |
| Paiements | Oui | Oui | Oui |
| Facture/reçu simple | Oui | Oui | Oui |
| Rapports de base | Oui | Oui | Oui |
| Dépenses | Limité | Oui | Oui |
| Personnel | Non ou limité | Jusqu’à 3 | Illimité/configurable |
| Ménage | Non ou limité | Oui | Oui |
| Maintenance | Non ou limité | Oui | Oui |
| Export CSV | Non ou limité | Oui | Oui |
| Export PDF | Non ou limité | Oui | Oui |
| Multi-établissement | Non | Non ou option | Oui |
| Support prioritaire | Non | Oui | Oui |
| Assistance dédiée | Non | Non | Oui |

---

# 10. Exigences UX/UI

## 10.1 Principes

- Interface moderne, claire et épurée ;
- parcours guidés ;
- vocabulaire simple ;
- boutons explicites ;
- actions fréquentes accessibles rapidement ;
- tableaux avec filtres et recherche ;
- badges de statut colorés ;
- peu de champs obligatoires ;
- messages d’erreur compréhensibles ;
- responsive mobile/tablette/ordinateur.

## 10.2 Style recommandé

- Couleurs principales : bleu foncé, doré/orange, blanc, gris clair ;
- typographie lisible ;
- icônes simples ;
- cartes statistiques ;
- tableaux propres ;
- calendrier visuel ;
- design professionnel adapté à un produit SaaS.

## 10.3 Accessibilité

- contraste suffisant ;
- tailles de texte lisibles ;
- navigation clavier basique ;
- labels de formulaire ;
- messages d’erreur sous les champs ;
- confirmation visible après action.

---

# 11. Exigences non fonctionnelles

| Exigence | Détail |
|---|---|
| Performance | Chargement rapide même sur connexion mobile moyenne. |
| Responsive | Utilisable sur smartphone, tablette et ordinateur. |
| Langue | Français uniquement en V1. |
| Devise | FCFA uniquement en V1. |
| Disponibilité | Hébergement Vercel + Supabase avec objectif de disponibilité élevée. |
| Sécurité | RLS obligatoire, séparation stricte des données. |
| Simplicité | Interface compréhensible par un utilisateur non technophile. |
| Maintenabilité | Code modulaire, composants réutilisables, variables d’environnement. |
| Scalabilité | Multi-tenant, ajout de clients sans modification du code. |
| Traçabilité | Journal d’activité pour les actions sensibles. |
| Sauvegarde | Prévoir stratégie de sauvegarde Supabase. |

---

# 12. Architecture technique recommandée

## 12.1 Stack

- **Frontend** : Next.js recommandé, ou React + Vite ;
- **UI** : Tailwind CSS ou CSS moderne ;
- **Backend** : Supabase ;
- **Base de données** : PostgreSQL ;
- **Authentification** : Supabase Auth ;
- **Fichiers** : Supabase Storage ;
- **Fonctions serveur** : Next.js API Routes, Server Actions ou Supabase Edge Functions ;
- **Déploiement** : Vercel ;
- **Versioning** : GitHub privé recommandé.

## 12.2 Variables d’environnement

Exemple de variables à prévoir :

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPER_ADMIN_EMAIL=...
APP_URL=...
WHATSAPP_CONTACT=...
```

Règles :

- `NEXT_PUBLIC_SUPABASE_URL` peut être côté client ;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` peut être côté client uniquement avec RLS bien configuré ;
- `SUPABASE_SERVICE_ROLE_KEY` doit rester uniquement côté serveur ;
- aucun secret ne doit être commité dans GitHub ;
- utiliser `.env.local` en local et variables Vercel en production.

## 12.3 Principe multi-tenant

Chaque table métier doit contenir un identifiant d’établissement :

- `establishment_id`, `hotel_id` ou `tenant_id`.

Le nom recommandé pour garder un vocabulaire général est :

```text
establishment_id
```

Règles :

- un utilisateur hôtelier ne voit que les données liées à son établissement ;
- le Super Admin peut voir les données globales nécessaires à l’administration SaaS ;
- les politiques RLS doivent être testées avant production ;
- les requêtes frontend ne doivent jamais contourner la sécurité.

## 12.4 Sécurité

- Supabase Auth pour tous les utilisateurs ;
- rôles dans une table `profiles` ;
- RLS activé sur toutes les tables sensibles ;
- fonctions serveur pour actions critiques : création utilisateur, activation code, génération code ;
- audit log ;
- changement obligatoire du mot de passe initial ;
- rotation des clés exposées ;
- validation côté client et côté serveur.

---

# 13. Modèle de données recommandé

> Les noms ci-dessous sont recommandés pour un projet clair. Si le développeur préfère `hotels` au lieu de `establishments`, il faut rester cohérent dans tout le code.

## 13.1 `profiles`

Profil utilisateur lié à Supabase Auth.

| Champ | Type | Description |
|---|---|---|
| id | uuid | Identifiant utilisateur, lié à `auth.users.id` |
| full_name | text | Nom complet |
| phone | text | Téléphone |
| role | text | `super_admin`, `hotel_admin`, `manager`, `receptionist`, `accountant`, `housekeeping`, `maintenance` |
| establishment_id | uuid nullable | Établissement lié, null pour Super Admin |
| must_change_password | boolean | Obligation de changer le mot de passe |
| is_active | boolean | Compte actif ou désactivé |
| created_at | timestamptz | Date création |

## 13.2 `plans`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID formule |
| name | text | ESSENTIEL, PRIVILEGE, PREMIUM |
| price_fcfa | integer | Prix annuel |
| duration_days | integer | 365 |
| max_users | integer nullable | Limite utilisateurs |
| max_establishments | integer nullable | Limite établissements |
| features | jsonb | Fonctionnalités activées |
| description | text | Description publique |
| is_active | boolean | Formule active |
| created_at | timestamptz | Date création |

## 13.3 `leads`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID prospect |
| full_name | text | Nom du prospect |
| business_name | text | Nom de la structure |
| business_type | text | Hôtel, résidence, auberge, autre |
| city | text | Ville |
| rooms_count | integer | Nombre de chambres |
| phone | text | WhatsApp |
| email | text | Email |
| desired_plan_id | uuid | Formule souhaitée |
| message | text | Message |
| status | text | `new`, `contacted`, `negotiating`, `won`, `lost` |
| internal_notes | text | Notes Super Admin |
| created_at | timestamptz | Date demande |

## 13.4 `establishments`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID établissement |
| name | text | Nom établissement |
| type | text | Hôtel, résidence, auberge, autre |
| owner_name | text | Nom du gérant/propriétaire |
| email | text | Email |
| phone | text | Téléphone |
| city | text | Ville |
| address | text | Adresse |
| logo_url | text | Logo |
| plan_id | uuid | Formule active |
| subscription_status | text | `active`, `expiring`, `expired`, `suspended` |
| subscription_start | date | Début abonnement |
| subscription_end | date | Fin abonnement |
| timezone | text | Fuseau horaire |
| currency | text | FCFA |
| created_at | timestamptz | Date création |

## 13.5 `activation_codes`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID |
| code | text unique | Code activation |
| lead_id | uuid nullable | Prospect lié |
| establishment_id | uuid nullable | Établissement créé après activation |
| plan_id | uuid | Formule |
| payment_id | uuid nullable | Paiement lié |
| amount_fcfa | integer | Montant |
| status | text | `generated`, `sent`, `used`, `expired`, `cancelled` |
| expires_at | timestamptz | Expiration du code |
| used_at | timestamptz nullable | Date utilisation |
| created_by | uuid | Super Admin |
| created_at | timestamptz | Date création |

## 13.6 `subscription_payments`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID paiement SaaS |
| lead_id | uuid nullable | Prospect |
| establishment_id | uuid nullable | Établissement |
| plan_id | uuid | Formule |
| amount_fcfa | integer | Montant |
| payment_method | text | Orange, MTN, Moov, Wave, cash, transfer |
| transaction_reference | text | Référence transaction |
| status | text | `pending`, `validated`, `rejected`, `refunded` |
| paid_at | timestamptz | Date paiement |
| validated_by | uuid | Super Admin |
| created_at | timestamptz | Date création |

## 13.7 `room_types`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID type |
| establishment_id | uuid | Établissement |
| name | text | Nom type |
| default_price | integer | Prix par défaut |
| capacity | integer | Capacité |
| description | text | Description |
| photos | jsonb | URLs photos |
| is_active | boolean | Actif |

## 13.8 `rooms`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID chambre |
| establishment_id | uuid | Établissement |
| room_type_id | uuid | Type de chambre |
| room_number | text | Numéro/nom |
| floor | text | Étage/bâtiment |
| capacity | integer | Capacité |
| price_per_night | integer | Prix nuit |
| half_day_price | integer nullable | Prix demi-journée |
| status | text | `available`, `reserved`, `occupied`, `cleaning`, `maintenance`, `inactive` |
| amenities | jsonb | Équipements |
| photos | jsonb | Photos |
| notes | text | Notes |
| created_at | timestamptz | Date création |

## 13.9 `guests`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID client hébergé |
| establishment_id | uuid | Établissement |
| full_name | text | Nom complet |
| phone | text | Téléphone |
| email | text | Email |
| nationality | text | Nationalité |
| id_type | text | Type pièce |
| id_number | text | Numéro pièce |
| address | text | Adresse |
| notes | text | Notes |
| created_at | timestamptz | Date création |

## 13.10 `reservations`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID réservation |
| establishment_id | uuid | Établissement |
| guest_id | uuid | Client |
| room_id | uuid | Chambre |
| check_in_date | date | Arrivée |
| check_out_date | date | Départ |
| nights | integer | Nuits |
| adults | integer | Adultes |
| children | integer | Enfants |
| rate_amount | integer | Tarif appliqué |
| discount_amount | integer | Remise |
| total_amount | integer | Total |
| paid_amount | integer | Payé |
| balance_amount | integer | Solde |
| status | text | `pending`, `confirmed`, `checked_in`, `checked_out`, `cancelled`, `no_show` |
| source | text | direct, phone, whatsapp, agency, other |
| notes | text | Notes |
| created_by | uuid | Utilisateur |
| created_at | timestamptz | Date création |

## 13.11 `stay_payments`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID paiement séjour |
| establishment_id | uuid | Établissement |
| reservation_id | uuid | Réservation |
| amount | integer | Montant |
| method | text | cash, orange, mtn, moov, wave, card, transfer |
| reference | text | Référence |
| payment_date | timestamptz | Date paiement |
| received_by | uuid | Utilisateur |
| notes | text | Notes |

## 13.12 `invoices`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID facture/reçu |
| establishment_id | uuid | Établissement |
| reservation_id | uuid | Réservation |
| guest_id | uuid | Client |
| invoice_number | text | Numéro unique |
| type | text | `invoice`, `receipt` |
| amount | integer | Montant |
| status | text | `draft`, `issued`, `paid`, `cancelled` |
| pdf_url | text nullable | URL PDF |
| issued_at | timestamptz | Date émission |
| created_by | uuid | Utilisateur |

## 13.13 `expenses`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID dépense |
| establishment_id | uuid | Établissement |
| category | text | Catégorie |
| amount | integer | Montant |
| expense_date | date | Date |
| payment_method | text | Moyen paiement |
| description | text | Description |
| attachment_url | text nullable | Pièce jointe |
| created_by | uuid | Utilisateur |
| created_at | timestamptz | Date création |

## 13.14 `housekeeping_tasks`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID tâche |
| establishment_id | uuid | Établissement |
| room_id | uuid | Chambre |
| assigned_to | uuid nullable | Employé |
| status | text | `dirty`, `in_progress`, `clean`, `inspected` |
| notes | text | Notes |
| created_at | timestamptz | Date création |
| completed_at | timestamptz | Date fin |

## 13.15 `maintenance_tickets`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID ticket |
| establishment_id | uuid | Établissement |
| room_id | uuid nullable | Chambre |
| title | text | Titre |
| description | text | Description |
| priority | text | `low`, `normal`, `urgent` |
| status | text | `open`, `in_progress`, `resolved` |
| cost | integer | Coût |
| assigned_to | uuid nullable | Responsable |
| created_by | uuid | Créateur |
| resolved_at | timestamptz | Date résolution |

## 13.16 `activity_logs`

| Champ | Type | Description |
|---|---|---|
| id | uuid | ID log |
| establishment_id | uuid nullable | Établissement |
| user_id | uuid | Utilisateur |
| action | text | Action |
| entity_type | text | Type objet |
| entity_id | uuid nullable | ID objet |
| metadata | jsonb | Données complémentaires |
| created_at | timestamptz | Date |

---

# 14. Règles métier principales

## 14.1 Abonnement et activation

- un prospect peut être converti en client seulement après paiement validé ;
- un code d’activation doit être unique ;
- un code d’activation ne peut être utilisé qu’une seule fois ;
- un code expiré ne peut pas être utilisé ;
- l’abonnement démarre à l’activation ou à une date définie par le Super Admin ;
- la date de fin = date de début + durée du plan ;
- un compte expiré peut être limité, suspendu ou mis en lecture seule selon choix produit ;
- le Super Admin peut renouveler manuellement.

## 14.2 Réservations

- une chambre ne peut pas avoir deux réservations confirmées sur la même période ;
- une réservation annulée ne bloque plus la chambre ;
- une réservation `checked_out` ne peut plus être modifiée sauf par rôle autorisé ;
- le check-in passe la chambre en occupée ;
- le check-out passe la chambre en nettoyage ;
- les conflits de date doivent être vérifiés côté serveur.

## 14.3 Paiements séjour

- le solde = montant total - total paiements ;
- les paiements doivent garder une référence utilisateur ;
- un paiement supérieur au solde doit être bloqué ou demander confirmation Admin ;
- tous les paiements doivent apparaître dans l’historique.

## 14.4 Facturation

- chaque reçu/facture doit avoir un numéro unique par établissement ;
- un reçu est lié à un paiement ou une réservation ;
- une facture/reçu annulé doit rester dans l’historique ;
- les PDF doivent être stockés dans Supabase Storage si générés.

## 14.5 Permissions

- le Super Admin n’est pas rattaché à un établissement ;
- chaque Admin Hôtel est rattaché à un ou plusieurs établissements selon formule ;
- les utilisateurs secondaires sont rattachés à un établissement ;
- les utilisateurs secondaires n’ont accès qu’aux modules autorisés par leur rôle et leur formule.

---

# 15. Pages et routes recommandées

## 15.1 Pages publiques

- `/` : landing page ;
- `/tarifs` : tarifs ou section intégrée ;
- `/contact` : contact ;
- `/faq` : questions fréquentes ;
- `/mentions-legales` : mentions ;
- `/activation` : saisie du code ;
- `/register` : inscription après code valide ;
- `/login` : connexion.

## 15.2 Super Admin

- `/super-admin/dashboard` ;
- `/super-admin/leads` ;
- `/super-admin/leads/[id]` ;
- `/super-admin/clients` ;
- `/super-admin/clients/[id]` ;
- `/super-admin/payments` ;
- `/super-admin/activation-codes` ;
- `/super-admin/plans` ;
- `/super-admin/reports` ;
- `/super-admin/logs` ;
- `/super-admin/settings`.

## 15.3 Application établissement

- `/app/dashboard` ;
- `/app/rooms` ;
- `/app/room-types` ;
- `/app/calendar` ;
- `/app/reservations` ;
- `/app/reservations/new` ;
- `/app/check-in` ;
- `/app/check-out` ;
- `/app/guests` ;
- `/app/payments` ;
- `/app/invoices` ;
- `/app/expenses` ;
- `/app/housekeeping` ;
- `/app/maintenance` ;
- `/app/reports` ;
- `/app/users` ;
- `/app/settings`.

---

# 16. Critères d’acceptation MVP

Le MVP est considéré comme réussi si :

1. un prospect peut envoyer une demande depuis la landing page ;
2. la demande apparaît dans le dashboard Super Admin ;
3. le Super Admin peut changer le statut du prospect ;
4. le Super Admin peut enregistrer et valider un paiement SaaS ;
5. le Super Admin peut générer un code d’activation unique ;
6. le client peut activer son compte avec ce code ;
7. le système crée automatiquement l’établissement et l’Admin Hôtel ;
8. l’Admin Hôtel peut se connecter ;
9. l’Admin Hôtel peut créer des types de chambres ;
10. l’Admin Hôtel peut créer des chambres ;
11. l’Admin Hôtel peut créer une fiche client ;
12. l’Admin Hôtel ou réceptionniste peut créer une réservation ;
13. le système empêche les conflits de réservation ;
14. le check-in fonctionne ;
15. le check-out fonctionne ;
16. un paiement séjour peut être enregistré ;
17. un reçu ou une facture simple peut être généré/imprimé ;
18. le tableau de bord affiche les indicateurs essentiels ;
19. les données d’un établissement ne sont pas visibles par un autre ;
20. les rôles limitent les accès ;
21. les abonnements expirés sont visibles ;
22. l’application est utilisable sur mobile.

---

# 17. Roadmap recommandée

## Phase 1 — Fondations SaaS

- Initialisation projet Next.js/React ;
- intégration Supabase ;
- authentification ;
- tables principales ;
- RLS ;
- layout public et app ;
- landing page ;
- formulaire prospect.

## Phase 2 — Super Admin

- dashboard Super Admin ;
- gestion prospects ;
- gestion paiements SaaS ;
- génération codes ;
- gestion clients ;
- gestion plans ;
- exports CSV.

## Phase 3 — Onboarding client

- page activation ;
- validation code ;
- création établissement ;
- création compte Admin Hôtel ;
- redirection dashboard ;
- paramètres par défaut.

## Phase 4 — Gestion hôtelière MVP

- types de chambres ;
- chambres ;
- clients hébergés ;
- réservations ;
- calendrier ;
- check-in/check-out ;
- paiements séjour ;
- reçus/factures simples.

## Phase 5 — Finances et opérations

- dépenses ;
- rapports ;
- ménage ;
- maintenance ;
- gestion du personnel ;
- journal d’activité.

## Phase 6 — Optimisation et automatisation

- notifications email ;
- WhatsApp API ;
- paiement Mobile Money automatisé ;
- exports PDF avancés ;
- multi-établissement Premium ;
- réservation en ligne publique ;
- amélioration UX.

---

# 18. KPIs — indicateurs de succès

- nombre de visiteurs landing page ;
- nombre de prospects générés par mois ;
- taux de conversion prospect → client payant ;
- revenu mensuel encaissé ;
- revenu annuel encaissé ;
- répartition des clients par formule ;
- taux de renouvellement annuel ;
- nombre d’établissements actifs ;
- nombre moyen de réservations par établissement ;
- taux d’utilisation des modules ;
- nombre de tickets/support WhatsApp ;
- satisfaction client ;
- taux d’expiration non renouvelée.

---

# 19. Risques et mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Vente manuelle difficile à scaler | Temps important pour le Super Admin | Automatiser progressivement paiement et notifications. |
| Mauvaise séparation Super Admin/Admin Hôtel | Fuite de données ou confusion UX | Rôles stricts, routes séparées, RLS testée. |
| Exposition des clés Supabase | Risque critique de sécurité | Régénérer les clés exposées, variables d’environnement uniquement. |
| Utilisateurs peu technophiles | Faible adoption | Interface simple, onboarding guidé, vocabulaire clair. |
| Double réservation | Perte de confiance | Vérification serveur des conflits de dates. |
| Connexion mobile lente | Frustration utilisateur | Interface légère, chargements progressifs, optimisation. |
| Données financières incorrectes | Perte de crédibilité | Calculs centralisés, validations, tests. |
| Abonnement expiré non géré | Perte de revenus | Alertes expiration et statut visible. |

---

# 20. Recommandations de sécurité prioritaires

1. Régénérer toutes les clés et tokens déjà partagés avant production.
2. Ne jamais utiliser la clé `service_role` dans le frontend.
3. Activer RLS sur toutes les tables métier.
4. Tester les politiques RLS avec plusieurs comptes hôtels.
5. Séparer clairement les routes Super Admin et établissement.
6. Créer le Super Admin via script sécurisé ou Supabase dashboard.
7. Forcer le changement du mot de passe initial.
8. Protéger les fonctions serveur sensibles.
9. Ne jamais commiter `.env`, tokens ou mots de passe dans GitHub.
10. Mettre en place un journal d’activité pour les actions importantes.

---

# 21. Prompt maître amélioré pour GLM-5

```text
Tu es un expert senior en développement SaaS multi-tenant, React/Next.js, Supabase, PostgreSQL, Row Level Security, UX/UI et logiciels de gestion hôtelière.

Je veux créer une application SaaS appelée OGHOTEL pour la gestion des hôtels, résidences meublées, auberges et structures d’hébergement en Côte d’Ivoire.

Stack : Next.js ou React, Supabase pour Auth/PostgreSQL/Storage, GitHub, Vercel. Langue : français. Devise : FCFA. L’application doit être responsive, simple, professionnelle et utilisable par des personnes peu technophiles.

Le produit comprend :
1. Une landing page avec présentation du produit, tarifs, FAQ, contact et formulaire prospect.
2. Une interface Super Admin pour l’éditeur OGHOTEL, permettant de gérer prospects, clients, paiements SaaS, codes d’activation, abonnements, plans, revenus et exports.
3. Un processus d’activation par code après paiement Mobile Money manuel.
4. Une interface Admin Hôtel multi-tenant pour gérer chambres, types de chambres, calendrier, réservations, check-in/check-out, clients, paiements, factures/reçus, dépenses, ménage, maintenance, rapports, utilisateurs et paramètres.
5. Trois formules : ESSENTIEL 30 000 FCFA/an, PRIVILÈGE 50 000 FCFA/an, PREMIUM 75 000 FCFA/an, avec fonctionnalités configurables par formule.

Contraintes critiques :
- Ne jamais exposer la clé service_role dans le frontend.
- Utiliser les variables d’environnement.
- Activer RLS sur toutes les tables sensibles.
- Isoler toutes les données métier par establishment_id.
- Le Super Admin voit la plateforme globale, chaque hôtel ne voit que ses données.
- Les codes d’activation sont uniques, à usage unique, avec expiration.
- Vérifier les conflits de réservation côté serveur.
- L’interface doit être très simple pour un débutant.

Commence par générer :
1. l’architecture du projet ;
2. les routes ;
3. les composants principaux ;
4. le schéma SQL Supabase ;
5. les politiques RLS ;
6. les données seed des plans ;
7. le workflow d’activation ;
8. puis développe progressivement chaque module selon le PRD.
```

---

# 22. Prompts modulaires recommandés pour le vibe coding

## 22.1 Prompt Landing page

```text
Crée la landing page responsive de OGHOTEL en français. Elle doit présenter le SaaS de gestion d’hôtels et résidences en Côte d’Ivoire, avec hero section, bénéfices, fonctionnalités, tarifs, FAQ, contact WhatsApp, formulaire prospect connecté à Supabase et design moderne bleu foncé/doré/blanc. Le formulaire doit enregistrer dans la table leads.
```

## 22.2 Prompt Super Admin

```text
Crée le dashboard Super Admin de OGHOTEL avec authentification Supabase, accès réservé au rôle super_admin, statistiques globales, gestion des prospects, clients, paiements SaaS, codes d’activation, plans, exports CSV et journal d’activité. Ne jamais utiliser la clé service_role côté client.
```

## 22.3 Prompt Activation client

```text
Crée le workflow d’activation OGHOTEL : page de saisie du code, vérification du code dans Supabase, contrôle statut/expiration/usage unique, puis formulaire de création établissement et compte Admin Hôtel. À la validation, créer establishment, profile hotel_admin, abonnement actif et marquer le code comme used.
```

## 22.4 Prompt Gestion hôtelière

```text
Crée l’interface Admin Hôtel de OGHOTEL : dashboard, chambres, types de chambres, calendrier, clients, réservations, check-in/check-out, paiements, factures/reçus, dépenses, ménage, maintenance, rapports, utilisateurs et paramètres. Toutes les données doivent être filtrées par establishment_id avec RLS Supabase.
```

## 22.5 Prompt RLS Supabase

```text
Génère les politiques Row Level Security Supabase pour OGHOTEL. Toutes les tables métier doivent être isolées par establishment_id. Les utilisateurs hotel_admin et staff ne peuvent accéder qu’aux données de leur établissement. Le rôle super_admin peut accéder aux données globales nécessaires. Les actions critiques doivent être contrôlées par des fonctions serveur.
```

---

# 23. Annexe — Informations de configuration non sensibles

| Élément | Valeur |
|---|---|
| Nom du produit | OGHOTEL |
| Email Super Admin | ogouromain@gmail.com |
| WhatsApp Super Admin | +225 05 76 10 32 77 |
| URL Supabase | https://gnhwejyjjlugzyppbfze.supabase.co |
| Formule Essentiel | 30 000 FCFA/an |
| Formule Privilège | 50 000 FCFA/an |
| Formule Premium | 75 000 FCFA/an |

> Les clés API, la clé `service_role`, les tokens d’accès personnels et mots de passe ne doivent pas figurer dans ce document en version partagée ou versionnée.

---

# 24. Conclusion

OGHOTEL doit être conçu comme un SaaS local, professionnel et très simple à prendre en main. Le produit doit d’abord réussir trois choses :

1. convertir les prospects grâce à une landing page claire ;
2. permettre au Super Admin de gérer facilement les abonnements, paiements et activations ;
3. offrir aux hôtels et résidences un outil fiable pour gérer chambres, réservations, clients, paiements et rapports.

La priorité absolue du développement est la sécurité multi-tenant : aucun établissement ne doit pouvoir voir ou modifier les données d’un autre. La deuxième priorité est la simplicité d’usage. La troisième est la robustesse du flux commercial : prospect → paiement → code d’activation → compte client.

Ce PRD peut maintenant servir de base directe pour rédiger des prompts de développement destinés à GLM-5, module par module.
