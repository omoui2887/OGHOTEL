# OGHOTEL — Plan de Test Manuel

> Document de validation avant commercialisation.
> Chaque test doit être exécuté manuellement dans le navigateur.
> Cochez [ ] → [x] quand le test passe.

---

## 1. Landing Page & Formulaire Prospect

### 1.1 Affichage
- [ ] La page `/` s'affiche avec le design dark navy + orange
- [ ] Le header contient : logo "OG" orange, navigation, "Connexion", "Essai Gratuit"
- [ ] Le hero affiche "Gérez vos hôtels avec excellence" + boutons "Commencer Gratuitement" et "Voir la démo"
- [ ] Les sections suivantes sont présentes : Fonctionnalités, Produit, Résultats, Tarifs, FAQ, Contact
- [ ] Le footer contient les coordonnées WhatsApp et email

### 1.2 Formulaire prospect
- [ ] Le formulaire de contact affiche les champs : nom, email, téléphone, hôtel, type, formule
- [ ] La validation bloque les emails invalides
- [ ] La validation bloque les champs vides
- [ ] À la soumission valide, un message de succès s'affiche
- [ ] Le prospect apparaît dans `/super-admin/leads`

---

## 2. Authentification

### 2.1 Login
- [ ] Page `/login` s'affiche avec le design split-screen
- [ ] Login avec `ogouromain@gmail.com` / `Ogou1987` réussit
- [ ] Redirection vers `/change-password` si `must_change_password = true`
- [ ] Après changement de mot de passe, redirection vers `/super-admin/dashboard`
- [ ] Login avec mauvais mot de passe → erreur "Email ou mot de passe incorrect"
- [ ] Login avec email inexistant → même erreur (sécurité)

### 2.2 Logout
- [ ] Le bouton "Déconnexion" dans le topbar fonctionne
- [ ] Redirection vers `/login` après déconnexion

### 2.3 Redirection par rôle
- [ ] super_admin → `/super-admin/dashboard`
- [ ] hotel_admin → `/app/dashboard`
- [ ] Autres rôles hôteliers → `/app/dashboard`

---

## 3. Protection des Routes

### 3.1 Routes Super Admin
- [ ] Non connecté sur `/super-admin/dashboard` → redirect `/login`
- [ ] hotel_admin sur `/super-admin/dashboard` → redirect `/unauthorized`
- [ ] super_admin sur `/super-admin/dashboard` → accès OK

### 3.2 Routes App Hôtel
- [ ] Non connecté sur `/app/dashboard` → redirect `/login`
- [ ] super_admin sur `/app/dashboard` → redirect `/unauthorized`
- [ ] hotel_admin sur `/app/dashboard` → accès OK

### 3.3 Must change password
- [ ] Si `must_change_password = true`, redirection forcée vers `/change-password`
- [ ] Impossible d'accéder au dashboard sans changer le mot de passe

---

## 4. Prospects (Super Admin)

### 4.1 Liste
- [ ] `/super-admin/leads` affiche la liste paginée des prospects
- [ ] La recherche par nom/téléphone fonctionne
- [ ] Les filtres par statut/ville/formule fonctionnent
- [ ] Les badges de statut sont colorés correctement

### 4.2 Détail
- [ ] Clic sur un prospect → `/super-admin/leads/[id]`
- [ ] Les coordonnées du prospect s'affichent
- [ ] Le bouton WhatsApp ouvre wa.me avec message prérempli
- [ ] Le bouton "Appeler" ouvre tel:

### 4.3 Modification
- [ ] Changement de statut (new → contacted) fonctionne
- [ ] Ajout de notes internes fonctionne
- [ ] L'historique d'activité se met à jour

---

## 5. Paiements SaaS (Super Admin)

### 5.1 Enregistrement
- [ ] Bouton "Enregistrer un paiement" ouvre le dialog
- [ ] Sélection prospect + formule + montant + moyen de paiement
- [ ] Le montant s'auto-remplit depuis le prix du plan
- [ ] Création réussie → paiement en statut "pending"

### 5.2 Validation
- [ ] Bouton "Valider" sur un paiement pending → statut "validated"
- [ ] Bouton "Rejeter" sur un paiement pending → statut "rejected"

---

## 6. Codes d'Activation (Super Admin)

### 6.1 Génération
- [ ] Bouton "Générer code" apparaît uniquement sur paiements validés
- [ ] Le code généré est au format `OGH-2026-XXXXXX`
- [ ] Le code est unique
- [ ] Impossible de générer 2 codes pour le même paiement

### 6.2 Gestion
- [ ] Bouton "Copier" copie le code dans le presse-papier
- [ ] Bouton "Marqué envoyé" change le statut à "sent"
- [ ] Bouton "Annuler" change le statut à "cancelled"
- [ ] Les codes sont filtrables par statut

---

## 7. Activation Client

### 7.1 Vérification du code
- [ ] Page `/activation` permet de saisir un code
- [ ] Code valide → redirection vers `/register`
- [ ] Code invalide → message "Code d'activation introuvable"
- [ ] Code déjà utilisé → message "Ce code a déjà été utilisé"
- [ ] Code expiré → message "Ce code a expiré"

### 7.2 Inscription
- [ ] Page `/register` affiche le code vérifié + la formule
- [ ] Formulaire : nom gérant, nom établissement, type, ville, adresse, téléphone, email, mot de passe
- [ ] Validation du mot de passe (8+ caractères, majuscule, minuscule, chiffre)
- [ ] À la validation : création user Auth + établissement + profil hotel_admin
- [ ] Le code passe à "used"
- [ ] Redirection vers `/login`

---

## 8. Isolation Multi-Tenant

### 8.1 Données chambres
- [ ] L'hôtel A ne voit pas les chambres de l'hôtel B
- [ ] L'API `/api/hotel/rooms` filtre par establishment_id

### 8.2 Données réservations
- [ ] L'hôtel A ne voit pas les réservations de l'hôtel B
- [ ] L'API `/api/hotel/reservations` filtre par establishment_id

### 8.3 Données clients
- [ ] L'hôtel A ne voit pas les clients de l'hôtel B
- [ ] L'API `/api/hotel/guests` filtre par establishment_id

### 8.4 Dashboard
- [ ] Les statistiques du dashboard ne concernent que l'établissement connecté

---

## 9. Chambres

### 9.1 Types de chambres
- [ ] `/app/room-types` affiche les types existants
- [ ] Création d'un nouveau type (nom, prix, capacité) fonctionne
- [ ] Modification d'un type fonctionne
- [ ] Désactivation d'un type fonctionne
- [ ] Suppression bloquée si des chambres utilisent le type

### 9.2 Chambres
- [ ] `/app/rooms` affiche les chambres en cartes
- [ ] Création d'une chambre (numéro, type, étage, prix, équipements) fonctionne
- [ ] Modification d'une chambre fonctionne
- [ ] Changement rapide de statut via dropdown
- [ ] Impossible de créer 2 chambres avec le même numéro
- [ ] Suppression bloquée si réservations actives

---

## 10. Réservations

### 10.1 Création
- [ ] `/app/reservations/new` affiche le formulaire
- [ ] Sélection/création rapide d'un client fonctionne
- [ ] Sélection d'une chambre disponible
- [ ] Le tarif s'auto-remplit depuis le type de chambre
- [ ] Calcul automatique : nuits, total, acompte, solde
- [ ] Vérification de disponibilité en temps réel (debounce)
- [ ] Si conflit → message "Chambre non disponible"
- [ ] Création réussie → redirection vers `/app/reservations`

### 10.2 Conflit de dates
- [ ] Réservation chambre 101 du 10 au 12 → OK
- [ ] Réservation chambre 101 du 11 au 13 → BLOQUÉ (chevauchement)
- [ ] Réservation chambre 101 du 12 au 14 → OK (départ = arrivée)
- [ ] Réservation chambre 102 du 10 au 12 → OK (autre chambre)
- [ ] Après annulation, la chambre redevient réservable

### 10.3 Modification & Annulation
- [ ] Modification d'une réservation fonctionne
- [ ] Annulation libère la chambre
- [ ] Une réservation annulée ne bloque plus la chambre

---

## 11. Check-in / Check-out

### 11.1 Check-in
- [ ] `/app/check-in` affiche les arrivées confirmées (7 prochains jours)
- [ ] Bouton "Check-in" ouvre le dialog
- [ ] Paiement à l'arrivée (optionnel) fonctionne
- [ ] Après check-in : réservation → checked_in, chambre → occupied

### 11.2 Check-out
- [ ] `/app/check-out` affiche les séjours en cours
- [ ] Bouton "Check-out" ouvre le dialog
- [ ] Frais supplémentaires (mini-bar) peuvent être ajoutés
- [ ] Paiement du solde fonctionne
- [ ] Forcer check-out avec solde impayé (hotel_admin/manager uniquement)
- [ ] Après check-out : réservation → checked_out, chambre → cleaning
- [ ] Une tâche de ménage est créée automatiquement
- [ ] Une facture est générée automatiquement

---

## 12. Paiements Séjour

### 12.1 Encaissement
- [ ] `/app/payments` affiche l'historique des paiements
- [ ] Bouton "Encaisser" ouvre le dialog
- [ ] Sélection réservation + montant + moyen de paiement
- [ ] Le solde de la réservation est mis à jour automatiquement
- [ ] Filtre par moyen de paiement fonctionne

### 12.2 Solde
- [ ] Le solde = total - payé
- [ ] Si solde = 0 → badge "Payé"
- [ ] Si solde > 0 → montant en rouge

---

## 13. Reçus & Factures

### 13.1 Génération
- [ ] `/app/invoices` affiche la liste des factures et reçus
- [ ] Bouton "Générer" permet de choisir facture ou reçu
- [ ] Numéro unique au format FAC/REC-2026-XXXXXX
- [ ] Impossible de générer 2 factures pour la même réservation

### 13.2 Impression
- [ ] Page `/app/invoices/[id]` affiche le document
- [ ] Le document contient : logo, nom établissement, client, chambre, dates, montants, paiements
- [ ] Bouton "Imprimer" ouvre la boîte de dialogue d'impression
- [ ] "Enregistrer en PDF" produit un PDF propre

### 13.3 Annulation
- [ ] Bouton "Annuler" (hotel_admin/manager) fonctionne
- [ ] La facture annulée reste dans l'historique avec filigrane "ANNULÉE"

---

## 14. Dépenses

### 14.1 CRUD
- [ ] `/app/expenses` affiche la liste avec total
- [ ] Création d'une dépense (catégorie, montant, date, moyen, description)
- [ ] Modification d'une dépense
- [ ] Suppression (hotel_admin uniquement)
- [ ] Filtre par catégorie et date

### 14.2 Export
- [ ] Bouton "CSV" exporte les dépenses filtrées
- [ ] Le fichier s'ouvre correctement dans Excel (BOM)

---

## 15. Permissions Utilisateurs

### 15.1 Création
- [ ] `/app/users` accessible uniquement par hotel_admin
- [ ] Création d'un réceptionniste (email, mot de passe, rôle)
- [ ] Limite du plan respectée (Essentiel = 1, Privilège = 3, Premium = illimité)
- [ ] Blocage si limite atteinte

### 15.2 Restrictions par rôle
- [ ] Réceptionniste : voit réservations, clients, check-in/out, paiements
- [ ] Réceptionniste : ne voit pas dépenses, ménage, maintenance, rapports, personnel
- [ ] Comptable : voit paiements, dépenses, rapports
- [ ] Ménage : voit uniquement ménage
- [ ] Maintenance : voit uniquement maintenance
- [ ] Manager : voit tout sauf personnel et paramètres

### 15.3 Gestion
- [ ] Modification du rôle d'un utilisateur
- [ ] Activation/désactivation d'un compte
- [ ] Réinitialisation de mot de passe
- [ ] Impossible de modifier son propre rôle
- [ ] Impossible de supprimer son propre compte

---

## 16. Rapports

### 16.1 Affichage
- [ ] `/app/reports` accessible par hotel_admin, manager, accountant
- [ ] Cartes statistiques affichent : occupation, recettes, dépenses, résultat net
- [ ] Graphiques s'affichent (revenus, dépenses, réservations)
- [ ] Top chambres et top clients s'affichent

### 16.2 Filtres & Export
- [ ] Filtre par période (aujourd'hui, 7j, mois, trimestre, année)
- [ ] Export CSV du rapport complet
- [ ] Les données sont filtrées par establishment_id

---

## 17. Notifications

### 17.1 Super Admin
- [ ] La cloche dans le topbar affiche un badge si notifications
- [ ] Nouveaux prospects → notification "Nouveaux prospects"
- [ ] Paiements en attente → notification "Paiements en attente"
- [ ] Abonnements expirant → notification "Abonnements expirant bientôt"

### 17.2 Admin Hôtel
- [ ] Arrivées du jour → notification
- [ ] Départs du jour → notification
- [ ] Chambres à nettoyer → notification
- [ ] Maintenance urgente → notification
- [ ] Paiements impayés → notification
- [ ] Abonnement expirant → notification

---

## 18. Journal d'Activité

- [ ] `/super-admin/logs` affiche l'historique des actions
- [ ] Filtre par action fonctionne
- [ ] Filtre par date fonctionne
- [ ] Chaque entrée affiche : action, utilisateur, établissement, métadonnées, date
- [ ] Aucun mot de passe ou secret dans les logs

---

## 19. Calendrier

- [ ] `/app/calendar` s'affiche en vue semaine par défaut
- [ ] Navigation précédent / aujourd'hui / suivant fonctionne
- [ ] Vue jour : liste des chambres avec réservations
- [ ] Vue semaine : tableau chambres × 7 jours
- [ ] Vue mois : calendrier classique
- [ ] Vue planning : Gantt par chambre
- [ ] Clic sur une réservation → page détail
- [ ] Filtre par type de chambre
- [ ] Arrivées/départs du jour affichés

---

## 20. Paramètres

- [ ] `/app/settings` affiche les infos établissement
- [ ] Modification du nom, type, adresse, téléphone, email
- [ ] Ajout d'un logo (URL)
- [ ] Section abonnement : formule, prix, date d'expiration, jours restants
- [ ] Bouton "Contacter OGHOTEL" ouvre WhatsApp avec message prérempli

---

## 21. Exports

### 21.1 Super Admin
- [ ] Export prospects CSV
- [ ] Export clients CSV
- [ ] Export paiements SaaS CSV
- [ ] Export revenus par période CSV

### 21.2 Admin Hôtel
- [ ] Export réservations CSV
- [ ] Export paiements CSV
- [ ] Export dépenses CSV
- [ ] Export rapport complet CSV
- [ ] Facture PDF via impression navigateur

---

## Bugs connus et corrections

### Bugs corrigés lors de l'audit
1. ✅ `supabase/server.ts` : `createSupabaseAdminClient` utilisait `createServerClient` (SSR) au lieu de `createClient` (supabase-js) → corrigé
2. ✅ `auth.ts` : `getCurrentProfile` utilisait le client standard (RLS bloquait) → corrigé avec client admin
3. ✅ `api/leads/route.ts` : utilisait le client standard + noms de colonnes incorrects (`hotel_name` au lieu de `business_name`, `desired_plan` au lieu de `desired_plan_id`) → corrigé
4. ✅ `.env.local` manquant → recréé
5. ✅ Hydration mismatch sur SiteHeader → corrigé avec pattern `mounted`

### Points d'attention
- ⚠️ Les politiques RLS (migration 003) doivent être exécutées dans Supabase pour la sécurité en production
- ⚠️ Le mot de passe Super Admin `Ogou1987` doit être changé après la première connexion
- ⚠️ Les clés Supabase partagées dans le chat doivent être régénérées avant production
