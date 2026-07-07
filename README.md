# 🏟️ Stadium Tracker

Track the MLB and NFL stadiums you've visited, log the date and opponent for
each visit, and share a public map of your trackers with friends.

- **Map** of all **30 MLB + 32 NFL** stadiums across the US & Canada. Each pin
  is a classic teardrop with the **team logo** in a white circle, league-colored
  body (blue for MLB, red-orange for NFL), and an **All / MLB / NFL filter**.
  Same-city venues automatically **fan apart** so no pin hides behind another;
  the fan-out uses per-league offsets when a single league is filtered so
  same-league co-located pairs (Giants/Jets, Rams/Chargers, Cubs/Sox) stay
  separated. The map defaults to **dark mode** and follows the system
  light/dark preference. **Visited stadiums** render at full opacity;
  unvisited ones dim to 55% so your progress reads at a glance.
- **Google sign-in** via Firebase Auth.
- Click a pin → **detail panel** with a real **stadium photo** (Wikimedia
  Commons), the team logo as fallback, plus an **"I've been here"** button to
  **log a visit** (date + opponent). Been more than once? **Log repeat visits** — each is its own record.
- **My Tracker** — a sortable list, **completion progress bar**, and per-league
  counts.
- **Share URL** — every user gets a public read-only page at `/u/[username]`,
  plus a one-line copyable summary of their progress.

Built with **Next.js (App Router) · Firebase Auth + Firestore · Mapbox GL JS**,
deployed on **Vercel**.

---

## 1. Prerequisites

- **Node.js 20+** and npm.
- A **Firebase** project (free "Spark" plan is fine).
- A free **Mapbox** account (for the map).

---

## 2. Install & run locally

```bash
npm install
cp .env.example .env.local     # then fill in the values (steps 3 & 4)
npm run dev                     # http://localhost:3000
```

The app runs **without** any configuration — the map shows a "Map unavailable"
notice and sign-in is disabled until you add the env vars below. This is by
design so the project builds in CI with no secrets.

---

## 3. Firebase setup

1. Go to the [Firebase console](https://console.firebase.google.com) →
   **Add project**.
2. **Enable Google sign-in:** Build → **Authentication** → **Get started** →
   **Sign-in method** → enable **Google**.
   - Under Authentication → **Settings → Authorized domains**, add the domains
     you'll use (`localhost` is there by default; add your Vercel domain later).
3. **Create the database:** Build → **Firestore Database** → **Create database**
   → start in **production mode** (the included rules lock it down properly).
4. **Get your web config:** Project settings (⚙️) → **General** → scroll to
   **Your apps** → click the **web** icon (`</>`) to register a web app →
   copy the `firebaseConfig` values into `.env.local`:

   | `.env.local` key | `firebaseConfig` field |
   | --- | --- |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |

   > These `NEXT_PUBLIC_*` values ship to the browser — that's expected for a
   > Firebase web app. Access is controlled by **Firestore security rules**, not
   > by hiding the config.

### Deploy the Firestore security rules

The security model lives in [`firestore.rules`](firestore.rules): profiles and
visits are **world-readable** (so share pages work), but **writable only by the
signed-in owner**, and the public profile doc is kept **PII-free** (no email) by
rule. Deploy it with the Firebase CLI:

```bash
npm i -g firebase-tools
firebase login
firebase use --add            # pick your project
firebase deploy --only firestore:rules
```

(You can also paste the file's contents into Firestore → **Rules** in the
console.)

---

## 4. Mapbox setup

1. Create a free account at [mapbox.com](https://account.mapbox.com).
2. Copy your **default public token** (starts with `pk.`) from the account page.
3. Put it in `.env.local` as `NEXT_PUBLIC_MAPBOX_TOKEN`.
4. In production, restrict the token to your domain(s) in the Mapbox dashboard.

---

## 5. Environment variables

All variables live in [`.env.example`](.env.example). Copy it to `.env.local`
for local dev, and add the **same keys** in Vercel → Project → **Settings →
Environment Variables** for deployment.

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

---

## 6. Deploy to Vercel

1. Push this repo to GitHub (see §8).
2. Import it at [vercel.com/new](https://vercel.com/new). Vercel auto-detects
   Next.js — no build config needed.
3. Add all seven env vars from §5 under **Settings → Environment Variables**.
4. Deploy. Then add your `*.vercel.app` domain (and any custom domain) to
   Firebase Auth → **Authorized domains** so Google sign-in works in production.

[`vercel.json`](vercel.json) enables production deploys from `main` only (the
`dev`/`test` branches are for review — see below).

---

## 7. Data model

```
users/{uid}                     # public profile — { username, displayName, photoURL }  (PII-free)
users/{uid}/visits/{visitId}    # a visit — { stadiumId, league, date, opponent, createdAt, updatedAt }
usernames/{username}            # uniqueness + share-URL lookup — { uid }
```

- Each visit is its own **auto-id document**, so a stadium can be logged any
  number of times. Completion counts distinct stadiums; `totalVisits` counts
  every record.
- `usernames/{username}` acts as a uniqueness lock and lets `/u/[username]`
  resolve a handle to a uid. Renaming a username is an atomic transaction.
- The two NFL venues shared by two teams (MetLife → Giants + Jets, SoFi →
  Rams + Chargers) are stored as **separate team entries** so all 32 NFL teams
  are individually trackable. Co-located pins are separated by a CSS pixel
  offset computed by [`lib/pins.ts`](lib/pins.ts) — no coordinate nudging,
  so both pins point at the same real-world location. See
  [`lib/stadiums.ts`](lib/stadiums.ts).

---

## 8. CI/CD — promotion pipeline

This repo uses a two-branch `dev → main` model:

| Branch | Role | Checks on incoming PRs |
| --- | --- | --- |
| `dev` | Features land here | `claude-code-review.yml` — advisory Claude review |
| `main` | Production | `promotion-review.yml` (**blocking**) + `build.yml` |

- [`build.yml`](.github/workflows/build.yml) runs `tsc --noEmit`, the unit
  tests (`npm test`), and `next build` on PRs to `main`.
- [`claude-code-review.yml`](.github/workflows/claude-code-review.yml) is a
  fresh-context advisory review on PRs to `dev`.
- [`promotion-review.yml`](.github/workflows/promotion-review.yml) is a
  **blocking** fresh-context review that fails the check (and, via branch
  protection, blocks the merge) on any high/critical finding when promoting to
  `main`.
- [`auto-merge.yml`](.github/workflows/auto-merge.yml) enables squash
  auto-merge on every PR targeting `main` — the merge fires automatically once
  both required checks pass, no manual merge step needed.

**To finish wiring this up** (these are one-time, account-owned steps — do them
yourself, don't paste secrets into a chat):

```bash
# From inside this directory, after the repo is on GitHub:
gh secret set CLAUDE_CODE_OAUTH_TOKEN     # paste output of: claude setup-token
# Then apply branch protection per the shared guide:
#   ~/Desktop/development/.claude-review/PIPELINE.md
```

The [Claude GitHub App](https://github.com/apps/claude) must also be installed
on the repo for the review Actions to post comments.

---

## 9. Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the unit test suite (Vitest, one-shot) |
| `npm run test:watch` | Vitest in watch mode |

### Testing

The suite (Vitest, **81 tests**) covers pure logic in Node and React components
in jsdom, so behavior is verified without a browser or live Firebase:

- [`lib/stadiums.test.ts`](lib/stadiums.test.ts) — data integrity: exactly
  30 MLB + 32 NFL, unique ids, coordinates in-bounds, and **no two pins at the
  same coordinate** (guards the shared-venue nudge).
- [`lib/slug.test.ts`](lib/slug.test.ts) — username normalization.
- [`lib/stats.test.ts`](lib/stats.test.ts) — visit counts (distinct stadiums vs
  repeat visits), completion %, league filter, and share summary.
- [`lib/sort.test.ts`](lib/sort.test.ts) — the visited-list sort, including the
  "empty dates always sort last" rule and one row per repeat visit.
- [`lib/teams.test.ts`](lib/teams.test.ts) — every team has a brand; league-unique
  abbreviations; valid colors.
- [`lib/pins.test.ts`](lib/pins.test.ts) — pin declutter: co-located pins fan
  apart with distinct offsets, isolated pins stay put.
- [`components/VisitedList.test.tsx`](components/VisitedList.test.tsx) and
  [`components/StadiumDetail.test.tsx`](components/StadiumDetail.test.tsx) —
  render, sorting, add/remove visits (incl. repeat visits), and read-only mode,
  via React Testing Library.

New features here were built test-first (TDD): the pure functions in
`lib/stats.ts` and `lib/sort.ts` were specified by their tests before the UI was
wired to them.

---

## 10. What's verified vs. what needs your keys

- ✅ **Verified locally:** the app type-checks, passes 81 tests, builds with
  zero env vars, and every route (`/`, `/tracker`, `/u/[username]`) renders
  without errors.
- 🔑 **Needs your setup to exercise end-to-end:** Google sign-in and the live
  map require a real Firebase project and Mapbox token (§3–§4). Follow those
  sections and everything wires together.
