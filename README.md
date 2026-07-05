# 🏟️ Stadium Tracker

Track the MLB and NFL stadiums you've visited, log the date and opponent for
each visit, and share a public map of your trackers with friends.

- **Map** of all **30 MLB + 32 NFL** stadiums across the US & Canada, pins
  color-coded by league (MLB blue, NFL red), with an **All / MLB / NFL filter**.
- **Google sign-in** via Firebase Auth.
- Click a pin → **mark "I've been here"**, log the date and opponent.
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
users/{uid}                       # public profile — { username, displayName, photoURL }  (PII-free)
users/{uid}/visits/{stadiumId}    # a visit — { stadiumId, league, date, opponent, updatedAt }
usernames/{username}              # uniqueness + share-URL lookup — { uid }
```

- One visit document **per stadium** (keyed by `stadiumId`).
- `usernames/{username}` acts as a uniqueness lock and lets `/u/[username]`
  resolve a handle to a uid. Renaming a username is an atomic transaction.
- The two NFL venues shared by two teams (MetLife → Giants + Jets, SoFi →
  Rams + Chargers) are stored as **separate team entries** so all 32 NFL teams
  are individually trackable; the overlapping pins are nudged ~600 m so both
  stay clickable. See [`lib/stadiums.ts`](lib/stadiums.ts).

---

## 8. CI/CD — staged promotion pipeline

This repo follows the house `dev → test → main` model used across this
development folder:

| Branch | Role | Checks on incoming PRs |
| --- | --- | --- |
| `dev` | Features land here | `claude-code-review.yml` — advisory Claude review |
| `test` | Staging | `promotion-review.yml` (**blocking**) + `build.yml` |
| `main` | Production | `promotion-review.yml` (**blocking**) + `build.yml` |

- [`build.yml`](.github/workflows/build.yml) runs `tsc --noEmit`, the unit
  tests (`npm test`), and `next build` on PRs to `test`/`main`.
- [`claude-code-review.yml`](.github/workflows/claude-code-review.yml) is a
  fresh-context advisory review on PRs to `dev`.
- [`promotion-review.yml`](.github/workflows/promotion-review.yml) is a
  **blocking** fresh-context review that fails the check (and, via branch
  protection, blocks the merge) on any high/critical finding when promoting to
  `test` or `main`.

**To finish wiring this up** (these are one-time, account-owned steps — do them
yourself, don't paste secrets into a chat):

```bash
# From inside this directory, after the repo is on GitHub:
gh secret set CLAUDE_CODE_OAUTH_TOKEN     # paste output of: claude setup-token
# Then set up the test branch + branch protection per the shared guide:
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

Pure logic lives in `lib/` behind unit tests (Vitest) so it can be verified
without a browser or live Firebase:

- [`lib/stadiums.test.ts`](lib/stadiums.test.ts) — data integrity: exactly
  30 MLB + 32 NFL, unique ids, coordinates in-bounds, and **no two pins at the
  same coordinate** (guards the shared-venue nudge).
- [`lib/slug.test.ts`](lib/slug.test.ts) — username normalization.
- [`lib/stats.test.ts`](lib/stats.test.ts) — visit counts, completion %, league
  filter, and share summary.
- [`lib/sort.test.ts`](lib/sort.test.ts) — the visited-list sort, including the
  "empty dates always sort last" rule.

New features here were built test-first (TDD): the pure functions in
`lib/stats.ts` and `lib/sort.ts` were specified by their tests before the UI was
wired to them.

---

## 10. What's verified vs. what needs your keys

- ✅ **Verified locally:** the app type-checks, passes 30 unit tests, builds
  with zero env vars, and every route (`/`, `/tracker`, `/u/[username]`) renders
  without errors.
- 🔑 **Needs your setup to exercise end-to-end:** Google sign-in and the live
  map require a real Firebase project and Mapbox token (§3–§4). Follow those
  sections and everything wires together.
