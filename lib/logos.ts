// Maps each stadium ID to its public logo path.
// Some filenames use older city/name spellings (Oakland Raiders, Washington
// Redskins, Cleveland Indians) — the files are correct, the names just reflect
// the download source.
const LOGO_MAP: Record<string, string> = {
  // MLB — AL East
  "mlb-orioles":      "/mlb-logos/baltimore-orioles-logo-transparent.png",
  "mlb-redsox":       "/mlb-logos/boston-red-sox-logo-transparent.png",
  "mlb-yankees":      "/mlb-logos/new-york-yankees-logo-transparent.png",
  "mlb-rays":         "/mlb-logos/tampa-bay-rays-logo-transparent.png",
  "mlb-bluejays":     "/mlb-logos/toronto-blue-jays-logo-transparent.png",
  // AL Central
  "mlb-whitesox":     "/mlb-logos/chicago-white-sox-logo-transparent.png",
  "mlb-guardians":    "/mlb-logos/cleveland-indians-c-logo-transparent.png",
  "mlb-tigers":       "/mlb-logos/detroit-tigers-logo-transparent.png",
  "mlb-royals":       "/mlb-logos/kansas-city-royals-logo-transparent.png",
  "mlb-twins":        "/mlb-logos/minnesota-twins-logo-transparent.png",
  // AL West
  "mlb-astros":       "/mlb-logos/houston-astros-logo-transparent.png",
  "mlb-angels":       "/mlb-logos/los-angeles-angels-logo-transparent.png",
  "mlb-athletics":    "/mlb-logos/oakland-athletics-logo-transparent.png",
  "mlb-mariners":     "/mlb-logos/seattle-mariners-logo-transparent.png",
  "mlb-rangers":      "/mlb-logos/texas-rangers-logo-transparent.png",
  // NL East
  "mlb-braves":       "/mlb-logos/atlanta-braves-logo-transparent.png",
  "mlb-marlins":      "/mlb-logos/miami-marlins-logo-transparent.png",
  "mlb-mets":         "/mlb-logos/new-york-mets-logo-transparent.png",
  "mlb-phillies":     "/mlb-logos/philadelphia-phillies-logo-transparent.png",
  "mlb-nationals":    "/mlb-logos/washington-nationals-logo-transparent.png",
  // NL Central
  "mlb-cubs":         "/mlb-logos/chicago-cubs-logo-transparent.png",
  "mlb-reds":         "/mlb-logos/cincinnati-reds-logo-transparent.png",
  "mlb-brewers":      "/mlb-logos/milwaukee-brewers-logo-transparent.png",
  "mlb-pirates":      "/mlb-logos/pittsburgh-pirates-logo-transparent.png",
  "mlb-cardinals":    "/mlb-logos/st-louis-cardinals-logo-transparent.png",
  // NL West
  "mlb-diamondbacks": "/mlb-logos/arizona-diamondbacks-logo-transparent.png",
  "mlb-rockies":      "/mlb-logos/colorado-rockies-logo-transparent.png",
  "mlb-dodgers":      "/mlb-logos/los-angeles-dodgers-logo-transparent.png",
  "mlb-padres":       "/mlb-logos/san-diego-padres-logo-transparent.png",
  "mlb-giants":       "/mlb-logos/san-francisco-giants-logo-transparent.png",

  // NFL — AFC East
  "nfl-bills":        "/nfl-logos/buffalo-bills-logo-transparent.png",
  "nfl-dolphins":     "/nfl-logos/miami-dolphins-logo-transparent.png",
  "nfl-patriots":     "/nfl-logos/new-england-patriots-logo-transparent.png",
  "nfl-jets":         "/nfl-logos/new-york-jets-logo-transparent.png",
  // AFC North
  "nfl-ravens":       "/nfl-logos/baltimore-ravens-logo-transparent.png",
  "nfl-bengals":      "/nfl-logos/cincinnati-bengals-logo-transparent.png",
  "nfl-browns":       "/nfl-logos/cleveland-browns-logo-transparent.png",
  "nfl-steelers":     "/nfl-logos/pittsburgh-steelers-logo-transparent.png",
  // AFC South
  "nfl-texans":       "/nfl-logos/houston-texans-logo-transparent.png",
  "nfl-colts":        "/nfl-logos/indianapolis-colts-logo-transparent.png",
  "nfl-jaguars":      "/nfl-logos/jacksonville-jaguars-logo-transparent.png",
  "nfl-titans":       "/nfl-logos/tennessee-titans-logo-transparent.png",
  // AFC West
  "nfl-broncos":      "/nfl-logos/denver-broncos-logo-transparent.png",
  "nfl-chiefs":       "/nfl-logos/kansas-city-chiefs-logo-transparent.png",
  "nfl-raiders":      "/nfl-logos/oakland-raiders-logo-transparent.png",
  "nfl-chargers":     "/nfl-logos/los-angeles-chargers-logo-transparent.png",
  // NFC East
  "nfl-cowboys":      "/nfl-logos/dallas-cowboys-logo-transparent.png",
  "nfl-giants":       "/nfl-logos/new-york-giants-logo-transparent.png",
  "nfl-eagles":       "/nfl-logos/philadelphia-eagles-logo-transparent.png",
  "nfl-commanders":   "/nfl-logos/washington-redskins-logo-transparent.png",
  // NFC North
  "nfl-bears":        "/nfl-logos/chicago-bears-logo-transparent.png",
  "nfl-lions":        "/nfl-logos/detroit-lions-logo-transparent.png",
  "nfl-packers":      "/nfl-logos/green-bay-packers-logo-transparent.png",
  "nfl-vikings":      "/nfl-logos/minnesota-vikings-logo-transparent.png",
  // NFC South
  "nfl-falcons":      "/nfl-logos/atlanta-falcons-logo-transparent.png",
  "nfl-panthers":     "/nfl-logos/carolina-panthers-logo-transparent.png",
  "nfl-saints":       "/nfl-logos/new-orleans-saints-logo-transparent.png",
  "nfl-buccaneers":   "/nfl-logos/tampa-bay-buccaneers-logo-transparent.png",
  // NFC West
  "nfl-cardinals":    "/nfl-logos/arizona-cardinals-logo-transparent.png",
  "nfl-rams":         "/nfl-logos/los-angeles-rams-logo-transparent.png",
  "nfl-49ers":        "/nfl-logos/san-francisco-49ers-logo-transparent.png",
  "nfl-seahawks":     "/nfl-logos/seattle-seahawks-logo-transparent.png",
};

export function getLogoUrl(stadiumId: string): string | undefined {
  return LOGO_MAP[stadiumId];
}
