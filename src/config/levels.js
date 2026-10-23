// All names, palettes and tuning are provisional creative choices.
export const MANES = [
  "#f78eb8",
  "#aa79e3",
  "#72c9f0",
  "#ffda67",
  "#8ed7ac",
  "#ffac70",
  "#f27786",
  "#57d4ce",
  "#c2a3eb",
  "rainbow",
  "#b6e4bd",
  "#3b9f73",
  "#518ae8",
  "#e96798",
  "#249eae",
  "#b94350",
  "#a86e43",
  "#6765b5",
  "#3d92d6",
  "#b96d80",
];
const worlds = [
  [
    "Rainbow Meadow",
    "Blossom",
    "meadow",
    "#bce5f1",
    "#89c9a0",
    "#f9dfba",
    "#4d9569",
    "#f7a3c2",
  ],
  [
    "Enchanted Forest",
    "Violet",
    "forest",
    "#b4d9d6",
    "#569783",
    "#e9d3b2",
    "#3c7767",
    "#caa0e7",
  ],
  [
    "Cloud Kingdom",
    "Skye",
    "cloud",
    "#a9d8f3",
    "#dceefa",
    "#fff3e0",
    "#bdd8f4",
    "#7cbfea",
  ],
  [
    "Fairy Castle",
    "Sunny",
    "castle",
    "#cbe8f0",
    "#98c5a5",
    "#e9d8e5",
    "#a0a3d4",
    "#ffd478",
  ],
  [
    "Candy Wonderland",
    "Clover",
    "candy",
    "#f5d5e3",
    "#c4ddb7",
    "#f4e5c9",
    "#efb5c9",
    "#88d3b3",
  ],
  [
    "Crystal Caves",
    "Amber",
    "crystal",
    "#383b73",
    "#555f87",
    "#aba5c6",
    "#8f91de",
    "#ffb77c",
  ],
  [
    "Butterfly Garden",
    "Rosie",
    "garden",
    "#c5e9e2",
    "#8bccb0",
    "#f8dfb6",
    "#55997e",
    "#f68e9c",
  ],
  [
    "Starlight Valley",
    "Ripple",
    "night",
    "#242c59",
    "#656398",
    "#c4b7db",
    "#8b7ebc",
    "#78dcd7",
  ],
  [
    "Rainbow Mountains",
    "Lilac",
    "mountain",
    "#c9e3f4",
    "#9cbdac",
    "#eee2e5",
    "#9b9cbb",
    "#cba8ef",
  ],
  [
    "Unicorn Palace",
    "Prism",
    "palace",
    "#c8e8f3",
    "#acd5ba",
    "#f9dfcc",
    "#c1b0db",
    "#ffd47a",
  ],
  ["Spooky House", "Boo", "spooky", "#34385e", "#787295", "#d8c6b0", "#60587b", "#ffc276"],
  ["Minecraft Meadow", "Pixel", "minecraft", "#a6d6f5", "#84b956", "#d2b48a", "#528340", "#69dcd2"],
  ["Pokémon Park", "Spark", "pokemon", "#b6e3ee", "#95c994", "#f5deb5", "#5ba68a", "#ef8793"],
  ["Candy Carnival", "Taffy", "carnival", "#f4cddd", "#9dccba", "#f5dba8", "#dca3bb", "#e96798"],
  ["Coral Lagoon", "Pearl", "underwater", "#59b2ca", "#8db9af", "#f0ddae", "#73aeb2", "#f1adba"],
  ["Christmas Village", "Holly", "christmas", "#a5c5df", "#d4e2e9", "#dcbda0", "#b0c5d3", "#c85b6b"],
  ["Pancake Picnic", "Maple", "breakfast", "#f4d8b4", "#e8dcb9", "#a9cfd1", "#d4bd91", "#cf8e64"],
  ["Big City Downtown", "Metro", "downtown", "#bbd9e7", "#adc2bb", "#96a9af", "#8aa9a6", "#e5b45e"],
  ["Thundermans Town", "Bolt", "thundermans", "#bbddeb", "#9bc6a2", "#f1d9af", "#6b9b86", "#e8b95d"],
  ["Fast Food Land", "Sesame", "fastfood", "#c8e4e6", "#aecab8", "#c3a6a1", "#79a897", "#ce685c"],
];
export const LEVELS = worlds.map(
  ([name, unicorn, theme, sky, ground, road, foliage, accent], i) => ({
    id: i,
    name,
    unicorn,
    theme,
    sky,
    ground,
    road,
    foliage,
    accent,
    mane: MANES[i],
    width: i === 0 ? 12 : 10.5,
    radius: 215 + i * 4,
    bends: 10 + i * 1.8,
    playerSpeed: 10,
    unicornSpeed: 10.18 + i * 0.035,
    lead: i === 0 ? 54 : 66 + i * 1.5,
    assistanceAfter: i === 0 ? 30 : 45,
    boostSpeed: i === 0 ? 4.6 : 2.5,
    boostDuration: 4,
  }),
);
export const CHARACTER = {
  coat: "#e8ad86",
  hair: "#ffcf53",
  dress: "#4399e2",
  skin: "#ffe0c3",
  wings: "#a9e1fa",
};
export const MAGIC = {
  waterCosmetic: true,
  sprayDuration: 1.3,
  sprayCooldown: 0.4,
  particles: 90,
};

export function coursePoint(level, s, lateral = 0) {
  const t = s / level.radius;
  const r =
    level.radius +
    Math.sin(t * 3 + level.id * 0.4) * level.bends +
    Math.sin(t * 5) * 4;
  const dr =
    3 * level.bends * Math.cos(t * 3 + level.id * 0.4) + 20 * Math.cos(t * 5);
  const x = Math.sin(t) * r,
    z = -Math.cos(t) * r;
  const tx = Math.cos(t) * r + Math.sin(t) * dr,
    tz = Math.sin(t) * r - Math.cos(t) * dr;
  const norm = Math.hypot(tx, tz),
    fx = tx / norm,
    fz = tz / norm;
  const h =
    (level.theme === "mountain" ? 2.5 : level.theme === "cloud" ? 1.2 : 0.35) *
    Math.sin(t * 4);
  // In a chase camera, forward × up is screen-right: (-fz, 0, fx).
  return {
    x: x - fz * lateral,
    y: h,
    z: z + fx * lateral,
    fx,
    fz,
    yaw: Math.atan2(fx, fz),
  };
}

export function courseItems(level) {
  const items = [];
  const length = Math.PI * 2 * level.radius;
  for (let s = 30, k = 0; s < length; s += level.id === 0 ? 47 : 63, k++) {
    items.push({
      id: `p${k}`,
      kind: "potion",
      s,
      lane: [0, -2.6, 2.6, 0, 1.6, -1.6][k % 6],
      radius: 1.9,
    });
    if (k % 3 === 1)
      items.push({
        id: `j${k}`,
        kind: k % 2 ? "puddle" : "log",
        s: s + 18,
        lane: [0, 2.5, -2.5][Math.floor(k / 3) % 3],
        radius: 1.8,
      });
    if (k % 4 === 2)
      items.push({
        id: `o${k}`,
        kind: level.theme === "crystal" ? "crystal" : "tree",
        s: s + 25,
        lane: Math.floor(k / 4) % 2 ? -2.7 : 2.7,
        radius: 1.2,
      });
  }
  return items;
}
