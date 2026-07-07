// Maps each stadium ID to a Wikimedia Commons thumbnail URL (330 px wide).
// All URLs verified HTTP 200 as of 2026-07-06.
// Source: Wikipedia REST API summary endpoint → thumbnail.source.
const PHOTO_MAP: Record<string, string> = {
  // MLB — AL East
  "mlb-orioles":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/OrioleParkatCamdenYardsSummer2025.jpg/330px-OrioleParkatCamdenYardsSummer2025.jpg",
  "mlb-redsox":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/131023-F-PR861-033_Hanscom_participates_in_World_Series_pregame_events.jpg/330px-131023-F-PR861-033_Hanscom_participates_in_World_Series_pregame_events.jpg",
  "mlb-yankees":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Yankee_Stadium_overhead_2010.jpg/330px-Yankee_Stadium_overhead_2010.jpg",
  "mlb-rays":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/PXL_20220528_205520913.jpg/330px-PXL_20220528_205520913.jpg",
  "mlb-bluejays":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Rogers_Centre_%28500_Level%29_-_Toronto%2C_ON.jpg/330px-Rogers_Centre_%28500_Level%29_-_Toronto%2C_ON.jpg",
  // AL Central
  "mlb-whitesox":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Chicago%2C_Illinois%2C_U.S._%282023%29_-_062.jpg/330px-Chicago%2C_Illinois%2C_U.S._%282023%29_-_062.jpg",
  "mlb-guardians":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Cleveland_Guardians_vs._New_York_Yankees_on_Oct_17_2024_%2854102149292%29.jpg/330px-Cleveland_Guardians_vs._New_York_Yankees_on_Oct_17_2024_%2854102149292%29.jpg",
  "mlb-tigers":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Detroit_Tigers_opening_game_at_Comerica_Park%2C_2007.jpg/330px-Detroit_Tigers_opening_game_at_Comerica_Park%2C_2007.jpg",
  "mlb-royals":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Kauffman2017.jpg/330px-Kauffman2017.jpg",
  "mlb-twins":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Target_Field%2C_Minneapolis%2C_Minnesota_%2843167053335%29.jpg/330px-Target_Field%2C_Minneapolis%2C_Minnesota_%2843167053335%29.jpg",
  // AL West
  "mlb-astros":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Houston%2C_Texas_%282024%29_-_09.jpg/330px-Houston%2C_Texas_%282024%29_-_09.jpg",
  "mlb-angels":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Angelstadiummarch2019.jpg/330px-Angelstadiummarch2019.jpg",
  "mlb-athletics":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Sutter_Health_Park_aerial_view_2023_%28Quintin_Soloviev%29.jpg/330px-Sutter_Health_Park_aerial_view_2023_%28Quintin_Soloviev%29.jpg",
  "mlb-mariners":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/SafecoFieldTop.jpg/330px-SafecoFieldTop.jpg",
  "mlb-rangers":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/GlobeLifeField2021.jpg/330px-GlobeLifeField2021.jpg",
  // NL East
  "mlb-braves":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Truist_Park_2025.jpg/330px-Truist_Park_2025.jpg",
  "mlb-marlins":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/LOAN_DEPOT_PARK.jpg/330px-LOAN_DEPOT_PARK.jpg",
  "mlb-mets":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Citi_Field_%2848613685207%29.jpg/250px-Citi_Field_%2848613685207%29.jpg",
  "mlb-phillies":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Citizens_Bank_Park_2021.jpg/330px-Citizens_Bank_Park_2021.jpg",
  "mlb-nationals":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Nationals_Park_8.16.19_-_7.jpg/330px-Nationals_Park_8.16.19_-_7.jpg",
  // NL Central
  "mlb-cubs":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Wrigley_Field_in_line_with_sign.jpg/330px-Wrigley_Field_in_line_with_sign.jpg",
  "mlb-reds":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/10Cincinnati_2015_%282%29.jpg/330px-10Cincinnati_2015_%282%29.jpg",
  "mlb-brewers":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Miller_Park_in_Milwaukee%2C_Wisconsin.jpg/330px-Miller_Park_in_Milwaukee%2C_Wisconsin.jpg",
  "mlb-pirates":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Pittsburgh_Pirates_park_%28Unsplash%29.jpg/330px-Pittsburgh_Pirates_park_%28Unsplash%29.jpg",
  "mlb-cardinals":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Busch_Stadium_2022.jpg/330px-Busch_Stadium_2022.jpg",
  // NL West
  "mlb-diamondbacks":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Reserve_A-10_Warthogs_Flyover_2023_World_Series_%288099146%29.jpg/330px-Reserve_A-10_Warthogs_Flyover_2023_World_Series_%288099146%29.jpg",
  "mlb-rockies":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Coors_Field_exterior_2022.jpg/250px-Coors_Field_exterior_2022.jpg",
  "mlb-dodgers":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Dodger_Stadium_and_Chavez_Ravine_far_view%2C_Chicago_Cubs_at_Los_Angeles_Dodgers%2C_%28April_12%2C_2025%29.jpg/330px-Dodger_Stadium_and_Chavez_Ravine_far_view%2C_Chicago_Cubs_at_Los_Angeles_Dodgers%2C_%28April_12%2C_2025%29.jpg",
  "mlb-padres":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Petco_Park_Padres_Game.jpg/330px-Petco_Park_Padres_Game.jpg",
  "mlb-giants":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Oracle_Park_2021.jpg/330px-Oracle_Park_2021.jpg",

  // NFL — AFC East
  "nfl-bills":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Bills_Stadium_May26.jpg/330px-Bills_Stadium_May26.jpg",
  "nfl-dolphins":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg/330px-Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg",
  "nfl-patriots":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Gillette_Stadium_%28Top_View%29.jpg/330px-Gillette_Stadium_%28Top_View%29.jpg",
  "nfl-jets":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Metlife_stadium_%28Aerial_view%29.jpg/330px-Metlife_stadium_%28Aerial_view%29.jpg",
  // AFC North
  "nfl-ravens":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/M%26T_Bank_Stadium_in_Baltimore.jpg/330px-M%26T_Bank_Stadium_in_Baltimore.jpg",
  "nfl-bengals":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Paul_Brown_Stadium_interior_2017.jpg/330px-Paul_Brown_Stadium_interior_2017.jpg",
  "nfl-browns":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/FirstEnergy_Stadium_50_yardline_panorama.png/330px-FirstEnergy_Stadium_50_yardline_panorama.png",
  "nfl-steelers":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Acrisure_Stadium_2024.jpg/330px-Acrisure_Stadium_2024.jpg",
  // AFC South
  "nfl-texans":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Nrg_stadium.jpg/330px-Nrg_stadium.jpg",
  "nfl-colts":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Aerial_view_of_Indianapolis%2C_Indiana%2C_with_a_focus_on_Lucas_Oil_Stadium%2C_highsm.40934.jpg/330px-Aerial_view_of_Indianapolis%2C_Indiana%2C_with_a_focus_on_Lucas_Oil_Stadium%2C_highsm.40934.jpg",
  "nfl-jaguars":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/EverBank_Stadium_aerial_view.jpg/330px-EverBank_Stadium_aerial_view.jpg",
  "nfl-titans":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Aerial_view_of_Nissan_Stadium_%28Tennessee_Titans%29.jpg/330px-Aerial_view_of_Nissan_Stadium_%28Tennessee_Titans%29.jpg",
  // AFC West
  "nfl-broncos":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Empower_Field_at_Mile_High_20241001.jpg/330px-Empower_Field_at_Mile_High_20241001.jpg",
  "nfl-chiefs":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg/330px-Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg",
  "nfl-raiders":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Allegiant_Stadium_Street_View_on_Super_Bowl_LVIII.jpg/330px-Allegiant_Stadium_Street_View_on_Super_Bowl_LVIII.jpg",
  "nfl-chargers":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/SoFi_Stadium_2023.jpg/330px-SoFi_Stadium_2023.jpg",
  // NFC East
  "nfl-cowboys":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Arlington_June_2020_4_%28AT%26T_Stadium%29.jpg/330px-Arlington_June_2020_4_%28AT%26T_Stadium%29.jpg",
  "nfl-giants":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Metlife_stadium_%28Aerial_view%29.jpg/330px-Metlife_stadium_%28Aerial_view%29.jpg",
  "nfl-eagles":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Lincoln_Financial_Field_%28Aerial_view%29.jpg/330px-Lincoln_Financial_Field_%28Aerial_view%29.jpg",
  "nfl-commanders":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Commanders_vs_Giants_%2853345178211%29.jpg/330px-Commanders_vs_Giants_%2853345178211%29.jpg",
  // NFC North
  "nfl-bears":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Soldier_Field_S.jpg/330px-Soldier_Field_S.jpg",
  "nfl-lions":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Detroit_December_2015_09_%28Ford_Field%29.jpg/330px-Detroit_December_2015_09_%28Ford_Field%29.jpg",
  "nfl-packers":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Lambeau_Field_-_Green_Bay_Packers_Football_Stadium_-_Wisconsin.jpg/330px-Lambeau_Field_-_Green_Bay_Packers_Football_Stadium_-_Wisconsin.jpg",
  "nfl-vikings":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/U.S._Bank_Stadium_2021-09-23.jpg/330px-U.S._Bank_Stadium_2021-09-23.jpg",
  // NFC South
  "nfl-falcons":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg/330px-Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg",
  "nfl-panthers":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Aerial_view_of_Bank_of_America_Stadium_in_Charlotte.jpg/330px-Aerial_view_of_Bank_of_America_Stadium_in_Charlotte.jpg",
  "nfl-saints":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/DHS_Agencies_Support_Super_Bowl_LIX_Security_February_2025_-_108.jpg/330px-DHS_Agencies_Support_Super_Bowl_LIX_Security_February_2025_-_108.jpg",
  "nfl-buccaneers":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Raymond_James_Stadium_Aerial_%282%29.jpg/330px-Raymond_James_Stadium_Aerial_%282%29.jpg",
  // NFC West
  "nfl-cardinals":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/State_Farm_Stadium_2022.jpg/330px-State_Farm_Stadium_2022.jpg",
  "nfl-rams":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/SoFi_Stadium_2023.jpg/330px-SoFi_Stadium_2023.jpg",
  "nfl-49ers":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg/330px-Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg",
  "nfl-seahawks":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/2026_FIFA_World_Cup_-_Belgium_v._Egypt_in_Seattle_-_04.jpg/330px-2026_FIFA_World_Cup_-_Belgium_v._Egypt_in_Seattle_-_04.jpg",
};

export function getPhotoUrl(stadiumId: string): string | undefined {
  return PHOTO_MAP[stadiumId];
}
