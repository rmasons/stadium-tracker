# Team logos (drop-in)

Map pins render a team **color + abbreviation badge** by default. To show real
team logos instead, add image files here and flip one flag.

## How to enable

1. Add one image per team, named by its **stadium id** (see `lib/stadiums.ts`),
   as a PNG in this folder. Square, transparent-background images look best
   (roughly 64×64 or larger). Examples:

   ```
   public/logos/mlb-yankees.png
   public/logos/nfl-lions.png
   public/logos/mlb-tigers.png
   ...
   ```

   The full list of ids is every `id:` value in `lib/stadiums.ts` (62 total).

2. In `lib/teams.ts`, set:

   ```ts
   export const LOGOS_ENABLED = true;
   ```

That's it. Each pin loads its logo and falls back to the color+abbreviation
badge automatically if a file is missing, so you can add them incrementally.

To change the expected file extension or path, edit `logoPath()` in
`lib/teams.ts` (defaults to `/logos/<id>.png`).

## ⚠️ Licensing

MLB and NFL team names, logos, and marks are **trademarks of their respective
teams/leagues**. They are intentionally **not** committed to this repository.
Whether you may use them depends on your use case — personal/non-commercial use
is generally lower-risk, but public or commercial use may require permission.
You are responsible for sourcing logo files you have the right to use.
