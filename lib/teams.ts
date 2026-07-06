// Team branding for map pins: a short abbreviation and the team's primary
// color, keyed by stadium id. These are factual tokens (not logo artwork) and
// are safe to bundle. Actual team LOGOS are trademarked — this app does not
// ship them; drop your own into public/logos/<stadium-id>.png and flip
// LOGOS_ENABLED. See public/logos/README.md.

export interface TeamBrand {
  /** 2–4 char abbreviation, unique within a league (e.g. "NYY", "DET"). */
  abbr: string;
  /** Team primary color as a #rrggbb hex string. */
  color: string;
}

/**
 * Set to true once you've added logo files for every team in public/logos/.
 * When true, pins render the logo image and fall back to the color+abbr badge
 * only if an image fails to load. When false (default), pins are always the
 * IP-safe color+abbr badge and no logo requests are made.
 */
export const LOGOS_ENABLED = false;

/** Where a team's logo file is expected, derived from its stadium id. */
export function logoPath(stadiumId: string): string {
  return `/logos/${stadiumId}.png`;
}

export const TEAM_BRANDS: Record<string, TeamBrand> = {
  // --- MLB ---
  "mlb-orioles": { abbr: "BAL", color: "#DF4601" },
  "mlb-redsox": { abbr: "BOS", color: "#BD3039" },
  "mlb-yankees": { abbr: "NYY", color: "#0C2340" },
  "mlb-rays": { abbr: "TB", color: "#092C5C" },
  "mlb-bluejays": { abbr: "TOR", color: "#134A8E" },
  "mlb-whitesox": { abbr: "CWS", color: "#27251F" },
  "mlb-guardians": { abbr: "CLE", color: "#E31937" },
  "mlb-tigers": { abbr: "DET", color: "#0C2340" },
  "mlb-royals": { abbr: "KC", color: "#004687" },
  "mlb-twins": { abbr: "MIN", color: "#002B5C" },
  "mlb-astros": { abbr: "HOU", color: "#002D62" },
  "mlb-angels": { abbr: "LAA", color: "#BA0021" },
  "mlb-athletics": { abbr: "ATH", color: "#003831" },
  "mlb-mariners": { abbr: "SEA", color: "#0C2C56" },
  "mlb-rangers": { abbr: "TEX", color: "#003278" },
  "mlb-braves": { abbr: "ATL", color: "#CE1141" },
  "mlb-marlins": { abbr: "MIA", color: "#00A3E0" },
  "mlb-mets": { abbr: "NYM", color: "#002D72" },
  "mlb-phillies": { abbr: "PHI", color: "#E81828" },
  "mlb-nationals": { abbr: "WSH", color: "#AB0003" },
  "mlb-cubs": { abbr: "CHC", color: "#0E3386" },
  "mlb-reds": { abbr: "CIN", color: "#C6011F" },
  "mlb-brewers": { abbr: "MIL", color: "#12284B" },
  "mlb-pirates": { abbr: "PIT", color: "#FDB827" },
  "mlb-cardinals": { abbr: "STL", color: "#C41E3A" },
  "mlb-diamondbacks": { abbr: "ARI", color: "#A71930" },
  "mlb-rockies": { abbr: "COL", color: "#333366" },
  "mlb-dodgers": { abbr: "LAD", color: "#005A9C" },
  "mlb-padres": { abbr: "SD", color: "#2F241D" },
  "mlb-giants": { abbr: "SF", color: "#FD5A1E" },

  // --- NFL ---
  "nfl-bills": { abbr: "BUF", color: "#00338D" },
  "nfl-dolphins": { abbr: "MIA", color: "#008E97" },
  "nfl-patriots": { abbr: "NE", color: "#002244" },
  "nfl-jets": { abbr: "NYJ", color: "#125740" },
  "nfl-ravens": { abbr: "BAL", color: "#241773" },
  "nfl-bengals": { abbr: "CIN", color: "#FB4F14" },
  "nfl-browns": { abbr: "CLE", color: "#311D00" },
  "nfl-steelers": { abbr: "PIT", color: "#FFB612" },
  "nfl-texans": { abbr: "HOU", color: "#03202F" },
  "nfl-colts": { abbr: "IND", color: "#002C5F" },
  "nfl-jaguars": { abbr: "JAX", color: "#006778" },
  "nfl-titans": { abbr: "TEN", color: "#0C2340" },
  "nfl-broncos": { abbr: "DEN", color: "#FB4F14" },
  "nfl-chiefs": { abbr: "KC", color: "#E31837" },
  "nfl-raiders": { abbr: "LV", color: "#101820" },
  "nfl-chargers": { abbr: "LAC", color: "#0080C6" },
  "nfl-cowboys": { abbr: "DAL", color: "#041E42" },
  "nfl-giants": { abbr: "NYG", color: "#0B2265" },
  "nfl-eagles": { abbr: "PHI", color: "#004C54" },
  "nfl-commanders": { abbr: "WAS", color: "#5A1414" },
  "nfl-bears": { abbr: "CHI", color: "#0B162A" },
  "nfl-lions": { abbr: "DET", color: "#0076B6" },
  "nfl-packers": { abbr: "GB", color: "#203731" },
  "nfl-vikings": { abbr: "MIN", color: "#4F2683" },
  "nfl-falcons": { abbr: "ATL", color: "#A71930" },
  "nfl-panthers": { abbr: "CAR", color: "#0085CA" },
  "nfl-saints": { abbr: "NO", color: "#101820" },
  "nfl-buccaneers": { abbr: "TB", color: "#D50A0A" },
  "nfl-cardinals": { abbr: "ARI", color: "#97233F" },
  "nfl-rams": { abbr: "LAR", color: "#003594" },
  "nfl-49ers": { abbr: "SF", color: "#AA0000" },
  "nfl-seahawks": { abbr: "SEA", color: "#002244" },
};

const FALLBACK: TeamBrand = { abbr: "??", color: "#64748b" };

/** Look up a team's brand by stadium id (never throws). */
export function getBrand(stadiumId: string): TeamBrand {
  return TEAM_BRANDS[stadiumId] ?? FALLBACK;
}
