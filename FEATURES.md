# Cabs — Inventaire des fonctionnalités du site vitrine et de l'écosystème

> Source de vérité pour ce qu'on a décidé jusqu'ici. Couvre le **site vitrine** (ce repo) et référence les autres surfaces (plateforme admin, app chauffeur, backend) pour ne rien perdre de vue.
>
> **Dernière mise à jour** : avril 2026
> **Repo** : `n4wf3l/Landing-Cabs`
> **Stack** : React 19 · TypeScript 6 · Vite 8 · Tailwind 3.4 · shadcn/ui · Framer Motion 12

---

## 📑 Sommaire

1. [Contexte produit](#1-contexte-produit)
2. [Architecture des surfaces](#2-architecture-des-surfaces)
3. [Site vitrine — fonctionnalités](#3-site-vitrine--fonctionnalités-implémentées)
4. [Plateforme admin — référencement](#4-plateforme-admin--référence)
5. [App mobile chauffeur — référencement](#5-app-mobile-chauffeur--planifiée)
6. [Backend — référencement](#6-backend--spring-boot-séparé)
7. [Décisions design assumées](#7-décisions-design-assumées)
8. [Conventions de code](#8-conventions-de-code-et-rédaction)
9. [Backlog et améliorations identifiées](#9-backlog-et-améliorations-identifiées)
10. [Légende](#-légende)

---

## 1. Contexte produit

| Champ | Valeur |
|---|---|
| **Nom** | Cabs |
| **Tagline** | La plateforme que les opérateurs de taxi méritent. |
| **Cible** | Compagnies de taxi européennes (PME, basées Bruxelles à l'origine) |
| **Cœur de valeur** | Consolidation Uber / Bolt / Heetch / TaxiVert / cash + calcul des commissions + planning + tracking + app chauffeur |
| **Positionnement** | Bêta privée à Bruxelles · Sortie publique septembre 2026 |
| **Co-fondateurs** | Kristian Vasiaj, Ismael Bouzrouti, Nawfel Ajari (développeurs web) |
| **Société** | En cours d'incorporation en Belgique (BCE / siège publiés à la sortie) |
| **Contact** | hello@cabs.brussels |

---

## 2. Architecture des surfaces

```
┌─────────────────────────────────────────────────┐
│               ÉCOSYSTÈME CABS                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. Site vitrine (ce repo) ✅                    │
│     → Acquisition, waitlist, positionnement      │
│                                                  │
│  2. Plateforme admin (taxi-time) 🚧              │
│     → Dashboard opérateur, gestion flotte        │
│                                                  │
│  3. App mobile chauffeur 📋                      │
│     → iOS + Android, shifts, revenus, planning   │
│                                                  │
│  4. Backend Spring Boot (taxi-time-backend) 🚧   │
│     → API REST, JWT, persistence                 │
│                                                  │
└─────────────────────────────────────────────────┘
```

| Surface | Repo | Public | État |
|---|---|---|---|
| Site vitrine | [`n4wf3l/Landing-Cabs`](https://github.com/n4wf3l/Landing-Cabs) | Visiteurs / prospects | ✅ Live |
| Plateforme admin | [`taxi-time`](https://github.com/...) | Administrateurs / dispatchers | 🚧 80-85% UI, 40-50% backend |
| App mobile chauffeur | TBD | Chauffeurs | 📋 Planifiée |
| Backend | [`kvsj123/taxi-time-backend`](https://github.com/kvsj123/taxi-time-backend) | Toutes surfaces | 🚧 En cours |

---

## 3. Site vitrine — fonctionnalités implémentées

### 3.1 Splash screen

Premier écran à la **première visite uniquement** ([src/components/common/SplashScreen.tsx](src/components/common/SplashScreen.tsx)).

| Fonctionnalité | Détail | État |
|---|---|---|
| Détection première visite | localStorage `cabs-splash-seen`. `?splash=1` force l'affichage pour test | ✅ |
| Sélection de la langue | 4 cartes (FR / EN / NL / DE), nom natif + code ISO, hover lift, sheen oblique | ✅ |
| Sélection du thème | Toggle Sun/Moon avec pill primary qui slide via `layoutId` (Framer spring) | ✅ |
| Mesh gradient animé | 3 blobs bleus qui dérivent (18s, 22s, 25s, ease linear) | ✅ |
| Mouse spotlight | `radial-gradient` qui suit la souris via `useMotionTemplate` + `useSpring` | ✅ |
| Wordmark CABS | 4 lettres avec `rotateX -95° → 0°` spring physique, transformOrigin bottom | ✅ |
| Tagline cyclante | FR → EN → NL → DE toutes les 1800ms avec `filter: blur` transition | ✅ |
| SVG path "route" | Path Bézier en pointillés bleus qui se dessine via `pathLength` 0→1 | ✅ |
| Skip button | Top-right, `aria-label="Skip"`, `Escape` ferme aussi | ✅ |
| Logo `layoutId` morph | Le logo du splash transite vers la position du Navbar Logo à l'exit | ✅ |
| `prefers-reduced-motion` | Désactive spotlight, mesh, cycle, rotateX, taxi, animations | ✅ |
| Body scroll lock | `overflow: hidden` sur `<body>` pendant l'affichage | ✅ |
| Timeline totale | ~1.5s avant interactivité (resserré depuis 2.8s initiaux) | ✅ |

### 3.2 Navigation et layout

| Composant | Localisation | Détail |
|---|---|---|
| `Navbar` | [src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx) | Sticky, blur on scroll, ancres `#product` / `#team`, lien `/contact`, CTA "Être prévenu" qui scroll vers `#notify`. Cache vers le bas de page (`useNearBottom`) pour libérer l'écran |
| `Footer` | [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx) | 4 colonnes (Marque · Produit · Équipe · Légal), badge statut bêta, IG/LinkedIn, mention pré-incorporation |
| `SideNav` | [src/components/layout/SideNav.tsx](src/components/layout/SideNav.tsx) | Navigation flottante desktop apparaissant en bas de page |
| `RootLayout` | [src/components/layout/RootLayout.tsx](src/components/layout/RootLayout.tsx) | `Outlet` + Navbar/Footer/SideNav/SkipLink/CustomCursor/ScrollToTopButton + `AnimatePresence` route transitions |
| `LanguageSwitcher` | [src/components/layout/LanguageSwitcher.tsx](src/components/layout/LanguageSwitcher.tsx) | Modale plein écran avec 4 cartes langue, toast de confirmation à la sélection |
| `ThemeToggle` | [src/components/layout/ThemeToggle.tsx](src/components/layout/ThemeToggle.tsx) | Bouton Sun/Moon avec rotation au switch |

### 3.3 Page d'accueil — 3 chapitres

[src/pages/Landing.tsx](src/pages/Landing.tsx)

#### Hero ([src/components/sections/Hero.tsx](src/components/sections/Hero.tsx))

| Élément | Contenu |
|---|---|
| Eyebrow | `Bêta privée · Bruxelles · Sortie septembre 2026` |
| H1 | « Vos chauffeurs, vos véhicules, vos revenus. Un seul outil. » (10 mots, 2 lignes) |
| Subtitle | « Planning, tracking, réconciliation, exports comptables. Sans tableur. » (8 mots, 1 ligne) |
| CTA principal | `NotifyMeForm` (email + bouton "Être prévenu") |
| Visuel | `ProductTicker` (à droite sur desktop, sous le texte sur mobile) |
| Scroll hint | Flèche bouncing `↓ Voir le produit` qui scrolle vers `#product` |
| Layout | Grid `1.2fr_1fr` desktop, stacked centré sur mobile |
| Animations | `useReducedMotion` respecté, spring + ease custom Apple `[0.22, 1, 0.36, 1]` |

#### `ProductTicker` ([src/components/common/ProductTicker.tsx](src/components/common/ProductTicker.tsx))

Carte premium qui cycle entre **6 snapshots** toutes les 5.5s :

| # | Snapshot | Icône | Contenu |
|---|---|---|---|
| 1 | **Revenus** | Wallet | Brut Uber `1 247 €` · Commission 23% `−287 €` · Net réel `960 €` (mis en avant) |
| 2 | **Planning** | CalendarDays | Mini-grille 7 jours × 2 shifts (Jour/Nuit), cellules colorées en stagger, summary "11 assignés · 0 conflit" |
| 3 | **Flotte** | CarFront | 12 véhicules · ● 8 en service · ● 2 maintenance · ● 1 réparation · ● 1 archivé |
| 4 | **Carte temps réel** | MapPin | Mini-map stylisée Bruxelles (110px), 9 dots animés (drift + ping), 5 dispo / 4 en course, badge "Live" |
| 5 | **Équipe** | Users | 24 chauffeurs · ● 19 actifs · ● 3 congé · ● 1 maladie · ● 1 suspendu |
| 6 | **App chauffeur** | Smartphone | Sofia R. live (pulse vert), 23 courses · 312 € · +18% vs hier |

Header : icône + label + 6 barres de pagination (la barre active s'étire à `w-6`).
Cross-fade entre snapshots via `AnimatePresence mode="wait"` avec `y: 8 → 0` (250ms exit, 350ms enter).
Stagger spring 150ms entre les rows de chaque snapshot. `tabular-nums` partout. Format `Intl.NumberFormat('fr-BE', currency: 'EUR')`.

#### `ProductShowcase` ([src/components/sections/ProductShowcase.tsx](src/components/sections/ProductShowcase.tsx))

3 onglets cliquables avec 3 captures écran de la plateforme admin réelle :
- **Dashboard** (`/screenshot-dashboard.png`)
- **Véhicules** (`/screenshot-vehicles.png`)
- **Chauffeurs** (`/screenshot-drivers.png`)

Chrome de navigateur synthétique (3 cercles + URL `app.cabs.brussels`).

#### `Features` ([src/components/sections/Features.tsx](src/components/sections/Features.tsx))

6 cards (3 cols × 2 rows) :

| Clé | Icône | Promesse |
|---|---|---|
| `aggregation` | Layers | Agrégation Uber / Bolt / Heetch / TaxiVert / cash, source unique mise à jour quotidiennement |
| `commissions` | Calculator | Anticipation des commissions plateforme par plateforme, brut et net par chauffeur / véhicule / période |
| `time` | Wallet | Fin des calculs manuels Excel et fichiers WhatsApp |
| `structure` | Sliders | Modèles 50/50, forfait, location configurables |
| `drivers` | UserCog | Profils, disponibilités, documents, formules |
| `exports` | FileSpreadsheet | PDF + Excel prêts pour le comptable, détail par plateforme et par chauffeur |

#### `DriverApp` ([src/components/sections/DriverApp.tsx](src/components/sections/DriverApp.tsx))

Section dédiée avec layout split (texte gauche, mockup phone droit) :

- **4 bullets** : démarrer shift, planning hebdo, revenus live, alertes opérateur
- **3 badges plateformes** : iOS 16+, Android 10+, mode hors-ligne
- **Phone frame** : encadrement smartphone réaliste (260×520px) avec contenu mock — Sofia R. en shift jour, 312 € net, 23 courses, prochaine mission 14:00, véhicule Clio FB-123-CD, bouton "Démarrer le shift" primary

#### `Team` ([src/components/sections/Team.tsx](src/components/sections/Team.tsx))

3 cards fondateurs (mêmes hauteurs, hover lift) :

| Initiales | Nom | Rôle |
|---|---|---|
| KV | Kristian Vasiaj | Co-fondateur · Développement |
| IB | Ismael Bouzrouti | Co-fondateur · Développement |
| NA | Nawfel Ajari | Co-fondateur · Développement |

Avatar à gradient brand (initiales blanches sur dégradé bleu). Liens **Instagram** + **LinkedIn** par fondateur (URLs placeholder dans [src/lib/constants.ts](src/lib/constants.ts) `FOUNDERS`).

#### `FinalCTA` ([src/components/sections/FinalCTA.tsx](src/components/sections/FinalCTA.tsx))

Section `id="notify"`. Glow primary, carte centrée avec H2 + sous-titre + `NotifyMeForm` taille `lg`. C'est la cible de tous les CTA "Être prévenu" du site.

### 3.4 Pages secondaires

| Route | Composant | Contenu |
|---|---|---|
| `/contact` | [src/pages/Contact.tsx](src/pages/Contact.tsx) | Formulaire (nom, email, société optionnel, message), Zod validation, mailto fallback, success state |
| `/legal/terms` | [src/pages/LegalTerms.tsx](src/pages/LegalTerms.tsx) | CGU belges, mention pré-incorporation, droit belge, tribunaux Bruxelles, sections (objet, waitlist, contact, responsabilité, droit applicable) |
| `/legal/privacy` | [src/pages/LegalPrivacy.tsx](src/pages/LegalPrivacy.tsx) | RGPD + loi belge 30 juillet 2018, responsables nominatifs, finalités, base légale (6.1.a + 6.1.f), rétention, droits + APD belge, hébergement EU, pas de cookies tiers |
| `/404` | [src/pages/NotFound.tsx](src/pages/NotFound.tsx) | Page d'erreur avec CTA retour accueil |

Routes redirigées (préservation des liens partagés) : `/pricing` → `/`, `/features` → `/#features`, `/about` → `/#team`, `/signup` → `/`, `/login` → `/`.

### 3.5 Système de waitlist

[src/components/common/NotifyMeForm.tsx](src/components/common/NotifyMeForm.tsx) — composant unique réutilisé sur Hero + FinalCTA.

| Élément | Détail |
|---|---|
| Champ | Email avec icône Mail, validation regex côté client |
| CTA | Bouton "Être prévenu" avec icône `BellRing` |
| États | `idle` / `loading` (Loader2 spin) / `success` (carte verte CheckCircle2) |
| Endpoint | `POST /api/public/notify` (mocked actuellement) |
| Toast | Sonner success ou "déjà inscrit" |
| Privacy note | « Un seul email : celui de la sortie. Pas de spam, pas de partage. » |
| Analytics | `track('waitlist_signup', { email, alreadySubscribed })` |

### 3.6 Système de couleurs et thème

| Token | Valeur dark | Valeur light |
|---|---|---|
| `--background` | `240 10% 3.9%` (zinc-950) | `0 0% 100%` |
| `--foreground` | `0 0% 98%` | `240 10% 3.9%` |
| `--primary` | `217 91% 60%` (blue-500 `#3b82f6`) | `221 83% 53%` (blue-600 `#2563eb`) |
| `--primary-foreground` | white | white |
| Gradient brand | `linear-gradient(135deg, #60a5fa, #2563eb)` | idem |
| Shadow glow | `rgba(59,130,246,0.45)` | idem |

- **Dark mode par défaut** ([src/hooks/useTheme.ts](src/hooks/useTheme.ts)) via `useSyncExternalStore` (un store global réactif à travers tous les hooks)
- Persistance localStorage `cabs-theme`
- Sync inter-onglets via `storage` event

### 3.7 i18n

[src/i18n.ts](src/i18n.ts) — i18next + `i18next-browser-languagedetector` + `react-i18next`.

| Langue | Statut | Fichier |
|---|---|---|
| 🇫🇷 Français | Canonique, traduction native | [src/locales/fr.json](src/locales/fr.json) |
| 🇬🇧 English | Traduit | [src/locales/en.json](src/locales/en.json) |
| 🇳🇱 Nederlands | Traduit | [src/locales/nl.json](src/locales/nl.json) |
| 🇩🇪 Deutsch | Traduit | [src/locales/de.json](src/locales/de.json) |

Détection : `localStorage` → `navigator` → `htmlTag`, fallback FR. Cache key `cabs-lang`. `<html lang>` mis à jour via `i18n.on('languageChanged')`.

### 3.8 SEO et performances

| Mécanisme | Implémentation |
|---|---|
| Helmet | [src/components/common/SEO.tsx](src/components/common/SEO.tsx) avec template `%s · Cabs` |
| JSON-LD | `Organization` + `SoftwareApplication` injectés sur `/` ([src/lib/seo.ts](src/lib/seo.ts)) |
| `robots.txt` | [public/robots.txt](public/robots.txt) |
| `sitemap.xml` | [public/sitemap.xml](public/sitemap.xml) avec `hreflang × 4` |
| Code splitting | `React.lazy` par route + `Suspense` avec skeleton |
| Bundles | Manual chunks Rollup : `framer` (134 KB) · `radix` (39 KB) · `analytics` (40 KB) |
| Fonts | `@fontsource/inter` (variants 400-800) en CSS-imported |

### 3.9 A11y

- `<SkipLink />` premier focus, ciblant `#main`
- Global `*:focus-visible { ring-2 ring-ring ring-offset-2 }`
- Respect `prefers-reduced-motion` partout
- `aria-label` sur tous les boutons icon-only
- `role="dialog"` + `aria-modal` sur les overlays (splash, language modal)
- Landmarks : `<header>`, `<main id="main">`, `<footer>`
- Contraste : WCAG AA respecté (text body ≥ 4.5:1, headings ≥ 3:1)

### 3.10 Couche API et mocks

[src/lib/api.ts](src/lib/api.ts) — Axios avec interceptor automatique sur `/api/public/*` quand `VITE_USE_MOCK_API=true` (par défaut). Délai simulé 600-1200ms. Failure rate configurable via `VITE_MOCK_FAILURE_RATE`.

| Endpoint | Mock | Réel |
|---|---|---|
| `POST /api/public/notify` | ✅ retourne `{ ok, receivedAt, alreadySubscribed? }` | 🚧 backend à brancher |
| `POST /api/public/contact` | ✅ retourne `{ ok, receivedAt }` | 🚧 backend à brancher |

### 3.11 Composants utilitaires

| Composant | Rôle |
|---|---|
| `AnimatedGridBackground` | Grille SVG masquée par radial gradient, fond subtil de section |
| `GlowEffect` | Halos primary/mixed (1 ou 3 blobs blur) |
| `SectionHeading` | Eyebrow + H2 + subtitle réutilisable, scroll reveal Framer |
| `ScrollReveal` | Wrapper `whileInView` avec variants `staggerContainer`/`staggerItem` |
| `CustomCursor` | Spot bleu qui suit le curseur sur desktop (désactivé sur reduced-motion) |
| `ScrollToTopButton` | Bouton flottant qui apparaît après scroll |
| `Logo` | Theme-aware, tlogo_white/tlogo_black, prop `layoutId` pour morph splash → navbar |
| `SocialIcons` | SVG Instagram + LinkedIn |
| `SkipLink` | Lien d'accessibilité a11y |

---

## 4. Plateforme admin — référence

> Repo séparé. Détaillé dans la doc d'inventaire fournie. Résumé ici pour tracer ce que le site vitrine doit refléter.

| Module | Route | État | Backend |
|---|---|---|---|
| Authentification | `/login` | ✅ UI | 🚧 Faux JWT en dev |
| Dashboard | `/dashboard` | ✅ Complet | ✅ Branché (shifts) |
| Véhicules | `/vehicles` | ✅ CRUD complet | ✅ Branché |
| Chauffeurs | `/drivers` + `/add-driver` | ✅ Complet (multi-step création) | ✅ Branché |
| Shifts | `/shifts` | ✅ Complet (3 onglets) | ✅ Branché |
| Planning | `/planning` | ✅ Très avancé (drag-drop, exports) | ✅ Branché |
| Carte | `/map` | ✅ Mapbox | 🟡 Données simulées |
| Cash Report | `/cash-report` | ✅ UI | ❌ Mockées |
| Alert Messages | `/alert-message` | ✅ UI | ❌ Pas de persistance |
| Historique shifts | `/history-shifts` | ✅ UI | ❌ Mockées |
| Settings | `/settings` | ✅ UI | ❌ Mockées |
| Documentation | `/documentation` | 🟡 Squelette | — |

**Stack** : React 18 + TS 5.5 + Vite 5.4 + SWC + Tailwind 3.4 + shadcn + Framer Motion + Mapbox + Recharts + jsPDF + XLSX + Sonner + i18next.

---

## 5. App mobile chauffeur — planifiée

> Statut : 📋 mentionnée dans le hero du site vitrine (snapshot ticker + section dédiée), à développer.

### Périmètre fonctionnel décidé

| # | Fonctionnalité | Priorité | Surface |
|---|---|---|---|
| 1 | Login chauffeur (email + mot de passe) | P0 | Auth |
| 2 | Démarrer / arrêter un shift en un tap | P0 | Shift |
| 3 | Voir le planning hebdomadaire (jours, véhicules, shifts à venir) | P0 | Planning |
| 4 | Voir les revenus du jour : brut, net après commissions, comparaison vs hier | P0 | Revenus |
| 5 | Compteur de courses du jour | P0 | Courses |
| 6 | Recevoir les alertes / messages de l'opérateur (push) | P0 | Notifications |
| 7 | Recevoir les emails (planning, paie, événements) | P1 | Communication |
| 8 | Faire / enregistrer une course manuelle (pour le cash) | P1 | Courses |
| 9 | Demander un congé / signaler une maladie | P1 | Workflow |
| 10 | Consulter ses documents (contrat, paies, historique) | P1 | Documents |
| 11 | Mode hors-ligne (cache local + sync à la reconnexion) | P1 | Reliability |
| 12 | Géolocalisation pour le tracking temps réel | P2 | Tracking |
| 13 | Notifications push (Firebase Cloud Messaging) | P0 | Comms |

### Stack envisagée (à confirmer)

- **React Native + Expo** (cohérent avec le frontend web)
- **Supabase ou backend Spring Boot** pour l'auth et les données
- **FCM** pour les push
- **MMKV** ou **WatermelonDB** pour le mode offline
- **Mapbox SDK mobile** ou Google Maps SDK pour le tracking

### Visibilité sur le site vitrine

- ✅ Snapshot **App chauffeur** dans le `ProductTicker` du hero (5e position dans le cycle)
- ✅ Section dédiée **Côté chauffeur** entre Features et Team avec phone frame mockup
- ✅ Mention **iOS 16+ · Android 10+ · Mode hors-ligne** dans la section
- ✅ Fonctionnalité dans la liste Features admin (`drivers` card mentionne profils + formules + documents)

---

## 6. Backend — Spring Boot séparé

> Repo : [`kvsj123/taxi-time-backend`](https://github.com/kvsj123/taxi-time-backend)

### Endpoints actuellement consommés par la plateforme admin

| Module | Endpoints |
|---|---|
| Drivers | `/get-drivers`, `/get-driver/{id}`, `/create-driver`, `/edit-driver/{id}`, `/delete-driver/{id}`, `/archive-driver/{id}`, `/unarchive-driver/{id}`, `/get-archived-drivers`, `/total-drivers-count`, `/total-drivers-by-availability-status` |
| Vehicles | `/get-vehicles`, `/get-vehicle/{id}`, `/create-vehicle`, `/edit-vehicle/{id}`, `/delete-vehicle/{id}`, `/archive-vehicle/{id}`, `/unarchive-vehicle/{id}`, `/get-archived-vehicles` |
| Shifts | `/get-shift/{id}`, `/get-shifts-for-week`, `/get-shifts-today-and-tomorrow`, `/get-shifts?category=`, `/create-shift`, `/edit-shift/{id}`, `/delete-shift/{id}` |
| Shift assignments | `/get-shift-assignments`, `/get-shift-assignment/{id}`, `/assign-driver`, `/edit-shift-assignment/{id}`, `/delete-shift-assignment/{id}` |
| Media | `/get-media/{id}`, `/get-medias/all`, `/upload-media`, `/delete-media/{id}` |

### Endpoints attendus par le site vitrine

| Endpoint | Rôle | État |
|---|---|---|
| `POST /api/public/notify` | Inscription waitlist | 🚧 Mock côté front, à brancher |
| `POST /api/public/contact` | Formulaire contact | 🚧 Mock côté front, à brancher |

### Backend à implémenter (P0/P1 issus de la doc admin)

- Auth réelle (login + refresh token + reset)
- Variables d'environnement (URL backend, token Mapbox)
- Cash Report (revenue stats agrégés par plateforme)
- Settings (config société + admins)
- Alert Messages (CRUD + envoi push)
- History Shifts (données réelles)
- Demandes de shift (workflow d'approbation)
- Calcul de distances
- Service email (SendGrid / Postmark / Resend)
- Tracking GPS WebSocket
- Upload média réel (S3 ou Cloudflare R2)

---

## 7. Décisions design assumées

Synthèse de toutes les décisions prises dans nos échanges, pour ne pas dériver.

### 7.1 Positionnement

| Décision | Pourquoi |
|---|---|
| **Pre-launch assumé** : pas de pricing, pas de signup, pas de SLA affiché | On a vidé le faux. Un site qui ne livre pas encore ne doit pas mentir. |
| **Date précise** : "Sortie publique septembre 2026" et non "2026" tout court | Engagement vérifiable vs vague |
| **Aucune fausse stat** : pas de "120+ compagnies / 3 400 chauffeurs" | Tout est vérifiable ou retiré |
| **Pas de logos clients faux** | À ajouter quand 3 vrais opérateurs belges seront en bêta |
| **Site purement vitrine** : aucun bouton "se connecter" visible | Cible : prospect avant la sortie. Aucune zone authentifiée |
| **CTA unique** : "Être prévenu" (waitlist) | Toute autre CTA distrait du seul objectif |
| **Contact secondaire** | "Il peut contacter si il veut" (formulaire `/contact`), mais pas mis en avant |
| **Pas d'AI-washing** | Si on intègre du ML, ce sera nommé par le bénéfice (ex. "Réconciliation automatique") pas par la techno. Aucune mention "AI-powered" générique |

### 7.2 Identité visuelle

| Décision | Détail |
|---|---|
| **Couleur signature** : bleu (`blue-500/600`) | Remplaçant le jaune taxi initial. Plus moderne, mieux contrasté en dark mode |
| **Dark mode par défaut** | Vibe SaaS premium type Linear / Stripe / Vercel |
| **Typo** : Inter (variants 400-800) | Lisibilité, neutre, pro |
| **Tone** : direct, sans em-dash `—`, sans copy générique | L'em-dash est un tell de copy AI. Banni site-wide |
| **Hiérarchie copy** : H1 ≤ 10 mots, subtitle ≤ 15 mots | Cf. benchmark Stripe / Linear / Notion |
| **Visuel hero** : ProductTicker animé (pas du texte pur) | Recommandation 2026 — l'œil a besoin d'un point d'ancrage |
| **Pas d'emoji flag** dans le sélecteur de langue | Windows ne les rend pas en couleur, fallback ASCII moche |

### 7.3 Architecture

| Décision | Détail |
|---|---|
| **3-screen layout** | Hero / ProductShowcase + Features + DriverApp / Team + FinalCTA. Tout sur `/` |
| **Pages séparées minimales** | `/contact`, `/legal/terms`, `/legal/privacy`, `/404` |
| **Routes redirect** pour les liens partagés | `/pricing`, `/features`, `/about`, `/signup`, `/login` redirigent vers `/` ou ancres |
| **Mock API par défaut** | `VITE_USE_MOCK_API=true` permet de développer / déployer sans backend |
| **Mentions légales pré-incorporation** | Société "en cours d'incorporation", BCE et siège publiés à la sortie |
| **Splash uniquement à la première visite** | localStorage flag, ne harcèle pas les retours |

---

## 8. Conventions de code et rédaction

### Code

- TypeScript strict, `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`
- shadcn/ui pour les primitives, code dans `src/components/ui/`
- Sections de page dans `src/components/sections/`
- Hooks custom dans `src/hooks/`, préfixe `use`
- API clients dans `src/lib/api/`, mocks dans `src/lib/mocks/`
- Locales dans `src/locales/{fr,en,nl,de}.json`, FR canonique
- Imports avec alias `@/` (mappé sur `src/`)
- Composants en PascalCase, fichiers .tsx pour React components

### Rédaction (copy)

- **Pas d'em-dashes `—`**, remplacer par `·`, `,`, `:` ou `.`
- **Pas de superlatifs vides** ("la meilleure", "incroyable") — préférer du concret
- **Phrases courtes** : ≤ 15 mots dans les titres, ≤ 25 mots dans les paragraphes hero
- **Tutoiement en FR** sur les CTA et instructions, vouvoiement dans les sections institutionnelles
- **Anglais** : British spelling (centralised, not centralized)
- **Allemand** : "Sie" formel
- **Néerlandais** : tutoiement (jij/je) standard B2B

### Animations

- Easings tokenisés : `EASE_APPLE = [0.22, 1, 0.36, 1]`, `EASE_VERCEL = [0.16, 1, 0.3, 1]`
- Spring par défaut : `stiffness: 220-280`, `damping: 18-24`
- `useReducedMotion` respecté (transitions tombent à `duration: 0.01`)
- `viewport={{ once: true, margin: '-15%' }}` sur les `whileInView`

---

## 9. Backlog et améliorations identifiées

### Site vitrine — court terme

| # | Item | Priorité |
|---|---|---|
| 1 | Remplacer les handles IG/LinkedIn placeholders dans `FOUNDERS` ([src/lib/constants.ts](src/lib/constants.ts)) par les vrais URLs | P0 |
| 2 | Ajouter logos des 3 premiers opérateurs belges en bêta (composant `BetaPartners` à créer, glisser sous le hero) | P1 |
| 3 | Domaine `cabs.brussels` actif + email `hello@cabs.brussels` opérationnel | P0 |
| 4 | Brancher `POST /api/public/notify` sur un vrai service (Resend / Mailchimp / Loops) | P0 |
| 5 | Brancher `POST /api/public/contact` (envoi email à `hello@cabs.brussels`) | P0 |
| 6 | Page `/changelog` publique (entrées datées des milestones produit) | P2 |
| 7 | Vidéo demo enregistrée (Loom 90s) embeddée dans la section produit | P1 |
| 8 | Photos professionnelles des 3 fondateurs (remplacer les initiales) | P2 |
| 9 | Vraies captures du dashboard à la place des `screenshot-*.png` actuelles | P1 |
| 10 | Tests E2E (Playwright) sur le parcours waitlist | P2 |

### Conformité et opérations

| # | Item | Priorité |
|---|---|---|
| 11 | DPO désigné (peut être un des 3 co-fondateurs en attendant) | P0 |
| 12 | Registre des activités de traitement (RGPD article 30) | P1 |
| 13 | Conditions de service du provider d'emails à lier dans la privacy policy | P1 |
| 14 | Compteur de waitlist visible (transparence sur le nombre d'inscrits) | P2 |
| 15 | Build + déploiement automatisés (Vercel ou Netlify avec preview branch) | P0 |
| 16 | Lighthouse ≥ 95 sur toutes les métriques | P1 |
| 17 | Sentry pour le tracking d'erreurs front | P2 |
| 18 | Plausible / Umami (analytics privacy-first) sans cookies tiers | P2 |

### Améliorations design 2026 identifiées (non priorisées)

Mes analyses précédentes ont identifié des patterns à raffiner si on veut matcher les top-tier (Linear / Stripe / Vercel / Family.co) :

- Tuer le grid pattern uniforme au profit d'un mesh gradient WebGL signature
- Réduire l'usage de glassmorphism (à utiliser sur 1 surface signature, pas partout)
- Asymétrie sur les sections (par défaut tout est centré + symétrique)
- Variants d'animation différenciés par section (pas que des `fade-up 16px`)
- Custom cursor saturé culturellement → soit le retirer soit le rendre vraiment original
- Bordures `border-border/60 bg-card/60` répétées à 18+ endroits → hiérarchiser via 3-4 styles de cards distincts
- Photos d'équipe au lieu d'initiales (instant +50% de crédibilité)
- Témoignages **inline** au milieu des features quand on aura 3 vrais opérateurs

---

## 📝 Légende

- ✅ **Implémenté et fonctionnel**
- 🚧 **En cours / partiel** (UI faite mais backend pas branché, ou inversement)
- 📋 **Planifié et discuté** (décision prise, pas encore commencé)
- ❌ **Stub vide** (référencé mais non implémenté)
- ⚠️ **Dette technique ou risque identifié**
- P0 / P1 / P2 — priorité décroissante

---

*Document vivant. À mettre à jour quand on prend une nouvelle décision ou qu'une fonctionnalité change de statut.*
