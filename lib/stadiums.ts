import type { Stadium } from "./types";

// All 30 MLB + 32 NFL teams and their home venues (current as of the 2025/26
// seasons). Coordinates are the venue location in decimal degrees.
//
// Two NFL venues are SHARED by two teams:
//   - MetLife Stadium  → New York Giants + New York Jets
//   - SoFi Stadium     → Los Angeles Rams + Los Angeles Chargers
// Each team still gets its own record (so "32 NFL stadiums" holds and each is
// independently trackable). To keep both pins clickable on the map, the second
// team of each pair is nudged ~0.008° (~600 m) from the true venue coordinate.
// The nudged teams are marked with a comment below.

export const MLB_STADIUMS: Stadium[] = [
  // AL East
  { id: "mlb-orioles", name: "Oriole Park at Camden Yards", team: "Baltimore Orioles", city: "Baltimore", state: "MD", league: "MLB", lat: 39.2839, lng: -76.6217 },
  { id: "mlb-redsox", name: "Fenway Park", team: "Boston Red Sox", city: "Boston", state: "MA", league: "MLB", lat: 42.3467, lng: -71.0972 },
  { id: "mlb-yankees", name: "Yankee Stadium", team: "New York Yankees", city: "Bronx", state: "NY", league: "MLB", lat: 40.8296, lng: -73.9262 },
  { id: "mlb-rays", name: "Tropicana Field", team: "Tampa Bay Rays", city: "St. Petersburg", state: "FL", league: "MLB", lat: 27.7683, lng: -82.6534 },
  { id: "mlb-bluejays", name: "Rogers Centre", team: "Toronto Blue Jays", city: "Toronto", state: "ON", league: "MLB", lat: 43.6414, lng: -79.3894 },
  // AL Central
  { id: "mlb-whitesox", name: "Rate Field", team: "Chicago White Sox", city: "Chicago", state: "IL", league: "MLB", lat: 41.8299, lng: -87.6338 },
  { id: "mlb-guardians", name: "Progressive Field", team: "Cleveland Guardians", city: "Cleveland", state: "OH", league: "MLB", lat: 41.4962, lng: -81.6852 },
  { id: "mlb-tigers", name: "Comerica Park", team: "Detroit Tigers", city: "Detroit", state: "MI", league: "MLB", lat: 42.3390, lng: -83.0485 },
  { id: "mlb-royals", name: "Kauffman Stadium", team: "Kansas City Royals", city: "Kansas City", state: "MO", league: "MLB", lat: 39.0517, lng: -94.4803 },
  { id: "mlb-twins", name: "Target Field", team: "Minnesota Twins", city: "Minneapolis", state: "MN", league: "MLB", lat: 44.9817, lng: -93.2776 },
  // AL West
  { id: "mlb-astros", name: "Daikin Park", team: "Houston Astros", city: "Houston", state: "TX", league: "MLB", lat: 29.7573, lng: -95.3555 },
  { id: "mlb-angels", name: "Angel Stadium", team: "Los Angeles Angels", city: "Anaheim", state: "CA", league: "MLB", lat: 33.8003, lng: -117.8827 },
  { id: "mlb-athletics", name: "Sutter Health Park", team: "Athletics", city: "West Sacramento", state: "CA", league: "MLB", lat: 38.5802, lng: -121.5133 },
  { id: "mlb-mariners", name: "T-Mobile Park", team: "Seattle Mariners", city: "Seattle", state: "WA", league: "MLB", lat: 47.5914, lng: -122.3325 },
  { id: "mlb-rangers", name: "Globe Life Field", team: "Texas Rangers", city: "Arlington", state: "TX", league: "MLB", lat: 32.7473, lng: -97.0842 },
  // NL East
  { id: "mlb-braves", name: "Truist Park", team: "Atlanta Braves", city: "Atlanta", state: "GA", league: "MLB", lat: 33.8907, lng: -84.4677 },
  { id: "mlb-marlins", name: "loanDepot Park", team: "Miami Marlins", city: "Miami", state: "FL", league: "MLB", lat: 25.7781, lng: -80.2197 },
  { id: "mlb-mets", name: "Citi Field", team: "New York Mets", city: "Queens", state: "NY", league: "MLB", lat: 40.7571, lng: -73.8458 },
  { id: "mlb-phillies", name: "Citizens Bank Park", team: "Philadelphia Phillies", city: "Philadelphia", state: "PA", league: "MLB", lat: 39.9061, lng: -75.1665 },
  { id: "mlb-nationals", name: "Nationals Park", team: "Washington Nationals", city: "Washington", state: "DC", league: "MLB", lat: 38.8730, lng: -77.0074 },
  // NL Central
  { id: "mlb-cubs", name: "Wrigley Field", team: "Chicago Cubs", city: "Chicago", state: "IL", league: "MLB", lat: 41.9484, lng: -87.6553 },
  { id: "mlb-reds", name: "Great American Ball Park", team: "Cincinnati Reds", city: "Cincinnati", state: "OH", league: "MLB", lat: 39.0975, lng: -84.5069 },
  { id: "mlb-brewers", name: "American Family Field", team: "Milwaukee Brewers", city: "Milwaukee", state: "WI", league: "MLB", lat: 43.0280, lng: -87.9712 },
  { id: "mlb-pirates", name: "PNC Park", team: "Pittsburgh Pirates", city: "Pittsburgh", state: "PA", league: "MLB", lat: 40.4469, lng: -80.0057 },
  { id: "mlb-cardinals", name: "Busch Stadium", team: "St. Louis Cardinals", city: "St. Louis", state: "MO", league: "MLB", lat: 38.6226, lng: -90.1928 },
  // NL West
  { id: "mlb-diamondbacks", name: "Chase Field", team: "Arizona Diamondbacks", city: "Phoenix", state: "AZ", league: "MLB", lat: 33.4455, lng: -112.0667 },
  { id: "mlb-rockies", name: "Coors Field", team: "Colorado Rockies", city: "Denver", state: "CO", league: "MLB", lat: 39.7559, lng: -104.9942 },
  { id: "mlb-dodgers", name: "Dodger Stadium", team: "Los Angeles Dodgers", city: "Los Angeles", state: "CA", league: "MLB", lat: 34.0739, lng: -118.2400 },
  { id: "mlb-padres", name: "Petco Park", team: "San Diego Padres", city: "San Diego", state: "CA", league: "MLB", lat: 32.7073, lng: -117.1566 },
  { id: "mlb-giants", name: "Oracle Park", team: "San Francisco Giants", city: "San Francisco", state: "CA", league: "MLB", lat: 37.7786, lng: -122.3893 },
];

export const NFL_STADIUMS: Stadium[] = [
  // AFC East
  { id: "nfl-bills", name: "Highmark Stadium", team: "Buffalo Bills", city: "Orchard Park", state: "NY", league: "NFL", lat: 42.7738, lng: -78.7870 },
  { id: "nfl-dolphins", name: "Hard Rock Stadium", team: "Miami Dolphins", city: "Miami Gardens", state: "FL", league: "NFL", lat: 25.9580, lng: -80.2389 },
  { id: "nfl-patriots", name: "Gillette Stadium", team: "New England Patriots", city: "Foxborough", state: "MA", league: "NFL", lat: 42.0909, lng: -71.2643 },
  { id: "nfl-jets", name: "MetLife Stadium", team: "New York Jets", city: "East Rutherford", state: "NJ", league: "NFL", lat: 40.8135, lng: -74.0745 },
  // AFC North
  { id: "nfl-ravens", name: "M&T Bank Stadium", team: "Baltimore Ravens", city: "Baltimore", state: "MD", league: "NFL", lat: 39.2780, lng: -76.6227 },
  { id: "nfl-bengals", name: "Paycor Stadium", team: "Cincinnati Bengals", city: "Cincinnati", state: "OH", league: "NFL", lat: 39.0955, lng: -84.5161 },
  { id: "nfl-browns", name: "Huntington Bank Field", team: "Cleveland Browns", city: "Cleveland", state: "OH", league: "NFL", lat: 41.5061, lng: -81.6995 },
  { id: "nfl-steelers", name: "Acrisure Stadium", team: "Pittsburgh Steelers", city: "Pittsburgh", state: "PA", league: "NFL", lat: 40.4468, lng: -80.0158 },
  // AFC South
  { id: "nfl-texans", name: "NRG Stadium", team: "Houston Texans", city: "Houston", state: "TX", league: "NFL", lat: 29.6847, lng: -95.4107 },
  { id: "nfl-colts", name: "Lucas Oil Stadium", team: "Indianapolis Colts", city: "Indianapolis", state: "IN", league: "NFL", lat: 39.7601, lng: -86.1639 },
  { id: "nfl-jaguars", name: "EverBank Stadium", team: "Jacksonville Jaguars", city: "Jacksonville", state: "FL", league: "NFL", lat: 30.3239, lng: -81.6373 },
  { id: "nfl-titans", name: "Nissan Stadium", team: "Tennessee Titans", city: "Nashville", state: "TN", league: "NFL", lat: 36.1665, lng: -86.7713 },
  // AFC West
  { id: "nfl-broncos", name: "Empower Field at Mile High", team: "Denver Broncos", city: "Denver", state: "CO", league: "NFL", lat: 39.7439, lng: -105.0201 },
  { id: "nfl-chiefs", name: "GEHA Field at Arrowhead Stadium", team: "Kansas City Chiefs", city: "Kansas City", state: "MO", league: "NFL", lat: 39.0489, lng: -94.4839 },
  { id: "nfl-raiders", name: "Allegiant Stadium", team: "Las Vegas Raiders", city: "Paradise", state: "NV", league: "NFL", lat: 36.0909, lng: -115.1833 },
  { id: "nfl-chargers", name: "SoFi Stadium", team: "Los Angeles Chargers", city: "Inglewood", state: "CA", league: "NFL", lat: 33.9535, lng: -118.3392 },
  // NFC East
  { id: "nfl-cowboys", name: "AT&T Stadium", team: "Dallas Cowboys", city: "Arlington", state: "TX", league: "NFL", lat: 32.7473, lng: -97.0945 },
  // Giants share MetLife with the Jets — nudged ~0.008° east so both pins click.
  { id: "nfl-giants", name: "MetLife Stadium", team: "New York Giants", city: "East Rutherford", state: "NJ", league: "NFL", lat: 40.8135, lng: -74.0665 },
  { id: "nfl-eagles", name: "Lincoln Financial Field", team: "Philadelphia Eagles", city: "Philadelphia", state: "PA", league: "NFL", lat: 39.9008, lng: -75.1675 },
  { id: "nfl-commanders", name: "Northwest Stadium", team: "Washington Commanders", city: "Landover", state: "MD", league: "NFL", lat: 38.9077, lng: -76.8645 },
  // NFC North
  { id: "nfl-bears", name: "Soldier Field", team: "Chicago Bears", city: "Chicago", state: "IL", league: "NFL", lat: 41.8623, lng: -87.6167 },
  { id: "nfl-lions", name: "Ford Field", team: "Detroit Lions", city: "Detroit", state: "MI", league: "NFL", lat: 42.3400, lng: -83.0456 },
  { id: "nfl-packers", name: "Lambeau Field", team: "Green Bay Packers", city: "Green Bay", state: "WI", league: "NFL", lat: 44.5013, lng: -88.0622 },
  { id: "nfl-vikings", name: "U.S. Bank Stadium", team: "Minnesota Vikings", city: "Minneapolis", state: "MN", league: "NFL", lat: 44.9736, lng: -93.2575 },
  // NFC South
  { id: "nfl-falcons", name: "Mercedes-Benz Stadium", team: "Atlanta Falcons", city: "Atlanta", state: "GA", league: "NFL", lat: 33.7554, lng: -84.4009 },
  { id: "nfl-panthers", name: "Bank of America Stadium", team: "Carolina Panthers", city: "Charlotte", state: "NC", league: "NFL", lat: 35.2258, lng: -80.8528 },
  { id: "nfl-saints", name: "Caesars Superdome", team: "New Orleans Saints", city: "New Orleans", state: "LA", league: "NFL", lat: 29.9511, lng: -90.0812 },
  { id: "nfl-buccaneers", name: "Raymond James Stadium", team: "Tampa Bay Buccaneers", city: "Tampa", state: "FL", league: "NFL", lat: 27.9759, lng: -82.5033 },
  // NFC West
  { id: "nfl-cardinals", name: "State Farm Stadium", team: "Arizona Cardinals", city: "Glendale", state: "AZ", league: "NFL", lat: 33.5276, lng: -112.2626 },
  // Rams share SoFi with the Chargers — nudged ~0.008° east so both pins click.
  { id: "nfl-rams", name: "SoFi Stadium", team: "Los Angeles Rams", city: "Inglewood", state: "CA", league: "NFL", lat: 33.9535, lng: -118.3312 },
  { id: "nfl-49ers", name: "Levi's Stadium", team: "San Francisco 49ers", city: "Santa Clara", state: "CA", league: "NFL", lat: 37.4030, lng: -121.9698 },
  { id: "nfl-seahawks", name: "Lumen Field", team: "Seattle Seahawks", city: "Seattle", state: "WA", league: "NFL", lat: 47.5952, lng: -122.3316 },
];

export const STADIUMS: Stadium[] = [...MLB_STADIUMS, ...NFL_STADIUMS];

export const STADIUMS_BY_ID: Record<string, Stadium> = Object.fromEntries(
  STADIUMS.map((s) => [s.id, s]),
);

export function getStadium(id: string): Stadium | undefined {
  return STADIUMS_BY_ID[id];
}

/**
 * The teams a stadium's home team could have hosted: every team in the same
 * league, minus the home team, sorted alphabetically. Used to populate the
 * opponent picker when logging a visit.
 */
export function opponentsFor(stadium: Stadium): string[] {
  return STADIUMS.filter(
    (s) => s.league === stadium.league && s.team !== stadium.team,
  )
    .map((s) => s.team)
    .sort();
}

/** Brand colors used to color-code pins and badges by league (see the design
 *  tokens --mlb / --nfl in app/globals.css — kept in sync via CSS vars). */
export const LEAGUE_COLORS: Record<Stadium["league"], string> = {
  MLB: "var(--mlb)",
  NFL: "var(--nfl)",
};
