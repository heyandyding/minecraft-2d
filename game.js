const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const canvasFrame = document.querySelector(".canvas-frame");
const fullscreenToggle = document.getElementById("fullscreen-toggle");

const TILE_SIZE = 32;
const CHUNK_WIDTH = 16;
const WORLD_HEIGHT = 256;
const SURFACE_BASE_Y = 72;
const SEA_LEVEL_Y = 78;
const INITIAL_CHUNK_RADIUS = 5;
const STREAM_CHUNK_RADIUS = 7;
const GRAVITY = 1900;
const PLAYER_SPEED = 235;
const JUMP_VELOCITY = -720;
const REACH = TILE_SIZE * 4.4;
const ZOMBIE_SPEED = 54;
const CREEPER_SPEED = 42;
const HOSTILE_SIGHT_RANGE = 480;
const SWIM_SPEED = 148;
const SWIM_ASCENT = 1280;
const SWIM_GRAVITY = 220;
const WATER_DRAG = 0.9;
const WATER_BUOYANCY = 280;
const WATER_FLOW_INTERVAL_MS = 250;
const WATER_MAX_LEVEL = 8;
const PLAYER_MAX_AIR_MS = 15000;
const DROWNING_TICK_MS = 1000;
const SKY_TOP = "#07101c";
const SKY_BOTTOM = "#11253d";
const STAR_SEED = 64;
const BLOCK_ITEMS = new Set(["dirt", "stone", "wood", "planks", "craftingTable"]);
const HUNGER_TICK_MS = 13000;
const STARVATION_TICK_MS = 4600;
const STARVATION_GRACE_MS = 120000;
const EXPLOSION_RADIUS = 122;
const PICKUP_SIZE = 14;
const VILLAGE_COUNT = 2;
const FISH_TARGET_COUNT = 7;
const MOB_DESPAWN_DISTANCE = 1200;
const WORLD_SEED = 104729;
const MOB_CAP_NEAR_PLAYER = 70;
const MOB_DESPAWN_TILES = 128;

const BLOCKS = {
  grass: { color: "#58b55f", solid: true, item: "dirt", label: "Grass" },
  dirt: { color: "#8a5a36", solid: true, item: "dirt", label: "Dirt" },
  stone: { color: "#7a7f8f", solid: true, item: "stone", label: "Stone" },
  sand: { color: "#d8c27a", solid: true, item: "dirt", label: "Sand" },
  gravel: { color: "#8c8f95", solid: true, item: "stone", label: "Gravel" },
  clay: { color: "#8aa6bf", solid: true, item: "dirt", label: "Clay" },
  deepslate: { color: "#4b505d", solid: true, item: "stone", label: "Deepslate" },
  bedrock: { color: "#2c2e33", solid: true, item: null, label: "Bedrock" },
  wood: { color: "#8f643a", solid: true, item: "wood", label: "Wood" },
  leaves: { color: "#2c7b4f", solid: true, item: null, label: "Leaves" },
  planks: { color: "#bf8c56", solid: true, item: "planks", label: "Planks" },
  water: { color: "#2c87c8", solid: false, item: null, label: "Water" },
  cactus: { color: "#2e8a42", solid: true, item: "wood", label: "Cactus" },
  snow: { color: "#eef8ff", solid: false, item: null, label: "Snow" },
  fern: { color: "#3d9c62", solid: false, item: null, label: "Fern" },
  wildflower: { color: "#ff88a7", solid: false, item: null, label: "Wildflower" },
  sunbloom: { color: "#ffd86f", solid: false, item: null, label: "Sunbloom" },
  cattail: { color: "#6b8d3a", solid: false, item: null, label: "Cattail" },
  chest: { color: "#a56d3a", solid: true, item: null, label: "Chest" },
  openedChest: { color: "#876145", solid: true, item: null, label: "Opened Chest" },
  craftingTable: {
    color: "#a06c3f",
    solid: true,
    item: "craftingTable",
    label: "Crafting Table",
  },
};

const HOTBAR = [
  "dirt",
  "stone",
  "wood",
  "planks",
  "craftingTable",
  "woodenSword",
  "woodenAxe",
  "woodenPickaxe",
  "woodenShovel",
];

const ITEM_COLORS = {
  dirt: "#8a5a36",
  stone: "#7a7f8f",
  wood: "#8f643a",
  planks: "#bf8c56",
  sticks: "#c9a16d",
  craftingTable: "#a06c3f",
  furnace: "#6f7480",
  chest: "#8d5d33",
  food: "#f4c46c",
  fishSmall: "#88d7ee",
  fishLarge: "#4eb0d1",
  woodenSword: "#e6d2ad",
  woodenAxe: "#dca469",
  woodenPickaxe: "#c7bc8a",
  woodenShovel: "#b47d56",
};

const ITEM_LABELS = {
  dirt: "Dirt",
  stone: "Stone",
  wood: "Wood",
  planks: "Planks",
  sticks: "Sticks",
  craftingTable: "Crafting Table",
  furnace: "Furnace",
  chest: "Chest",
  food: "Food",
  fishSmall: "Small Fish",
  fishLarge: "Large Fish",
  woodenSword: "Wood Sword",
  woodenAxe: "Wood Axe",
  woodenPickaxe: "Wood Pickaxe",
  woodenShovel: "Wood Shovel",
};

const EDIBLE_VALUES = {
  food: 1,
  fishSmall: 2,
  fishLarge: 3,
};

const MOB_DROP_TABLES = {
  zombie: [
    { item: "food", amount: 1 },
    { item: "wood", amount: 1 },
  ],
  creeper: [
    { item: "food", amount: 1 },
    { item: "stone", amount: 2 },
  ],
  skeleton: [
    { item: "stone", amount: 1 },
    { item: "wood", amount: 1 },
  ],
  spider: [{ item: "food", amount: 1 }],
  slime: [{ item: "food", amount: 1 }],
  enderman: [
    { item: "stone", amount: 1 },
    { item: "wood", amount: 1 },
  ],
  cow: [{ item: "food", amount: 2 }],
  pig: [{ item: "food", amount: 2 }],
  sheep: [{ item: "food", amount: 1 }],
  chicken: [{ item: "food", amount: 1 }],
  villager: [],
};

const HOSTILE_TYPES = ["zombie", "creeper", "skeleton", "spider", "slime", "enderman"];
const PASSIVE_TYPES = ["villager", "cow", "pig", "sheep", "chicken"];
const MOB_TYPES = [...HOSTILE_TYPES, ...PASSIVE_TYPES];

const MOB_BASE_DEFS = {
  zombie: {
    temperament: "hostile",
    hp: 20,
    speed: 54,
    width: 22,
    height: 30,
    contactDamage: 1,
    detectionRange: 40 * TILE_SIZE,
    attackRange: 26,
    despawnDistance: MOB_DESPAWN_TILES * TILE_SIZE,
  },
  creeper: {
    temperament: "hostile",
    hp: 20,
    speed: 42,
    width: 22,
    height: 30,
    contactDamage: 0,
    detectionRange: 16 * TILE_SIZE,
    attackRange: 3 * TILE_SIZE,
    despawnDistance: MOB_DESPAWN_TILES * TILE_SIZE,
  },
  skeleton: {
    temperament: "hostile",
    hp: 20,
    speed: 48,
    width: 22,
    height: 30,
    contactDamage: 1,
    preferredRange: 9 * TILE_SIZE,
    detectionRange: 16 * TILE_SIZE,
    attackRange: 10 * TILE_SIZE,
    projectileCooldownMs: 1700,
    projectileDamage: 1,
    despawnDistance: MOB_DESPAWN_TILES * TILE_SIZE,
  },
  spider: {
    temperament: "neutral",
    hp: 16,
    speed: 78,
    width: 30,
    height: 18,
    contactDamage: 1,
    leapVelocity: -360,
    detectionRange: 16 * TILE_SIZE,
    attackRange: 34,
    despawnDistance: MOB_DESPAWN_TILES * TILE_SIZE,
  },
  slime: {
    temperament: "hostile",
    hp: 16,
    speed: 42,
    width: 26,
    height: 20,
    contactDamage: 1,
    jumpVelocity: -250,
    detectionRange: 10 * TILE_SIZE,
    attackRange: 30,
    despawnDistance: MOB_DESPAWN_TILES * TILE_SIZE,
  },
  enderman: {
    temperament: "neutral",
    hp: 40,
    speed: 84,
    width: 22,
    height: 38,
    contactDamage: 2,
    teleportCooldownMs: 2200,
    detectionRange: 32 * TILE_SIZE,
    attackRange: 34,
    despawnDistance: MOB_DESPAWN_TILES * TILE_SIZE,
  },
  villager: { temperament: "passive", hp: 20, speed: 34, width: 22, height: 30, contactDamage: 0, despawnDistance: Infinity },
  cow: { temperament: "passive", hp: 10, speed: 30, width: 30, height: 22, contactDamage: 0, despawnDistance: MOB_DESPAWN_TILES * TILE_SIZE },
  pig: { temperament: "passive", hp: 10, speed: 34, width: 28, height: 20, contactDamage: 0, despawnDistance: MOB_DESPAWN_TILES * TILE_SIZE },
  sheep: { temperament: "passive", hp: 8, speed: 30, width: 28, height: 22, contactDamage: 0, despawnDistance: MOB_DESPAWN_TILES * TILE_SIZE },
  chicken: { temperament: "passive", hp: 4, speed: 40, width: 18, height: 18, contactDamage: 0, despawnDistance: MOB_DESPAWN_TILES * TILE_SIZE },
};

const CHEST_LOOT_TABLE = [
  { item: "food", min: 1, max: 3, weight: 4 },
  { item: "wood", min: 2, max: 4, weight: 4 },
  { item: "stone", min: 2, max: 5, weight: 4 },
  { item: "planks", min: 2, max: 4, weight: 3 },
  { item: "woodenSword", min: 1, max: 1, weight: 1 },
  { item: "woodenAxe", min: 1, max: 1, weight: 1 },
  { item: "woodenPickaxe", min: 1, max: 1, weight: 1 },
];

const RECIPES = {
  planks: {
    key: "planks",
    needsTable: false,
    cost: { wood: 1 },
    gain: { planks: 4 },
    success: "Crafted 4 planks.",
  },
  sticks: {
    key: "sticks",
    needsTable: false,
    cost: { planks: 2 },
    gain: { sticks: 4 },
    success: "Crafted 4 sticks.",
  },
  craftingTable: {
    key: "craftingTable",
    needsTable: false,
    cost: { planks: 4 },
    gain: { craftingTable: 1 },
    success: "Crafted a crafting table.",
  },
  woodenSword: {
    key: "woodenSword",
    needsTable: true,
    cost: { planks: 2, sticks: 1 },
    gain: { woodenSword: 1 },
    success: "Crafted a wooden sword.",
  },
  woodenAxe: {
    key: "woodenAxe",
    needsTable: true,
    cost: { planks: 3, sticks: 2 },
    gain: { woodenAxe: 1 },
    success: "Crafted a wooden axe.",
  },
  woodenPickaxe: {
    key: "woodenPickaxe",
    needsTable: true,
    cost: { planks: 3, sticks: 2 },
    gain: { woodenPickaxe: 1 },
    success: "Crafted a wooden pickaxe.",
  },
  woodenShovel: {
    key: "woodenShovel",
    needsTable: true,
    cost: { planks: 1, sticks: 2 },
    gain: { woodenShovel: 1 },
    success: "Crafted a wooden shovel.",
  },
  furnace: {
    key: "furnace",
    needsTable: true,
    cost: { stone: 8 },
    gain: { furnace: 1 },
    success: "Crafted a furnace.",
  },
  chest: {
    key: "chest",
    needsTable: true,
    cost: { planks: 8 },
    gain: { chest: 1 },
    success: "Crafted a chest.",
  },
};

const BIOMES = {
  plains: {
    surfaceTile: "grass",
    subsurfaceTiles: ["dirt", "dirt", "dirt", "dirt", "gravel", "dirt", "clay", "gravel", "dirt", "stone"],
    surfaceNoiseScale: 0.055,
    amplitude: 4,
    baseY: SURFACE_BASE_Y,
    treeChance: 0.045,
    surfacePlantChance: 0.11,
    oceanFloor: false,
  },
  desert: {
    surfaceTile: "sand",
    subsurfaceTiles: ["sand", "sand", "sand", "sand", "sand", "sand", "gravel", "sand", "sand", "stone"],
    surfaceNoiseScale: 0.045,
    amplitude: 3,
    baseY: SURFACE_BASE_Y + 2,
    treeChance: 0,
    surfacePlantChance: 0,
    oceanFloor: false,
  },
  forest: {
    surfaceTile: "grass",
    subsurfaceTiles: ["dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "clay", "gravel", "dirt", "stone"],
    surfaceNoiseScale: 0.065,
    amplitude: 6,
    baseY: SURFACE_BASE_Y - 2,
    treeChance: 0.18,
    surfacePlantChance: 0.16,
    oceanFloor: false,
  },
  mountains: {
    surfaceTile: "stone",
    subsurfaceTiles: ["stone", "stone", "stone", "gravel", "stone", "stone", "stone", "stone", "deepslate", "stone"],
    surfaceNoiseScale: 0.08,
    amplitude: 18,
    baseY: SURFACE_BASE_Y - 16,
    treeChance: 0.02,
    surfacePlantChance: 0.02,
    oceanFloor: false,
  },
  ocean: {
    surfaceTile: "sand",
    subsurfaceTiles: ["sand", "sand", "sand", "clay", "sand", "gravel", "sand", "clay", "sand", "stone"],
    surfaceNoiseScale: 0.05,
    amplitude: 5,
    baseY: SEA_LEVEL_Y + 8,
    treeChance: 0,
    surfacePlantChance: 0.03,
    oceanFloor: true,
  },
};

const state = {
  world: new Map(),
  water: new Map(),
  hostiles: [],
  fish: [],
  pickups: [],
  projectiles: [],
  stars: [],
  player: null,
  camera: { x: 0, y: 0 },
  input: { left: false, right: false, jumpHeld: false },
  mouse: { x: 0, y: 0 },
  selectedSlot: 0,
  hoverTile: null,
  message: "",
  messageUntil: 0,
  isDead: false,
  craftingOpen: false,
  startSelectionOpen: false,
  deathBiomeSelectionOpen: false,
  spawnChoices: [],
  biomeChoices: [],
  spawnTimers: { zombie: 0, creeper: 0, skeleton: 0, spider: 0, slime: 0, enderman: 0, fish: 0 },
  lastFrame: performance.now(),
  spawnPoint: { x: 12 * TILE_SIZE, y: 9 * TILE_SIZE },
  villageRanges: [],
  loadedChunkMin: 0,
  loadedChunkMax: 0,
  waterFlowAt: performance.now(),
};

let selectionOverlay = null;
let selectionOverlayComputeScheduled = false;
let selectionOverlaySignature = "";

function isFullscreenActive() {
  return document.fullscreenElement || document.webkitFullscreenElement;
}

async function toggleFullscreen() {
  if (!canvasFrame) {
    return;
  }

  try {
    if (isFullscreenActive()) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else if (canvasFrame.requestFullscreen) {
      await canvasFrame.requestFullscreen();
    } else if (canvasFrame.webkitRequestFullscreen) {
      canvasFrame.webkitRequestFullscreen();
    }
  } catch (_error) {
    showMessage("Fullscreen was blocked by the browser.");
  }
}

function syncFullscreenButton() {
  if (!fullscreenToggle) {
    return;
  }
  fullscreenToggle.textContent = isFullscreenActive() ? "Exit Fullscreen" : "Fullscreen";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function ensureSelectionOverlay() {
  if (selectionOverlay) {
    return selectionOverlay;
  }

  selectionOverlay = document.getElementById("selection-overlay");
  if (!selectionOverlay) {
    selectionOverlay = document.createElement("div");
    selectionOverlay.id = "selection-overlay";
    document.body.appendChild(selectionOverlay);
  }
  return selectionOverlay;
}

function renderSelectionOverlay() {
  const overlay = ensureSelectionOverlay();
  const activeChoices = state.startSelectionOpen ? state.spawnChoices : state.deathBiomeSelectionOpen ? state.biomeChoices : null;
  if (!activeChoices) {
    overlay.hidden = true;
    selectionOverlaySignature = "";
    return;
  }

  const title = state.startSelectionOpen ? "Choose Your Spawn Point" : "Choose a Respawn Biome";
  const subtitle = state.startSelectionOpen
    ? "Every biome is listed. Unavailable ones are disabled."
    : "Pick the biome you want to respawn into.";
  const signature = JSON.stringify({
    mode: state.startSelectionOpen ? "start" : "death",
    choices: activeChoices.map((choice) => ({
      biomeId: choice.biomeId,
      available: choice.available,
      x: choice.x,
      y: choice.y,
    })),
  });

  overlay.hidden = false;
  const titleEl = document.getElementById("selection-title");
  const subtitleEl = document.getElementById("selection-subtitle");
  const grid = document.getElementById("selection-grid");
  if (!titleEl || !subtitleEl || !grid) {
    return;
  }
  if (selectionOverlaySignature === signature) {
    return;
  }
  selectionOverlaySignature = signature;
  titleEl.textContent = title;
  subtitleEl.textContent = subtitle;
  grid.innerHTML = "";
  activeChoices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.disabled = !choice.available;
    button.className = "selection-card";
    button.innerHTML = `
      <div style="font-size:19px; font-weight:700; margin-bottom:8px; text-transform:capitalize;">${choice.biomeId}</div>
      <div style="font-size:13px; color:${choice.available ? "#c7d7ea" : "#7d8591"};">
        ${choice.available ? `Spawn X ${Math.round(choice.x / TILE_SIZE)} · Y ${Math.round(choice.y / TILE_SIZE)}` : "No valid spawn found"}
      </div>
    `;
    if (choice.available) {
      button.addEventListener("click", () => chooseSpawnPoint(choice));
    }
    grid.appendChild(button);
  });
}

function scheduleSelectionOverlayRefresh(referenceX = 8) {
  if (selectionOverlayComputeScheduled) {
    return;
  }
  selectionOverlayComputeScheduled = true;
  window.setTimeout(() => {
    selectionOverlayComputeScheduled = false;
    if (state.startSelectionOpen) {
      refreshSpawnChoices();
    } else if (state.deathBiomeSelectionOpen) {
      refreshDeathBiomeChoices(referenceX);
    }
    renderSelectionOverlay();
  }, 20);
}

function floorDiv(value, divisor) {
  return Math.floor(value / divisor);
}

function mod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function hash1d(value) {
  const raw = Math.sin(value * 127.1 + WORLD_SEED * 0.131) * 43758.5453123;
  return raw - Math.floor(raw);
}

function valueNoise1d(x) {
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const t = x - x0;
  const smooth = t * t * (3 - 2 * t);
  return hash1d(x0) * (1 - smooth) + hash1d(x1) * smooth;
}

function signedNoise1d(x, frequency = 1, amplitude = 1) {
  return (valueNoise1d(x * frequency) * 2 - 1) * amplitude;
}

function biomeNoise(x) {
  return valueNoise1d((x + WORLD_SEED * 0.37) * 0.04);
}

function getBiomeIdAtX(worldX) {
  const noise = biomeNoise(worldX / CHUNK_WIDTH);
  if (noise < 0.32) {
    return "ocean";
  }
  if (noise < 0.45) {
    return "desert";
  }
  if (noise < 0.69) {
    return "plains";
  }
  if (noise < 0.84) {
    return "forest";
  }
  return "mountains";
}

function getBiomeAtX(worldX) {
  return BIOMES[getBiomeIdAtX(worldX)];
}

function tileToChunkX(tileX) {
  return floorDiv(tileX, CHUNK_WIDTH);
}

function getLoadedTileBounds() {
  return {
    min: state.loadedChunkMin * CHUNK_WIDTH,
    max: (state.loadedChunkMax + 1) * CHUNK_WIDTH - 1,
  };
}

function getLoadedPixelBounds() {
  const tileBounds = getLoadedTileBounds();
  return {
    min: tileBounds.min * TILE_SIZE,
    max: (tileBounds.max + 1) * TILE_SIZE,
  };
}

function tileKey(x, y) {
  return `${x},${y}`;
}

function getWaterData(x, y) {
  return state.water.get(tileKey(x, y)) || null;
}

function getWaterLevel(x, y) {
  return getWaterData(x, y)?.level ?? 0;
}

function isWaterSource(x, y) {
  return Boolean(getWaterData(x, y)?.source);
}

function setWaterState(x, y, level, source = false) {
  if (y < 0 || y >= WORLD_HEIGHT) {
    return;
  }
  state.water.set(tileKey(x, y), { level: clamp(level, 1, WATER_MAX_LEVEL), source });
  const chunkX = tileToChunkX(x);
  const chunk = ensureChunkGenerated(chunkX);
  chunk[y][mod(x, CHUNK_WIDTH)] = "water";
}

function clearWaterState(x, y) {
  state.water.delete(tileKey(x, y));
  if (getTile(x, y) === "water") {
    const chunkX = tileToChunkX(x);
    const chunk = ensureChunkGenerated(chunkX);
    chunk[y][mod(x, CHUNK_WIDTH)] = null;
  }
}

function canWaterOccupy(tile) {
  return !tile || (!BLOCKS[tile].solid && tile !== "water");
}

function isWashAwayBlock(tile) {
  return tile === "fern" || tile === "wildflower" || tile === "sunbloom" || tile === "cattail" || tile === "snow";
}

function setWaterTile(x, y, level = 1, source = false) {
  const existingTile = getTile(x, y);
  if (existingTile && existingTile !== "water" && !canWaterOccupy(existingTile)) {
    return false;
  }
  if (isWashAwayBlock(existingTile)) {
    setTile(x, y, null);
  }
  setWaterState(x, y, level, source);
  return true;
}

function createEmptyChunk() {
  return Array.from({ length: WORLD_HEIGHT }, () => Array(CHUNK_WIDTH).fill(null));
}

function getChunk(chunkX) {
  return state.world.get(chunkX);
}

function setChunk(chunkX, tiles) {
  state.world.set(chunkX, tiles);
  state.loadedChunkMin = Math.min(state.loadedChunkMin, chunkX);
  state.loadedChunkMax = Math.max(state.loadedChunkMax, chunkX);
}

function pickSubsurfaceTile(biome, depth) {
  return biome.subsurfaceTiles[Math.min(depth, biome.subsurfaceTiles.length - 1)];
}

function getSurfaceHeightForColumn(worldX, biome) {
  const primary = signedNoise1d(worldX + WORLD_SEED * 0.13, biome.surfaceNoiseScale, biome.amplitude);
  const secondary = signedNoise1d(worldX + WORLD_SEED * 0.41, biome.surfaceNoiseScale * 2.2, biome.amplitude * 0.45);
  let surfaceY = Math.round(biome.baseY + primary + secondary);
  if (biome === BIOMES.mountains) {
    surfaceY -= Math.max(0, signedNoise1d(worldX + WORLD_SEED * 0.91, 0.02, 14));
  }
  return clamp(surfaceY, 32, WORLD_HEIGHT - 18);
}

function decorateChunkSurface(chunkX, chunkTiles) {
  for (let localX = 0; localX < CHUNK_WIDTH; localX += 1) {
    const worldX = chunkX * CHUNK_WIDTH + localX;
    const biome = getBiomeAtX(worldX);
    let surfaceY = null;
    for (let y = 0; y < WORLD_HEIGHT; y += 1) {
      if (chunkTiles[y][localX] && BLOCKS[chunkTiles[y][localX]].solid) {
        surfaceY = y;
        break;
      }
    }
    if (surfaceY === null) {
      continue;
    }

    if (biome === BIOMES.mountains && surfaceY < SEA_LEVEL_Y - 18 && !chunkTiles[surfaceY - 1]?.[localX]) {
      chunkTiles[surfaceY - 1][localX] = "snow";
    }

    if (biome === BIOMES.desert && hash1d(worldX * 11.7) < 0.07 && surfaceY >= 3) {
      chunkTiles[surfaceY - 1][localX] = "cactus";
      if (surfaceY >= 4 && hash1d(worldX * 19.3) < 0.55) {
        chunkTiles[surfaceY - 2][localX] = "cactus";
      }
    }

    if (biome.treeChance > 0 && hash1d(worldX * 5.13) < biome.treeChance) {
      const trunkHeight = 4 + Math.floor(hash1d(worldX * 9.71) * 3);
      for (let i = 1; i <= trunkHeight; i += 1) {
        if (surfaceY - i > 1) {
          chunkTiles[surfaceY - i][localX] = "wood";
        }
      }

      const topY = surfaceY - trunkHeight;
      for (let leafY = topY - 2; leafY <= topY + 1; leafY += 1) {
        if (leafY < 0 || leafY >= WORLD_HEIGHT) {
          continue;
        }
        for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
          const leafWorldX = worldX + offsetX;
          const leafChunkX = tileToChunkX(leafWorldX);
          const leafChunk = leafChunkX === chunkX ? chunkTiles : getChunk(leafChunkX);
          if (!leafChunk) {
            continue;
          }
          const localLeafX = mod(leafWorldX, CHUNK_WIDTH);
          if (Math.abs(offsetX) + Math.abs(leafY - topY) < 4 && !leafChunk[leafY][localLeafX]) {
            leafChunk[leafY][localLeafX] = "leaves";
          }
        }
      }
    }
  }
}

function generateChunk(chunkX) {
  const chunkTiles = createEmptyChunk();
  for (let localX = 0; localX < CHUNK_WIDTH; localX += 1) {
    const worldX = chunkX * CHUNK_WIDTH + localX;
    const biome = getBiomeAtX(worldX);
    const surfaceY = getSurfaceHeightForColumn(worldX, biome);

    for (let y = surfaceY; y < WORLD_HEIGHT; y += 1) {
      const depth = y - surfaceY;
      let tile = biome.surfaceTile;

      if (depth === 0) {
        tile = biome.surfaceTile;
      } else if (depth <= 15) {
        tile = pickSubsurfaceTile(biome, depth - 1);
      } else if (depth <= 180) {
        tile = "stone";
      } else if (depth <= 230) {
        tile = "deepslate";
      } else {
        tile = "bedrock";
      }

      chunkTiles[y][localX] = tile;
    }

    if (biome.oceanFloor) {
      for (let y = surfaceY - 1; y >= 0 && y >= SEA_LEVEL_Y - 1; y -= 1) {
        chunkTiles[y][localX] = "water";
      }
    }
  }

  setChunk(chunkX, chunkTiles);
  for (let localX = 0; localX < CHUNK_WIDTH; localX += 1) {
    const worldX = chunkX * CHUNK_WIDTH + localX;
    for (let y = 0; y < WORLD_HEIGHT; y += 1) {
      if (chunkTiles[y][localX] === "water") {
        state.water.set(tileKey(worldX, y), { level: 1, source: true });
      }
    }
  }
  decorateChunkSurface(chunkX, chunkTiles);
  return chunkTiles;
}

function ensureChunkGenerated(chunkX) {
  return getChunk(chunkX) || generateChunk(chunkX);
}

function ensureChunksForTileRange(minTileX, maxTileX) {
  const minChunk = tileToChunkX(minTileX);
  const maxChunk = tileToChunkX(maxTileX);
  for (let chunkX = minChunk; chunkX <= maxChunk; chunkX += 1) {
    ensureChunkGenerated(chunkX);
  }
}

function ensureChunksAroundPlayer() {
  const playerTileX = Math.floor((state.player.x + state.player.width / 2) / TILE_SIZE);
  ensureChunksForTileRange(
    playerTileX - STREAM_CHUNK_RADIUS * CHUNK_WIDTH,
    playerTileX + STREAM_CHUNK_RADIUS * CHUNK_WIDTH,
  );
}

function createStars() {
  state.stars = Array.from({ length: STAR_SEED }, () => ({
    x: rand(-2400, 2400),
    y: Math.random() * canvas.height * 0.55,
    radius: Math.random() * 1.8 + 0.4,
    alpha: Math.random() * 0.5 + 0.35,
  }));
}

function getHeadTile(entity) {
  return worldToTile(entity.x + entity.width / 2, entity.y + 2);
}

function getWaterFlowVectorAtTile(x, y) {
  const data = getWaterData(x, y);
  if (!data) {
    return { x: 0, y: 0 };
  }

  const belowTile = getTile(x, y + 1);
  const belowWater = getWaterData(x, y + 1);
  if (!data.source && !belowWater && canWaterOccupy(belowTile)) {
    return { x: 0, y: 1 };
  }
  return { x: 0, y: 0 };
}

function applyWaterCurrent(entity, horizontalForce, verticalForce) {
  if (!entity.inWater) {
    return;
  }
  const centerTile = worldToTile(entity.x + entity.width / 2, entity.y + entity.height / 2);
  const flow = getWaterFlowVectorAtTile(centerTile.x, centerTile.y);
  entity.vx += flow.x * horizontalForce;
  if (flow.y > 0) {
    entity.vy += verticalForce;
  }
}

function recomputeWaterFlow() {
  for (const [key, data] of state.water.entries()) {
    if (data.source) {
      continue;
    }
    const [xText, yText] = key.split(",");
    const x = Number(xText);
    const y = Number(yText);
    const supportedBySource =
      isWaterSource(x, y - 1) ||
      isWaterSource(x - 1, y) ||
      isWaterSource(x + 1, y);
    if (!supportedBySource) {
      clearWaterState(x, y);
    }
  }
}

function updateWater(now) {
  if (now < state.waterFlowAt) {
    return;
  }
  recomputeWaterFlow();
  state.waterFlowAt = now + WATER_FLOW_INTERVAL_MS;
}

function setTile(x, y, tile) {
  if (y < 0 || y >= WORLD_HEIGHT) {
    return;
  }
  if (tile !== "water") {
    state.water.delete(tileKey(x, y));
  }
  const chunkX = tileToChunkX(x);
  const chunk = ensureChunkGenerated(chunkX);
  chunk[y][mod(x, CHUNK_WIDTH)] = tile;
  if (tile === "water" && !getWaterData(x, y)) {
    state.water.set(tileKey(x, y), { level: WATER_MAX_LEVEL, source: false });
  }
}

function getTile(x, y) {
  if (y < 0) {
    return null;
  }
  if (y >= WORLD_HEIGHT) {
    return "bedrock";
  }
  const chunkX = tileToChunkX(x);
  const chunk = ensureChunkGenerated(chunkX);
  return chunk[y][mod(x, CHUNK_WIDTH)];
}

function isSolidTile(x, y) {
  const tile = getTile(x, y);
  return tile ? BLOCKS[tile].solid : false;
}

function isWaterTile(x, y) {
  return getTile(x, y) === "water";
}

function getSurfaceY(x) {
  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    const tile = getTile(x, y);
    if (tile && BLOCKS[tile].solid) {
      return y;
    }
  }
  return WORLD_HEIGHT - 1;
}

function getTopTile(x) {
  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    const tile = getTile(x, y);
    if (tile) {
      return tile;
    }
  }
  return null;
}

function refillColumn(x, surfaceY) {
  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    if (y < surfaceY) {
      setTile(x, y, null);
    } else if (y === surfaceY) {
      setTile(x, y, "grass");
    } else if (y < surfaceY + 4) {
      setTile(x, y, "dirt");
    } else {
      setTile(x, y, "stone");
    }
  }
}

function raiseGround(x, newSurfaceY) {
  const surfaceY = clamp(newSurfaceY, 12, WORLD_HEIGHT - 7);
  refillColumn(x, surfaceY);
}

function flattenArea(startX, endX, targetY) {
  for (let x = startX; x <= endX; x += 1) {
    raiseGround(x, targetY);
  }
}

function buildHouse(baseX, groundY, width, height, withChest = false) {
  const roofY = groundY - height - 1;
  const doorX = baseX + Math.floor(width / 2);
  const chestX = baseX + 1;

  for (let y = roofY - 1; y <= groundY; y += 1) {
    for (let x = baseX - 1; x <= baseX + width; x += 1) {
      if (y < groundY) {
        setTile(x, y, null);
      }
    }
  }

  for (let x = baseX; x < baseX + width; x += 1) {
    setTile(x, groundY, "planks");
  }

  for (let y = groundY - 1; y >= groundY - height; y -= 1) {
    for (let x = baseX; x < baseX + width; x += 1) {
      const isEdge = x === baseX || x === baseX + width - 1;
      const isDoor =
        x === doorX &&
        (y === groundY - 1 || y === groundY - 2);
      const isWindow =
        (x === baseX + 1 || x === baseX + width - 2) &&
        y === groundY - 3;

      if (isDoor || isWindow) {
        setTile(x, y, null);
      } else if (isEdge) {
        setTile(x, y, "wood");
      } else {
        setTile(x, y, "planks");
      }
    }
  }

  for (let x = baseX - 1; x <= baseX + width; x += 1) {
    setTile(x, roofY, "wood");
  }
  for (let x = baseX; x < baseX + width; x += 1) {
    setTile(x, roofY - 1, "wood");
  }

  if (withChest) {
    setTile(chestX, groundY - 1, "chest");
  }
}

function findVillageSite(villageRanges, preferredCenter) {
  const candidates = [];
  const loadedBounds = getLoadedTileBounds();
  const startMin = 30;
  const startMax = loadedBounds.max - 42;
  const preferredStart = clamp(Math.round(preferredCenter) - 15, startMin, startMax);
  const starts = [];

  for (let offset = -12; offset <= 12; offset += 2) {
    starts.push(clamp(preferredStart + offset, startMin, startMax));
  }
  for (let startX = startMin; startX < startMax; startX += 2) {
    starts.push(startX);
  }

  for (const startX of [...new Set(starts)]) {
    const endX = startX + 30;
    const overlapsVillage = villageRanges.some(
      (range) => startX <= range.end + 18 && endX >= range.start - 18,
    );
    if (overlapsVillage) {
      continue;
    }

    let minY = WORLD_HEIGHT;
    let maxY = 0;
    let hasWater = false;
    for (let x = startX; x <= endX; x += 1) {
      const surfaceY = getSurfaceY(x);
      minY = Math.min(minY, surfaceY);
      maxY = Math.max(maxY, surfaceY);
      if (isWaterTile(x, surfaceY)) {
        hasWater = true;
      }
    }

    if (!hasWater && maxY - minY <= 8 && minY > 16 && maxY < WORLD_HEIGHT - 10) {
      candidates.push({ startX, endX, targetY: Math.round((minY + maxY) / 2) });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function buildVillage(site) {
  flattenArea(site.startX, site.endX, site.targetY);

  for (let x = site.startX; x <= site.endX; x += 1) {
    setTile(x, site.targetY, x % 5 === 0 ? "planks" : "dirt");
  }

  const houseOffsets = [2, 12, 22];
  const chestHouseIndex = Math.random() < 0.2 ? Math.floor(Math.random() * houseOffsets.length) : -1;
  houseOffsets.forEach((offset, index) => {
    const width = 6 + (index % 2);
    const height = 4 + (index % 2);
    buildHouse(site.startX + offset, site.targetY - 1, width, height, index === chestHouseIndex);
  });

  setTile(site.startX + 9, site.targetY - 1, "craftingTable");
}

function carveLake(centerX, centerY, radiusX, radiusY) {
  for (let y = centerY - radiusY - 1; y <= centerY + radiusY + 1; y += 1) {
    for (let x = centerX - radiusX - 1; x <= centerX + radiusX + 1; x += 1) {
      const distance =
        (x - centerX) ** 2 / (radiusX * radiusX) +
        (y - centerY) ** 2 / (radiusY * radiusY);
      if (distance <= 1.15) {
        if (y < centerY + radiusY - 1) {
          setTile(x, y, null);
        } else {
          setTile(x, y, "water");
        }
      }
    }
  }
}

function addWaterFeatures(villageRanges) {
  const loadedBounds = getLoadedTileBounds();
  for (let i = 0; i < 4; i += 1) {
    let centerX = loadedBounds.min + 26 + Math.floor(Math.random() * Math.max(1, loadedBounds.max - loadedBounds.min - 52));
    let attempts = 0;
    while (
      villageRanges.some((range) => centerX >= range.start - 8 && centerX <= range.end + 8) &&
      attempts < 10
    ) {
      centerX = loadedBounds.min + 26 + Math.floor(Math.random() * Math.max(1, loadedBounds.max - loadedBounds.min - 52));
      attempts += 1;
    }

    const centerY = getSurfaceY(centerX) + 2;
    carveLake(
      centerX,
      centerY,
      3 + Math.floor(Math.random() * 3),
      2 + Math.floor(Math.random() * 2),
    );
  }

  let riverY = getSurfaceY(18) + 3;
  for (let x = loadedBounds.min + 12; x < loadedBounds.max - 12; x += 1) {
    const blockedByVillage = villageRanges.some((range) => x >= range.start - 4 && x <= range.end + 4);
    if (blockedByVillage) {
      continue;
    }

    riverY += Math.floor(rand(-1.2, 1.21));
    riverY = clamp(riverY, 22, WORLD_HEIGHT - 9);
    const halfWidth = x % 17 === 0 ? 3 : 2;

    for (let offsetX = -halfWidth; offsetX <= halfWidth; offsetX += 1) {
      const channelX = x + offsetX;
      const depth = 2 + Math.abs(offsetX);
      for (let y = riverY - 2; y <= riverY + depth; y += 1) {
        setTile(channelX, y, y >= riverY ? "water" : null);
      }
    }
  }
}

function generateWorld() {
  state.world = new Map();
  state.water = new Map();
  state.loadedChunkMin = 0;
  state.loadedChunkMax = 0;
  state.villageRanges = [];

  for (let chunkX = -INITIAL_CHUNK_RADIUS; chunkX <= INITIAL_CHUNK_RADIUS; chunkX += 1) {
    ensureChunkGenerated(chunkX);
  }

  const spawnX = 8;
  const spawnY = getSurfaceY(spawnX);
  state.spawnPoint = {
    x: spawnX * TILE_SIZE,
    y: (spawnY - 3) * TILE_SIZE,
  };
  state.waterFlowAt = performance.now() + WATER_FLOW_INTERVAL_MS;
}

function findFreshSpawnPoint(referenceX = 8) {
  const loadedBounds = getLoadedTileBounds();
  const attempts = [];
  for (let radius = 0; radius < 18; radius += 1) {
    attempts.push(referenceX + radius * 7);
    attempts.push(referenceX - radius * 7);
  }

  for (const candidate of attempts) {
    const tileX = clamp(Math.round(candidate), loadedBounds.min + 3, loadedBounds.max - 3);
    const surfaceY = getSurfaceY(tileX);
    if (getTopTile(tileX) === "water") {
      continue;
    }
    if (!isSolidTile(tileX, surfaceY)) {
      continue;
    }
    return {
      x: tileX * TILE_SIZE,
      y: (surfaceY - 3) * TILE_SIZE,
    };
  }

  return {
    x: referenceX * TILE_SIZE,
    y: (getSurfaceY(referenceX) - 3) * TILE_SIZE,
  };
}

function findSpawnPointForBiome(biomeId, referenceX = 8) {
  const loadedBounds = getLoadedTileBounds();
  const matches = [];
  for (let x = loadedBounds.min + 3; x <= loadedBounds.max - 3; x += 2) {
    if (getBiomeIdAtX(x) !== biomeId) {
      continue;
    }
    const surfaceY = getSurfaceY(x);
    if (getTopTile(x) === "water" || !isSolidTile(x, surfaceY)) {
      continue;
    }

    let shorelineScore = 0;
    if (biomeId === "ocean") {
      const nearbyWater =
        isWaterTile(x - 1, surfaceY) ||
        isWaterTile(x + 1, surfaceY) ||
        isWaterTile(x - 2, surfaceY) ||
        isWaterTile(x + 2, surfaceY) ||
        isWaterTile(x - 1, surfaceY + 1) ||
        isWaterTile(x + 1, surfaceY + 1);
      const sandyEdge =
        getTile(x, surfaceY) === "sand" ||
        getTile(x - 1, surfaceY) === "sand" ||
        getTile(x + 1, surfaceY) === "sand";
      if (!nearbyWater) {
        continue;
      }
      shorelineScore = sandyEdge ? 0 : 120;
    }

    matches.push({ x, surfaceY, distance: Math.abs(x - referenceX) + shorelineScore });
  }

  matches.sort((a, b) => a.distance - b.distance);
  const pick = matches[0];
  if (!pick) {
    return createGuaranteedSpawnForBiome(biomeId);
  }
  return {
    biomeId,
    x: pick.x * TILE_SIZE,
    y: (pick.surfaceY - 3) * TILE_SIZE,
  };
}

function createGuaranteedSpawnForBiome(biomeId) {
  const biome = BIOMES[biomeId] || BIOMES.plains;
  const loadedBounds = getLoadedTileBounds();
  const biomeOffsets = { plains: 48, forest: 112, desert: 176, mountains: 240, ocean: 304 };
  const centerX = loadedBounds.max + (biomeOffsets[biomeId] || 48);
  ensureChunksForTileRange(centerX - 32, centerX + 32);

  const surfaceYMap = {
    plains: SURFACE_BASE_Y,
    forest: SURFACE_BASE_Y - 2,
    desert: SURFACE_BASE_Y + 2,
    mountains: SURFACE_BASE_Y - 18,
    ocean: SEA_LEVEL_Y + 6,
  };
  const surfaceY = surfaceYMap[biomeId] ?? SURFACE_BASE_Y;

  for (let x = centerX - 8; x <= centerX + 8; x += 1) {
    for (let y = 0; y < WORLD_HEIGHT; y += 1) {
      if (y < surfaceY) {
        setTile(x, y, null);
      } else if (y === surfaceY) {
        setTile(x, y, biomeId === "mountains" ? "stone" : biome.surfaceTile);
      } else if (y < surfaceY + 5) {
        setTile(x, y, biome.subsurfaceTiles[Math.min(y - surfaceY - 1, biome.subsurfaceTiles.length - 1)]);
      } else if (y <= 230) {
        setTile(x, y, "stone");
      } else {
        setTile(x, y, "bedrock");
      }
    }
  }

  if (biomeId === "forest") {
    for (let y = surfaceY - 1; y >= surfaceY - 5; y -= 1) {
      setTile(centerX, y, "wood");
    }
    for (let y = surfaceY - 6; y <= surfaceY - 3; y += 1) {
      for (let x = centerX - 2; x <= centerX + 2; x += 1) {
        if (Math.abs(x - centerX) + Math.abs(y - (surfaceY - 4)) < 4) {
          setTile(x, y, "leaves");
        }
      }
    }
  }

  if (biomeId === "mountains") {
    for (let x = centerX - 4; x <= centerX + 4; x += 1) {
      setTile(x, surfaceY - 1, "snow");
    }
  }

  if (biomeId === "ocean") {
    for (let x = centerX - 3; x <= centerX + 8; x += 1) {
      const slopeY = surfaceY + Math.max(0, x - centerX);
      for (let y = 0; y < WORLD_HEIGHT; y += 1) {
        if (y < slopeY) {
          setTile(x, y, null);
        } else if (y === slopeY) {
          setTile(x, y, "sand");
        } else if (y < slopeY + 4) {
          setTile(x, y, "sand");
        } else if (y <= 230) {
          setTile(x, y, "stone");
        } else {
          setTile(x, y, "bedrock");
        }
      }
    }

    for (let x = centerX + 4; x <= centerX + 8; x += 1) {
      const waterTop = SEA_LEVEL_Y - 1;
      const waterBottom = SEA_LEVEL_Y + 2 + Math.max(0, x - (centerX + 6));
      for (let y = waterTop; y <= waterBottom; y += 1) {
        setWaterTile(x, y, 1, true);
      }
    }
  }

  return {
    biomeId,
    x: centerX * TILE_SIZE,
    y: (surfaceY - 3) * TILE_SIZE,
    available: true,
  };
}

function ensureBiomeSpawnCoverage(referenceX = 8) {
  const needed = ["plains", "forest", "desert", "mountains", "ocean"];
  for (let radius = INITIAL_CHUNK_RADIUS + 1; radius <= INITIAL_CHUNK_RADIUS + 24; radius += 1) {
    const choices = needed.map((biomeId) => findSpawnPointForBiome(biomeId, referenceX));
    if (choices.every(Boolean)) {
      return;
    }
    ensureChunksForTileRange(-radius * CHUNK_WIDTH, radius * CHUNK_WIDTH);
  }
}

function getAvailableBiomeChoices(referenceX = 8) {
  return ["plains", "forest", "desert", "mountains", "ocean"].map((biomeId) => ({
    ...findSpawnPointForBiome(biomeId, referenceX),
    available: true,
  }));
}

function refreshSpawnChoices() {
  ensureBiomeSpawnCoverage(8);
  state.spawnChoices = getAvailableBiomeChoices(8);
}

function refreshDeathBiomeChoices(referenceX) {
  ensureBiomeSpawnCoverage(referenceX);
  state.biomeChoices = getAvailableBiomeChoices(referenceX);
}

function chooseSpawnPoint(choice) {
  if (!choice.available && (choice.x === undefined || choice.y === undefined)) {
    return;
  }
  state.spawnPoint = { x: choice.x, y: choice.y };
  state.craftingOpen = false;
  if (!state.player) {
    state.player = createPlayer();
  } else {
    state.player.x = choice.x;
    state.player.y = choice.y;
    state.player.vx = 0;
    state.player.vy = 0;
  }
  state.startSelectionOpen = false;
  state.deathBiomeSelectionOpen = false;
  state.isDead = false;
  state.player.inWater = false;
  state.player.airMs = state.player.maxAirMs;
  showMessage(`Spawned in ${choice.biomeId}.`, 1800);
  renderSelectionOverlay();
}

function carvePocket(startX, startY) {
  const radius = 2 + Math.floor(Math.random() * 2);
  for (let y = startY - radius; y <= startY + radius; y += 1) {
    for (let x = startX - radius; x <= startX + radius; x += 1) {
      if (Math.hypot(x - startX, y - startY) <= radius + Math.random() * 0.6) {
        setTile(x, y, null);
      }
    }
  }
}

function plantTree(x, groundY) {
  const trunkHeight = 3 + Math.floor(Math.random() * 3);
  for (let y = 1; y <= trunkHeight; y += 1) {
    setTile(x, groundY - y, "wood");
  }

  const topY = groundY - trunkHeight;
  for (let offsetY = -2; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
      if (Math.abs(offsetX) + Math.abs(offsetY) < 4) {
        setTile(x + offsetX, topY + offsetY, "leaves");
      }
    }
  }
}

function canPlantTree(x, groundY) {
  if (getTopTile(x) !== "grass") {
    return false;
  }

  for (let checkY = groundY - 7; checkY <= groundY; checkY += 1) {
    for (let checkX = x - 2; checkX <= x + 2; checkX += 1) {
      const tile = getTile(checkX, checkY);
      if (tile === "wood" || tile === "leaves") {
        return false;
      }
    }
  }

  return true;
}

function canPlacePlant(x, groundY) {
  return getTile(x, groundY) === "grass" && !getTile(x, groundY - 1);
}

function placeSurfacePlants(villageRanges) {
  const loadedBounds = getLoadedTileBounds();
  for (let x = loadedBounds.min + 5; x < loadedBounds.max - 5; x += 1) {
    const blockedByVillage = villageRanges.some((range) => x >= range.start - 3 && x <= range.end + 3);
    if (blockedByVillage) {
      continue;
    }

    const groundY = getSurfaceY(x);
    if (!canPlacePlant(x, groundY)) {
      continue;
    }

    const nearWater =
      isWaterTile(x - 1, groundY) ||
      isWaterTile(x + 1, groundY) ||
      isWaterTile(x - 1, groundY + 1) ||
      isWaterTile(x + 1, groundY + 1);
    const roll = Math.random();

    if (nearWater && roll < 0.22) {
      setTile(x, groundY - 1, "cattail");
    } else if (roll < 0.1) {
      setTile(x, groundY - 1, "fern");
    } else if (roll < 0.16) {
      setTile(x, groundY - 1, Math.random() < 0.55 ? "wildflower" : "sunbloom");
    }
  }
}

function collectWaterSpawnTiles() {
  const tiles = [];
  const loadedBounds = getLoadedTileBounds();
  for (let y = 3; y < WORLD_HEIGHT - 3; y += 1) {
    for (let x = loadedBounds.min + 4; x < loadedBounds.max - 4; x += 1) {
      if (!isWaterTile(x, y) || !isWaterTile(x, y + 1)) {
        continue;
      }

      const leftBlocked = isSolidTile(x - 1, y) && isSolidTile(x - 1, y + 1);
      const rightBlocked = isSolidTile(x + 1, y) && isSolidTile(x + 1, y + 1);
      if (leftBlocked && rightBlocked) {
        continue;
      }

      tiles.push({ x, y });
    }
  }

  return tiles;
}

function createFish(type, tileX, tileY) {
  const isLarge = type === "large";
  const width = isLarge ? 22 : 16;
  const height = isLarge ? 12 : 9;
  const speed = isLarge ? rand(26, 44) : rand(34, 58);

  return {
    type,
    item: isLarge ? "fishLarge" : "fishSmall",
    x: tileX * TILE_SIZE + rand(5, TILE_SIZE - width - 5),
    y: tileY * TILE_SIZE + rand(5, TILE_SIZE - height - 5),
    width,
    height,
    vx: (Math.random() < 0.5 ? -1 : 1) * speed,
    vy: rand(-18, 18),
    facing: Math.random() < 0.5 ? -1 : 1,
    speed,
    swimUntil: 0,
    caught: false,
  };
}

function spawnFishAtRandomWater(minPlayerDistance = 0) {
  const spawnTiles = collectWaterSpawnTiles().filter((tile) => {
    const worldX = tile.x * TILE_SIZE;
    return Math.abs(worldX - state.player.x) >= minPlayerDistance;
  });

  if (spawnTiles.length === 0) {
    return false;
  }

  const tile = spawnTiles[Math.floor(Math.random() * spawnTiles.length)];
  const type = Math.random() < 0.32 ? "large" : "small";
  state.fish.push(createFish(type, tile.x, tile.y));
  return true;
}

function populateFish() {
  state.fish = [];
  for (let i = 0; i < FISH_TARGET_COUNT; i += 1) {
    if (!spawnFishAtRandomWater(180)) {
      break;
    }
  }
}

function createInventory() {
  return {
    dirt: 0,
    stone: 0,
    wood: 0,
    planks: 0,
    sticks: 0,
    craftingTable: 0,
    furnace: 0,
    chest: 0,
    woodenSword: 0,
    woodenAxe: 0,
    woodenPickaxe: 0,
    woodenShovel: 0,
    food: 0,
    fishSmall: 0,
    fishLarge: 0,
  };
}

function createPlayer() {
  const now = performance.now();
  return {
    x: state.spawnPoint.x,
    y: state.spawnPoint.y,
    vx: 0,
    vy: 0,
    width: 22,
    height: 30,
    onGround: false,
    inWater: false,
    facing: 1,
    hearts: 7,
    maxHearts: 7,
    hunger: 10,
    maxHunger: 10,
    hungerTickAt: now + HUNGER_TICK_MS,
    starvationGraceUntil: now + STARVATION_GRACE_MS,
    starvationTickAt: now + STARVATION_GRACE_MS,
    hurtUntil: 0,
    attackCooldownUntil: 0,
    airMs: PLAYER_MAX_AIR_MS,
    maxAirMs: PLAYER_MAX_AIR_MS,
    drowningAt: now + DROWNING_TICK_MS,
    inventory: createInventory(),
  };
}

function getMobDef(mob) {
  if (mob.type !== "slime") {
    return MOB_BASE_DEFS[mob.type];
  }

  const size = mob.slimeSize ?? 2;
  if (size === 2) {
    return { ...MOB_BASE_DEFS.slime, hp: 16, width: 26, height: 20, speed: 42, contactDamage: 1 };
  }
  if (size === 1) {
    return { ...MOB_BASE_DEFS.slime, hp: 4, width: 18, height: 14, speed: 52, contactDamage: 1 };
  }
  return { ...MOB_BASE_DEFS.slime, hp: 1, width: 12, height: 10, speed: 62, contactDamage: 0 };
}

function isHostileMob(mob) {
  return getMobDef(mob).temperament === "hostile";
}

function isPassiveMob(mob) {
  return getMobDef(mob).temperament === "passive";
}

function isProvoked(mob) {
  return isHostileMob(mob) || Boolean(mob.aggroUntil);
}

function isSpiderAggressive(mob) {
  return mob.type === "spider" ? isProvoked(mob) || mob.y > SEA_LEVEL_Y * TILE_SIZE : false;
}

function isMobAggressive(mob) {
  return mob.type === "spider" ? isSpiderAggressive(mob) : isProvoked(mob);
}

function createHostile(type, x, options = {}) {
  const baseDef = type === "slime"
    ? getMobDef({ type, slimeSize: options.slimeSize ?? 2 })
    : MOB_BASE_DEFS[type];
  const spawnTileX = Math.floor(x / TILE_SIZE);
  ensureChunksForTileRange(spawnTileX - CHUNK_WIDTH, spawnTileX + CHUNK_WIDTH);
  const spawnX = x;
  const surfaceY = getSurfaceY(Math.floor((spawnX + TILE_SIZE / 2) / TILE_SIZE));
  const homeX = options.homeX ?? spawnX;
  return {
    type,
    x: spawnX,
    y: Math.max(2 * TILE_SIZE, (surfaceY - Math.max(2, Math.ceil(baseDef.height / TILE_SIZE) + 2)) * TILE_SIZE),
    vx: 0,
    vy: 0,
    width: baseDef.width,
    height: baseDef.height,
    onGround: false,
    inWater: false,
    hp: baseDef.hp,
    maxHp: baseDef.hp,
    hurtUntil: 0,
    fuseUntil: 0,
    defeated: false,
    wanderDirection: Math.random() < 0.5 ? -1 : 1,
    wanderUntil: 0,
    attackCooldownUntil: 0,
    aggroUntil: isHostileMob({ type, slimeSize: options.slimeSize }) ? Infinity : 0,
    aiState: "IDLE",
    lostTargetAt: 0,
    fleeUntil: 0,
    homeX,
    homeMinX: options.homeMinX ?? homeX - 180,
    homeMaxX: options.homeMaxX ?? homeX + 180,
    slimeSize: type === "slime" ? options.slimeSize ?? 2 : undefined,
    waterDamageAt: 0,
    teleportCooldownUntil: 0,
  };
}

function spawnHostile(type, x) {
  state.hostiles.push(createHostile(type, x));
}

function spawnHostileWithOptions(type, x, options = {}) {
  state.hostiles.push(createHostile(type, x, options));
}

function spawnPassiveGroup(type, count, minX, maxX) {
  const loadedBounds = getLoadedTileBounds();
  const startX = minX ?? loadedBounds.min + 20;
  const endX = maxX ?? loadedBounds.max - 20;
  for (let i = 0; i < count; i += 1) {
    const tileX = Math.floor(rand(startX, endX));
    const surfaceY = getSurfaceY(tileX);
    const biomeId = getBiomeIdAtX(tileX);
    if (
      getTopTile(tileX) === "water" ||
      surfaceY <= 0 ||
      biomeId === "desert" ||
      biomeId === "ocean" ||
      biomeId === "mountains"
    ) {
      continue;
    }
    spawnHostile(type, tileX * TILE_SIZE);
  }
}

function spawnVillageMobs() {
  for (const range of state.villageRanges) {
    const villagerCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < villagerCount; i += 1) {
      const tileX = range.start + 3 + Math.floor(Math.random() * Math.max(1, range.end - range.start - 5));
      spawnHostileWithOptions("villager", tileX * TILE_SIZE, {
        homeX: tileX * TILE_SIZE,
        homeMinX: range.start * TILE_SIZE,
        homeMaxX: range.end * TILE_SIZE,
      });
    }
  }
}

function populateHostiles() {
  state.hostiles = [];
  spawnVillageMobs();
  spawnPassiveGroup("cow", 4);
  spawnPassiveGroup("pig", 4);
  spawnPassiveGroup("sheep", 5);
  spawnPassiveGroup("chicken", 5);
  for (let i = 0; i < 6; i += 1) {
    spawnHostile("zombie", (28 + i * 11) * TILE_SIZE);
  }
  spawnHostile("creeper", 52 * TILE_SIZE);
  for (let i = 0; i < 2; i += 1) {
    spawnHostile("skeleton", (64 + i * 22) * TILE_SIZE);
    spawnHostile("spider", (80 + i * 24) * TILE_SIZE);
  }
  spawnHostileWithOptions("slime", 106 * TILE_SIZE, { slimeSize: 2 });
}

function resetGame() {
  generateWorld();
  createStars();
  state.spawnPoint = findFreshSpawnPoint(8);
  state.player = createPlayer();
  populateFish();
  state.pickups = [];
  state.projectiles = [];
  state.selectedSlot = 0;
  state.isDead = false;
  state.spawnTimers = { zombie: 10, creeper: 22, skeleton: 18, spider: 16, slime: 45, enderman: 9999, fish: 10 };
  populateHostiles();
  state.spawnChoices = [
    { biomeId: "plains", available: false },
    { biomeId: "forest", available: false },
    { biomeId: "desert", available: false },
    { biomeId: "mountains", available: false },
    { biomeId: "ocean", available: false },
  ];
  state.startSelectionOpen = true;
  state.deathBiomeSelectionOpen = false;
  state.message = "Night falls fast. Hunt, swim, scout the villages, and survive the full Minecraft mob mix.";
  state.messageUntil = performance.now() + 5600;
  renderSelectionOverlay();
  scheduleSelectionOverlayRefresh(8);
}

function showMessage(text, duration = 2200) {
  state.message = text;
  state.messageUntil = performance.now() + duration;
}

function addInventoryItem(item, amount) {
  if (!amount) {
    return;
  }
  state.player.inventory[item] += amount;
}

function createPickup(item, amount, x, y) {
  return {
    item,
    amount,
    x,
    y,
    vx: rand(-38, 38),
    vy: rand(-180, -110),
    width: PICKUP_SIZE,
    height: PICKUP_SIZE,
    onGround: false,
    inWater: false,
  };
}

function spawnPickup(item, amount, x, y) {
  state.pickups.push(createPickup(item, amount, x, y));
}

function spawnPickupBurst(drops, x, y) {
  drops.forEach(({ item, amount }) => {
    spawnPickup(item, amount, x - PICKUP_SIZE / 2, y - PICKUP_SIZE / 2);
  });
}

function pickChestLoot() {
  const pool = CHEST_LOOT_TABLE.flatMap((entry) => Array(entry.weight).fill(entry));
  const chosen = [];
  const usedItems = new Set();
  const rollCount = 2 + Math.floor(Math.random() * 2);

  while (chosen.length < rollCount && pool.length > 0) {
    const entry = pool[Math.floor(Math.random() * pool.length)];
    if (usedItems.has(entry.item)) {
      continue;
    }
    usedItems.add(entry.item);
    const amount = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
    chosen.push({ item: entry.item, amount });
  }

  return chosen;
}

function worldToTile(px, py) {
  return {
    x: Math.floor(px / TILE_SIZE),
    y: Math.floor(py / TILE_SIZE),
  };
}

function rectIntersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function isEntityInWater(entity) {
  const left = Math.floor(entity.x / TILE_SIZE);
  const right = Math.floor((entity.x + entity.width - 1) / TILE_SIZE);
  const top = Math.floor(entity.y / TILE_SIZE);
  const bottom = Math.floor((entity.y + entity.height - 1) / TILE_SIZE);

  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      if (!isWaterTile(x, y)) {
        continue;
      }

      const tileRect = {
        x: x * TILE_SIZE,
        y: y * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
      };
      if (rectIntersects(entity, tileRect)) {
        return true;
      }
    }
  }

  return false;
}

function hasLineOfSight(fromEntity, toEntity) {
  const fromX = fromEntity.x + fromEntity.width / 2;
  const fromY = fromEntity.y + fromEntity.height / 2;
  const toX = toEntity.x + toEntity.width / 2;
  const toY = toEntity.y + toEntity.height / 2;
  const distance = Math.hypot(toX - fromX, toY - fromY);

  if (distance > HOSTILE_SIGHT_RANGE) {
    return false;
  }

  const steps = Math.max(1, Math.ceil(distance / (TILE_SIZE / 3)));
  for (let step = 1; step < steps; step += 1) {
    const t = step / steps;
    const sampleX = fromX + (toX - fromX) * t;
    const sampleY = fromY + (toY - fromY) * t;
    const tile = worldToTile(sampleX, sampleY);
    if (isSolidTile(tile.x, tile.y)) {
      return false;
    }
  }

  return true;
}

function getCollisionTiles(entity) {
  const left = Math.floor(entity.x / TILE_SIZE);
  const right = Math.floor((entity.x + entity.width - 1) / TILE_SIZE);
  const top = Math.floor(entity.y / TILE_SIZE);
  const bottom = Math.floor((entity.y + entity.height - 1) / TILE_SIZE);
  const tiles = [];

  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      if (isSolidTile(x, y)) {
        tiles.push({ x, y });
      }
    }
  }

  return tiles;
}

function moveEntity(entity, dt) {
  entity.x += entity.vx * dt;
  let collisions = getCollisionTiles(entity);
  for (const tile of collisions) {
    const tileRect = {
      x: tile.x * TILE_SIZE,
      y: tile.y * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
    };
    if (!rectIntersects(entity, tileRect)) {
      continue;
    }
    if (entity.vx > 0) {
      entity.x = tileRect.x - entity.width;
    } else if (entity.vx < 0) {
      entity.x = tileRect.x + tileRect.width;
    }
    entity.vx = 0;
  }

  entity.y += entity.vy * dt;
  entity.onGround = false;
  collisions = getCollisionTiles(entity);
  for (const tile of collisions) {
    const tileRect = {
      x: tile.x * TILE_SIZE,
      y: tile.y * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
    };
    if (!rectIntersects(entity, tileRect)) {
      continue;
    }
    if (entity.vy > 0) {
      entity.y = tileRect.y - entity.height;
      entity.onGround = true;
    } else if (entity.vy < 0) {
      entity.y = tileRect.y + tileRect.height;
    }
    entity.vy = 0;
  }
}

function updatePlayer(dt, now) {
  const player = state.player;
  player.inWater = isEntityInWater(player);
  const maxMoveSpeed = player.inWater ? SWIM_SPEED : PLAYER_SPEED;

  if (state.input.left) {
    player.vx = -maxMoveSpeed;
    player.facing = -1;
  } else if (state.input.right) {
    player.vx = maxMoveSpeed;
    player.facing = 1;
  } else {
    player.vx *= player.inWater ? WATER_DRAG : 0.78;
    if (Math.abs(player.vx) < 6) {
      player.vx = 0;
    }
  }

  if (state.input.jumpHeld && player.inWater) {
    player.vy = -260;
  } else if (state.input.jumpHeld && player.onGround) {
    player.vy = JUMP_VELOCITY;
    player.onGround = false;
  }

  player.vy += (player.inWater ? SWIM_GRAVITY : GRAVITY) * dt;
  if (player.inWater) {
    player.vy -= WATER_BUOYANCY * dt;
    player.vy = clamp(player.vy, -320, 160);
    player.vx *= 0.98;
    applyWaterCurrent(player, 5, 22);
  }
  moveEntity(player, dt);
  player.inWater = isEntityInWater(player);
  const headTile = getHeadTile(player);
  const headInWater = isWaterTile(headTile.x, headTile.y);

  if (headInWater) {
    player.airMs = Math.max(0, player.airMs - dt * 1000);
    if (player.airMs === 0 && now >= player.drowningAt) {
      damagePlayer(1, 0, "You are drowning.");
      player.drowningAt = now + DROWNING_TICK_MS;
    }
  } else {
    player.airMs = player.maxAirMs;
    player.drowningAt = now + DROWNING_TICK_MS;
  }

  while (now >= player.hungerTickAt) {
    player.hunger = Math.max(0, player.hunger - 1);
    player.hungerTickAt += HUNGER_TICK_MS;
  }

  if (
    player.hunger <= 0 &&
    now >= player.starvationGraceUntil &&
    now >= player.starvationTickAt
  ) {
    damagePlayer(1, 0, "You are starving.");
    player.starvationTickAt = now + STARVATION_TICK_MS;
  }

  if (player.y > WORLD_HEIGHT * TILE_SIZE + 160) {
    damagePlayer(1, 0, "You fell into the dark.");
    respawnPlayer();
  }

  if (player.hurtUntil < now) {
    player.hurtUntil = 0;
  }
}

function respawnPlayer() {
  state.spawnPoint = findFreshSpawnPoint(Math.floor(state.player.x / TILE_SIZE) + 10);
  state.player.x = state.spawnPoint.x;
  state.player.y = state.spawnPoint.y;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.inWater = false;
  state.player.airMs = state.player.maxAirMs;
  state.player.drowningAt = performance.now() + DROWNING_TICK_MS;
}

function respawnAfterDeath() {
  if (!state.isDead || !state.deathBiomeSelectionOpen) {
    return;
  }
  showMessage("Choose a biome to respawn.", 2200);
}

function updatePickups(dt) {
  for (const pickup of state.pickups) {
    pickup.inWater = isEntityInWater(pickup);
    pickup.vy += (pickup.inWater ? SWIM_GRAVITY : GRAVITY) * dt * 0.55;
    if (pickup.inWater) {
      pickup.vy -= WATER_BUOYANCY * dt * 0.35;
      pickup.vy = clamp(pickup.vy, -110, 110);
      pickup.vx *= 0.98;
      applyWaterCurrent(pickup, 4, 12);
    } else {
      pickup.vy = clamp(pickup.vy, -260, 340);
    }

    moveEntity(pickup, dt);

    if (pickup.onGround) {
      pickup.vx *= 0.75;
    }

    if (rectIntersects(state.player, pickup)) {
      addInventoryItem(pickup.item, pickup.amount);
      pickup.collected = true;
      showMessage(`Picked up ${pickup.amount} ${ITEM_LABELS[pickup.item].toLowerCase()}.`, 1200);
    }
  }

  state.pickups = state.pickups.filter((pickup) => !pickup.collected);
}

function moveFish(fish, dt) {
  const nextX = fish.x + fish.vx * dt;
  const nextCenterX = nextX + fish.width / 2;
  const currentCenterY = fish.y + fish.height / 2;
  const nextXTile = worldToTile(nextCenterX, currentCenterY);

  if (isWaterTile(nextXTile.x, nextXTile.y)) {
    fish.x = nextX;
  } else {
    fish.facing *= -1;
    fish.vx *= -1;
  }

  const nextY = fish.y + fish.vy * dt;
  const currentCenterX = fish.x + fish.width / 2;
  const nextYTile = worldToTile(currentCenterX, nextY + fish.height / 2);
  if (isWaterTile(nextYTile.x, nextYTile.y)) {
    fish.y = nextY;
  } else {
    fish.vy *= -0.7;
  }
}

function updateFish(dt, now) {
  const playerCenterX = state.player.x + state.player.width / 2;
  const playerCenterY = state.player.y + state.player.height / 2;

  for (const fish of state.fish) {
    const fishCenterX = fish.x + fish.width / 2;
    const fishCenterY = fish.y + fish.height / 2;
    const dx = fishCenterX - playerCenterX;
    const dy = fishCenterY - playerCenterY;
    const playerNear = Math.abs(dx) < 140 && Math.abs(dy) < 90;

    if (playerNear) {
      fish.facing = dx >= 0 ? 1 : -1;
      fish.speed = fish.type === "large" ? 72 : 92;
      fish.vx = fish.facing * fish.speed;
      fish.vy += (dy >= 0 ? 1 : -1) * 220 * dt;
      fish.swimUntil = now + 650;
    } else if (now >= fish.swimUntil) {
      fish.facing = Math.random() < 0.5 ? -1 : 1;
      fish.speed = fish.type === "large" ? rand(26, 44) : rand(34, 58);
      fish.vx = fish.facing * fish.speed;
      fish.vy = rand(-18, 18);
      fish.swimUntil = now + rand(900, 2300);
    } else {
      fish.vx += (fish.facing * fish.speed - fish.vx) * Math.min(1, dt * 3.5);
      fish.vy += rand(-24, 24) * dt;
    }

    fish.vy = clamp(fish.vy, -38, 38);
    moveFish(fish, dt);
  }

  state.spawnTimers.fish -= dt;
  if (state.fish.length < FISH_TARGET_COUNT && state.spawnTimers.fish <= 0 && !state.isDead) {
    if (spawnFishAtRandomWater(220)) {
      state.spawnTimers.fish = 12;
    } else {
      state.spawnTimers.fish = 18;
    }
  }
}

function dropHostileLoot(hostile, reasonText) {
  if (hostile.defeated) {
    return;
  }

  hostile.defeated = true;
  hostile.hp = 0;
  const drops = MOB_DROP_TABLES[hostile.type] || [];
  spawnPickupBurst(drops, hostile.x + hostile.width / 2, hostile.y + hostile.height / 2);
  const healed = drops.length > 0 && state.player.hearts < state.player.maxHearts;
  if (healed) {
    state.player.hearts += 1;
  }
  const baseText = reasonText || `${hostile.type} dropped loot.`;
  showMessage(healed ? `${baseText} Restored 1 heart.` : baseText, 1900);
}

function openChest(tileX, tileY) {
  if (getTile(tileX, tileY) !== "chest") {
    return false;
  }

  const loot = pickChestLoot();
  setTile(tileX, tileY, "openedChest");
  spawnPickupBurst(
    loot,
    tileX * TILE_SIZE + TILE_SIZE / 2,
    tileY * TILE_SIZE + TILE_SIZE / 2,
  );
  showMessage("Opened chest and spilled useful loot.");
  return true;
}

function getBestEdible() {
  const missingHunger = state.player.maxHunger - state.player.hunger;
  const choices = Object.entries(EDIBLE_VALUES)
    .filter(([item]) => state.player.inventory[item] > 0)
    .map(([item, restore]) => ({
      item,
      restore,
      waste: Math.max(0, restore - missingHunger),
    }))
    .sort((a, b) => a.waste - b.waste || a.restore - b.restore);

  return choices[0] || null;
}

function consumeFood() {
  if (state.isDead) {
    return;
  }

  if (state.player.hunger >= state.player.maxHunger) {
    showMessage("Food bar is already full.");
    return;
  }

  const edible = getBestEdible();
  if (!edible) {
    showMessage("No food or fish to eat.");
    return;
  }

  const now = performance.now();
  state.player.inventory[edible.item] -= 1;
  state.player.hunger = Math.min(state.player.maxHunger, state.player.hunger + edible.restore);
  state.player.hungerTickAt = Math.max(state.player.hungerTickAt, now) + 2200;
  state.player.starvationGraceUntil = now + STARVATION_GRACE_MS;
  state.player.starvationTickAt = state.player.starvationGraceUntil;
  showMessage(`Ate ${ITEM_LABELS[edible.item].toLowerCase()} for ${edible.restore} food.`);
}

function damagePlayer(amount, sourceDirection, messageText) {
  const now = performance.now();
  const player = state.player;
  if (player.hurtUntil > now || state.isDead) {
    return;
  }

  player.hearts -= amount;
  player.hurtUntil = now + 900;
  player.vx = sourceDirection * 240;
  player.vy = -240;

  if (player.hearts <= 0) {
    player.hearts = 0;
    state.isDead = true;
    state.biomeChoices = [
      { biomeId: "plains", available: false },
      { biomeId: "forest", available: false },
      { biomeId: "desert", available: false },
      { biomeId: "mountains", available: false },
      { biomeId: "ocean", available: false },
    ];
    state.deathBiomeSelectionOpen = true;
    showMessage("You were overwhelmed. Choose a biome to respawn.", 100000);
    renderSelectionOverlay();
    scheduleSelectionOverlayRefresh(Math.floor(player.x / TILE_SIZE));
    return;
  }

  if (messageText) {
    showMessage(messageText, 1400);
  }
}

function getSelectedItem() {
  return HOTBAR[state.selectedSlot];
}

function getHostileCounts() {
  return state.hostiles.reduce(
    (counts, hostile) => {
      if (counts[hostile.type] !== undefined) {
        counts[hostile.type] += 1;
      }
      return counts;
    },
    {
      zombie: 0,
      creeper: 0,
      skeleton: 0,
      spider: 0,
      slime: 0,
      enderman: 0,
      villager: 0,
      cow: 0,
      pig: 0,
      sheep: 0,
      chicken: 0,
    },
  );
}

function getMobCountNearPlayer(maxDistance = MOB_DESPAWN_TILES * TILE_SIZE) {
  return state.hostiles.filter((mob) => Math.abs(mob.x - state.player.x) <= maxDistance).length;
}

function canSpawnMobAt(type, candidateX) {
  const tileX = Math.floor(candidateX / TILE_SIZE);
  const surfaceY = getSurfaceY(tileX);
  const biomeId = getBiomeIdAtX(tileX);
  if (surfaceY <= 0 || getTopTile(tileX) === "water") {
    return false;
  }

  if (PASSIVE_TYPES.includes(type)) {
    return biomeId === "plains" || biomeId === "forest";
  }

  if (type === "slime") {
    return biomeId === "ocean" || surfaceY > SEA_LEVEL_Y + 18;
  }

  return true;
}

function spawnHostileNearPlayer(type) {
  if (getMobCountNearPlayer() >= MOB_CAP_NEAR_PLAYER) {
    return;
  }
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const distanceMap = {
      zombie: rand(420, 700),
      creeper: rand(520, 820),
      skeleton: rand(460, 760),
      spider: rand(360, 620),
      slime: rand(420, 720),
      enderman: rand(620, 1020),
    };
    const distance = distanceMap[type] || rand(440, 760);
    const candidateX = state.player.x + side * distance;
    const spacedEnough = state.hostiles.every((hostile) => Math.abs(hostile.x - candidateX) > 180);
    if (spacedEnough && canSpawnMobAt(type, candidateX)) {
      spawnHostile(type, candidateX);
      return;
    }
  }
  const fallbackX = state.player.x + rand(-760, 760);
  if (canSpawnMobAt(type, fallbackX)) {
    spawnHostile(type, fallbackX);
  }
}

function canMobSeePlayer(mob, player) {
  if (mob.type === "enderman" && !isProvoked(mob)) {
    const mobCenterX = mob.x + mob.width / 2;
    const playerCenterX = player.x + player.width / 2;
    const playerFacingMob = Math.sign(mobCenterX - playerCenterX) === player.facing;
    const alignedY = Math.abs(mob.y - player.y) < 42;
    if (playerFacingMob && alignedY && Math.abs(mobCenterX - playerCenterX) < 220 && hasLineOfSight(mob, player)) {
      mob.aggroUntil = performance.now() + 8000;
      return true;
    }
  }

  const detectionRange = getMobDef(mob).detectionRange ?? HOSTILE_SIGHT_RANGE;
  const distance = Math.abs((player.x + player.width / 2) - (mob.x + mob.width / 2));
  if (distance > detectionRange) {
    return false;
  }

  return hasLineOfSight(mob, player) && isMobAggressive(mob);
}

function damageMob(mob, amount, now, reasonText) {
  mob.hp -= amount;
  mob.hurtUntil = now + 180;
  mob.fleeUntil = now + 2600;
  mob.aiState = "ALERT";

  if (mob.type === "enderman" || mob.type === "spider") {
    mob.aggroUntil = now + 9000;
  }

  if (mob.hp > 0) {
    return false;
  }

  if (mob.type === "slime" && (mob.slimeSize ?? 2) > 0) {
    const nextSize = (mob.slimeSize ?? 2) - 1;
    if (nextSize >= 0) {
      const splitCount = nextSize === 0 ? 2 : 3;
      for (let i = 0; i < splitCount; i += 1) {
        spawnHostileWithOptions("slime", mob.x + rand(-12, 12), {
          slimeSize: nextSize,
          homeX: mob.x,
          homeMinX: mob.x - 120,
          homeMaxX: mob.x + 120,
        });
      }
      showMessage("Slime split into smaller cubes.", 1600);
    }
  }

  dropHostileLoot(mob, reasonText);
  return true;
}

function createProjectile(source, targetX, targetY) {
  const originX = source.x + source.width / 2;
  const originY = source.y + source.height / 2 - 4;
  const angle = Math.atan2(targetY - originY, targetX - originX);
  const speed = 360;
  return {
    type: "arrow",
    ownerType: source.type,
    x: originX,
    y: originY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    width: 12,
    height: 3,
    alive: true,
  };
}

function teleportMobToGround(mob, desiredX) {
  const clampedX = desiredX;
  const tileX = Math.floor((clampedX + mob.width / 2) / TILE_SIZE);
  ensureChunksForTileRange(tileX - CHUNK_WIDTH, tileX + CHUNK_WIDTH);
  const surfaceY = getSurfaceY(tileX);
  if (getTopTile(tileX) === "water") {
    return false;
  }

  mob.x = clampedX;
  mob.y = Math.max(TILE_SIZE, (surfaceY - Math.ceil(mob.height / TILE_SIZE) - 1) * TILE_SIZE);
  mob.vx = 0;
  mob.vy = 0;
  return true;
}

function moveMobOutOfWater(mob) {
  for (let radius = 2; radius <= 24; radius += 2) {
    for (const direction of [-1, 1]) {
      const tileX = Math.floor((mob.x + mob.width / 2) / TILE_SIZE) + radius * direction;
      ensureChunksForTileRange(tileX - CHUNK_WIDTH, tileX + CHUNK_WIDTH);
      const surfaceY = getSurfaceY(tileX);
      if (getTopTile(tileX) === "water" || !isSolidTile(tileX, surfaceY)) {
        continue;
      }
      mob.x = tileX * TILE_SIZE;
      mob.y = Math.max(TILE_SIZE, (surfaceY - Math.ceil(mob.height / TILE_SIZE) - 1) * TILE_SIZE);
      mob.vx = 0;
      mob.vy = 0;
      mob.inWater = false;
      return true;
    }
  }
  return false;
}

function updateProjectiles(dt, now) {
  for (const projectile of state.projectiles) {
    projectile.vy += GRAVITY * dt * 0.18;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;

    const tile = worldToTile(projectile.x, projectile.y);
    if (isSolidTile(tile.x, tile.y) || isWaterTile(tile.x, tile.y)) {
      projectile.alive = false;
      continue;
    }

    if (
      projectile.x < -64 ||
      projectile.y < -64 ||
      projectile.y > WORLD_HEIGHT * TILE_SIZE + 64
    ) {
      projectile.alive = false;
      continue;
    }

    if (
      rectIntersects(projectile, state.player) &&
      projectile.ownerType !== "player"
    ) {
      damagePlayer(1, projectile.vx > 0 ? 1 : -1, "Skeleton arrow hit you.");
      projectile.alive = false;
    }
  }

  state.projectiles = state.projectiles.filter((projectile) => projectile.alive);
}

function explodeCreeper(hostile, now) {
  if (hostile.hp <= 0) {
    return;
  }

  const centerX = hostile.x + hostile.width / 2;
  const centerY = hostile.y + hostile.height / 2;
  const tileCenter = worldToTile(centerX, centerY);
  const playerCenterX = state.player.x + state.player.width / 2;
  const playerCenterY = state.player.y + state.player.height / 2;
  const playerDistance = Math.hypot(playerCenterX - centerX, playerCenterY - centerY);

  if (playerDistance < EXPLOSION_RADIUS) {
    const playerDamage = playerDistance < 70 ? 2 : 1;
    damagePlayer(playerDamage, playerCenterX < centerX ? -1 : 1, "Creeper exploded.");
  }

  for (const other of state.hostiles) {
    if (other === hostile) {
      continue;
    }

    const otherCenterX = other.x + other.width / 2;
    const otherCenterY = other.y + other.height / 2;
    const distance = Math.hypot(otherCenterX - centerX, otherCenterY - centerY);
    if (distance > EXPLOSION_RADIUS) {
      continue;
    }

    const blastDamage = other.type === "creeper" ? 9 : 6;
    other.hurtUntil = now + 200;
    other.vx = (otherCenterX < centerX ? -1 : 1) * 180;
    other.vy = -180;

    if (other.type === "creeper" && other.hp - blastDamage > 0) {
      other.fuseUntil = Math.min(other.fuseUntil || now + 350, now + 350);
    }

    damageMob(other, blastDamage, now, `${other.type} was caught in the blast and dropped loot.`);
  }

  for (let y = tileCenter.y - 2; y <= tileCenter.y + 2; y += 1) {
    for (let x = tileCenter.x - 2; x <= tileCenter.x + 2; x += 1) {
      if (Math.hypot(x - tileCenter.x, y - tileCenter.y) <= 2.05) {
        const tile = getTile(x, y);
        if (tile && tile !== "craftingTable" && tile !== "water") {
          setTile(x, y, null);
        }
      }
    }
  }

  dropHostileLoot(hostile, "Creeper exploded and dropped loot.");
  showMessage("Creeper exploded and tore open the terrain, but the water held.", 2200);
}

function updateHostiles(dt, now) {
  const player = state.player;

  for (const hostile of state.hostiles) {
    const def = getMobDef(hostile);
    hostile.inWater = isEntityInWater(hostile);
    if (hostile.inWater && hostile.type !== "zombie") {
      moveMobOutOfWater(hostile);
      hostile.inWater = isEntityInWater(hostile);
    }
    const dx = player.x - hostile.x;
    const absDx = Math.abs(dx);
    const canSeePlayer = canMobSeePlayer(hostile, player);
    const attackRange = def.attackRange ?? 28;
    const speed = def.speed * (hostile.inWater ? 0.6 : 1);
    let targetVx = 0;
    const playerInAttackRange = absDx <= attackRange && Math.abs(player.y - hostile.y) < 40;

    if (isPassiveMob(hostile) && now < hostile.fleeUntil) {
      hostile.aiState = "RETREAT";
    } else if (canSeePlayer && hostile.aiState === "IDLE") {
      hostile.aiState = "ALERT";
      hostile.lostTargetAt = 0;
    } else if (canSeePlayer && playerInAttackRange) {
      hostile.aiState = "ATTACK";
    } else if (canSeePlayer) {
      hostile.aiState = hostile.type === "skeleton" ? "RETREAT" : "CHASE";
    } else if (hostile.aiState !== "IDLE") {
      hostile.lostTargetAt = hostile.lostTargetAt || now;
      if (now - hostile.lostTargetAt > 5000) {
        hostile.aiState = "IDLE";
        hostile.lostTargetAt = 0;
      }
    }

    if (hostile.aiState === "IDLE") {
      if (now >= hostile.wanderUntil) {
        hostile.wanderDirection = [-1, 0, 1][Math.floor(Math.random() * 3)];
        hostile.wanderUntil = now + rand(700, 1800);
      }
      targetVx = hostile.wanderDirection * speed * 0.45;
    } else if (hostile.aiState === "ALERT") {
      hostile.wanderDirection = Math.sign(dx || hostile.wanderDirection || 1);
      targetVx = 0;
    } else if (hostile.aiState === "CHASE") {
      targetVx = Math.sign(dx || 1) * speed;
      hostile.wanderDirection = Math.sign(dx || hostile.wanderDirection || 1);
    } else if (hostile.aiState === "RETREAT") {
      targetVx = -Math.sign(dx || hostile.wanderDirection || 1) * speed;
    } else if (hostile.aiState === "ATTACK") {
      targetVx = hostile.type === "creeper" ? Math.sign(dx || 1) * speed * 0.85 : 0;
    }

    if (hostile.type === "villager") {
      const nearbyThreat = state.hostiles.find(
        (mob) =>
          mob !== hostile &&
          isMobAggressive(mob) &&
          Math.abs(mob.x - hostile.x) < 200 &&
          Math.abs(mob.y - hostile.y) < 70,
      );
      if (nearbyThreat) {
        targetVx = Math.sign(hostile.x - nearbyThreat.x) * speed;
        hostile.aiState = "RETREAT";
      }
    }

    if (isPassiveMob(hostile)) {
      const centerLimit = hostile.homeX ?? hostile.x;
      if (hostile.x < hostile.homeMinX) {
        targetVx = Math.abs(speed) * 0.85;
      } else if (hostile.x > hostile.homeMaxX) {
        targetVx = -Math.abs(speed) * 0.85;
      } else if (Math.abs(hostile.x - centerLimit) > 120 && now >= hostile.wanderUntil) {
        targetVx = Math.sign(centerLimit - hostile.x) * speed * 0.65;
      }

      if (hostile.type === "sheep" && hostile.onGround && now >= hostile.wanderUntil && getTile(Math.floor((hostile.x + hostile.width / 2) / TILE_SIZE), Math.floor((hostile.y + hostile.height) / TILE_SIZE)) === "grass") {
        setTile(Math.floor((hostile.x + hostile.width / 2) / TILE_SIZE), Math.floor((hostile.y + hostile.height) / TILE_SIZE), "dirt");
      }
    }

    if (hostile.type === "skeleton" && canSeePlayer) {
      const preferredRange = def.preferredRange;
      if (absDx < preferredRange - 40) {
        targetVx = -Math.sign(dx || 1) * speed;
      } else if (absDx > preferredRange + 70) {
        targetVx = Math.sign(dx || 1) * speed;
      } else {
        targetVx *= 0.25;
      }
      if (now >= hostile.attackCooldownUntil) {
        state.projectiles.push(
          createProjectile(
            hostile,
            player.x + player.width / 2,
            player.y + player.height / 2,
          ),
        );
        hostile.attackCooldownUntil = now + def.projectileCooldownMs;
      }
    }

    if (hostile.type === "enderman" && canSeePlayer && now >= hostile.teleportCooldownUntil && absDx > 150) {
      const direction = Math.sign(dx || 1);
      if (teleportMobToGround(hostile, player.x - direction * rand(70, 140))) {
        hostile.teleportCooldownUntil = now + def.teleportCooldownMs;
      }
    }

    for (const other of state.hostiles) {
      if (other === hostile) {
        continue;
      }
      const distance = hostile.x - other.x;
      if (Math.abs(distance) < 68 && Math.abs(hostile.y - other.y) < 26) {
        targetVx += Math.sign(distance || (Math.random() < 0.5 ? -1 : 1)) * 38;
      }
    }

    hostile.vx = clamp(targetVx, -speed, speed);

    const moveDirection = Math.sign(hostile.vx || hostile.wanderDirection || dx || 1);
    const footX = hostile.x + hostile.width / 2 + moveDirection * 12;
    const footY = hostile.y + hostile.height + 2;
    const frontTile = worldToTile(footX, footY - hostile.height / 2);
    const floorTile = worldToTile(footX, footY);

    if (moveDirection !== 0 && isSolidTile(frontTile.x, frontTile.y) && hostile.onGround) {
      if (hostile.type === "creeper") {
        hostile.vy = -320;
      } else if (hostile.type === "spider") {
        hostile.vy = -240;
      } else if (hostile.type === "slime") {
        hostile.vy = def.jumpVelocity;
      } else if (hostile.type === "chicken") {
        hostile.vy = -220;
      } else {
        hostile.vy = -380;
      }
    } else if (
      moveDirection !== 0 &&
      !isSolidTile(floorTile.x, floorTile.y) &&
      hostile.onGround &&
      Math.random() < 0.008
    ) {
      if (hostile.type === "creeper") {
        hostile.vy = -260;
      } else if (hostile.type === "slime") {
        hostile.vy = def.jumpVelocity;
      } else if (hostile.type === "chicken") {
        hostile.vy = -180;
      } else {
        hostile.vy = -300;
      }
    }

    if (hostile.type === "spider" && canSeePlayer && absDx < 190 && hostile.onGround && now >= hostile.attackCooldownUntil) {
      hostile.vy = def.leapVelocity;
      hostile.vx = Math.sign(dx || 1) * speed * 1.2;
      hostile.attackCooldownUntil = now + 1600;
    }

    if (hostile.type === "slime" && hostile.onGround && now >= hostile.attackCooldownUntil) {
      hostile.vy = def.jumpVelocity;
      hostile.vx = moveDirection * speed;
      hostile.attackCooldownUntil = now + (hostile.slimeSize === 2 ? 1100 : hostile.slimeSize === 1 ? 850 : 650);
    }

    if (hostile.type === "creeper") {
      if (canSeePlayer && absDx < 3 * TILE_SIZE && hostile.fuseUntil === 0) {
        hostile.aiState = "ATTACK";
        hostile.fuseUntil = now + 1500;
      } else if ((!canSeePlayer || absDx > 7 * TILE_SIZE) && hostile.fuseUntil !== 0 && hostile.fuseUntil - now > 180) {
        hostile.fuseUntil = 0;
        hostile.aiState = "CHASE";
      }
    }

    if (hostile.inWater) {
      hostile.vy += SWIM_GRAVITY * dt;
      if (canSeePlayer && player.y + player.height / 2 < hostile.y + hostile.height / 2) {
        hostile.vy -= SWIM_ASCENT * dt * 0.45;
      }
      hostile.vy -= WATER_BUOYANCY * dt * 0.45;
      hostile.vy = clamp(hostile.vy, -180, 170);
      applyWaterCurrent(hostile, 4, 12);
    } else {
      hostile.vy += GRAVITY * dt;
    }

    if (hostile.type === "chicken" && hostile.vy > 90) {
      hostile.vy = 90;
    }

    moveEntity(hostile, dt);
    hostile.inWater = isEntityInWater(hostile);

    if (hostile.type === "enderman" && hostile.inWater && now >= hostile.waterDamageAt) {
      hostile.waterDamageAt = now + 600;
      damageMob(hostile, 1, now, "Enderman dissolved in water.");
      if (hostile.hp > 0 && now >= hostile.teleportCooldownUntil) {
        teleportMobToGround(hostile, hostile.x + rand(-220, 220));
        hostile.teleportCooldownUntil = now + def.teleportCooldownMs;
      }
    }

    if (isMobAggressive(hostile) && def.contactDamage > 0 && rectIntersects(player, hostile)) {
      const hitMessage = {
        zombie: "Zombie hit you.",
        skeleton: "Skeleton smacked you.",
        spider: "Spider bit you.",
        slime: "Slime bounced into you.",
        enderman: "Enderman struck you.",
      }[hostile.type] || `${hostile.type} hit you.`;
      damagePlayer(def.contactDamage, dx > 0 ? 1 : -1, hitMessage);
    }

    if (hostile.type === "creeper" && hostile.fuseUntil !== 0 && now >= hostile.fuseUntil) {
      explodeCreeper(hostile, now);
      continue;
    }

    if (hostile.hurtUntil < now) {
      hostile.hurtUntil = 0;
    }
  }

  state.hostiles = state.hostiles.filter((hostile) => {
    if (hostile.hp <= 0) {
      return false;
    }
    const despawnDistance = getMobDef(hostile).despawnDistance ?? MOB_DESPAWN_DISTANCE;
    return Math.abs(hostile.x - state.player.x) <= despawnDistance || despawnDistance === Infinity;
  });
  const counts = getHostileCounts();

  state.spawnTimers.zombie -= dt;
  if (counts.zombie < 7 && state.spawnTimers.zombie <= 0 && !state.isDead) {
    spawnHostileNearPlayer("zombie");
    state.spawnTimers.zombie = 15;
  }

  state.spawnTimers.creeper -= dt;
  if (counts.creeper < 1 && state.spawnTimers.creeper <= 0 && !state.isDead) {
    spawnHostileNearPlayer("creeper");
    state.spawnTimers.creeper = 28;
  }

  state.spawnTimers.skeleton -= dt;
  if (counts.skeleton < 2 && state.spawnTimers.skeleton <= 0 && !state.isDead) {
    spawnHostileNearPlayer("skeleton");
    state.spawnTimers.skeleton = 18;
  }

  state.spawnTimers.spider -= dt;
  if (counts.spider < 2 && state.spawnTimers.spider <= 0 && !state.isDead) {
    spawnHostileNearPlayer("spider");
    state.spawnTimers.spider = 16;
  }

  state.spawnTimers.slime -= dt;
  if (counts.slime < 1 && state.spawnTimers.slime <= 0 && !state.isDead) {
    spawnHostileWithOptions("slime", state.player.x + rand(-680, 680), { slimeSize: 2 });
    state.spawnTimers.slime = 60;
  }

  state.spawnTimers.enderman -= dt;
  if (counts.enderman < 0 && state.spawnTimers.enderman <= 0 && !state.isDead) {
    spawnHostileNearPlayer("enderman");
    state.spawnTimers.enderman = 9999;
  }
}

function getHoveredTile() {
  const worldX = state.mouse.x + state.camera.x;
  const worldY = state.mouse.y + state.camera.y;
  const tile = worldToTile(worldX, worldY);
  const tileCenterX = tile.x * TILE_SIZE + TILE_SIZE / 2;
  const tileCenterY = tile.y * TILE_SIZE + TILE_SIZE / 2;
  const playerCenterX = state.player.x + state.player.width / 2;
  const playerCenterY = state.player.y + state.player.height / 2;

  if (Math.hypot(tileCenterX - playerCenterX, tileCenterY - playerCenterY) > REACH) {
    return null;
  }

  return tile;
}

function getHostileUnderCursor() {
  const worldX = state.mouse.x + state.camera.x;
  const worldY = state.mouse.y + state.camera.y;
  for (const hostile of state.hostiles) {
    const centerX = hostile.x + hostile.width / 2;
    const centerY = hostile.y + hostile.height / 2;
    if (Math.hypot(worldX - centerX, worldY - centerY) > REACH) {
      continue;
    }
    if (
      worldX >= hostile.x &&
      worldX <= hostile.x + hostile.width &&
      worldY >= hostile.y &&
      worldY <= hostile.y + hostile.height
    ) {
      return hostile;
    }
  }
  return null;
}

function getFishUnderCursor() {
  const worldX = state.mouse.x + state.camera.x;
  const worldY = state.mouse.y + state.camera.y;
  for (const fish of state.fish) {
    const centerX = fish.x + fish.width / 2;
    const centerY = fish.y + fish.height / 2;
    if (Math.hypot(worldX - centerX, worldY - centerY) > REACH) {
      continue;
    }
    if (
      worldX >= fish.x &&
      worldX <= fish.x + fish.width &&
      worldY >= fish.y &&
      worldY <= fish.y + fish.height
    ) {
      return fish;
    }
  }
  return null;
}

function getHarvestBonus(tileType, item) {
  if ((tileType === "wood" || tileType === "leaves") && item === "woodenAxe") {
    return 1;
  }
  if (tileType === "stone" && item === "woodenPickaxe") {
    return 1;
  }
  if ((tileType === "dirt" || tileType === "grass") && item === "woodenShovel") {
    return 1;
  }
  return 0;
}

function mineBlock() {
  const hovered = getHoveredTile();
  if (!hovered) {
    return;
  }

  const tile = getTile(hovered.x, hovered.y);
  if (!tile) {
    return;
  }
  if (tile === "water") {
    showMessage("Water cannot be mined.");
    return;
  }
  if (tile === "chest" || tile === "openedChest") {
    showMessage(tile === "chest" ? "Right click to open chests." : "This chest is already empty.");
    return;
  }

  const block = BLOCKS[tile];
  setTile(hovered.x, hovered.y, null);

  if (block.item) {
    const selectedItem = getSelectedItem();
    const yieldAmount = 1 + getHarvestBonus(tile, selectedItem);
    state.player.inventory[block.item] += yieldAmount;

    if (yieldAmount > 1) {
      showMessage(`Collected ${yieldAmount} ${block.label.toLowerCase()} with ${ITEM_LABELS[selectedItem].toLowerCase()}.`);
    } else {
      showMessage(`Collected ${block.label.toLowerCase()}.`);
    }
  } else {
    showMessage(`Removed ${block.label.toLowerCase()}.`);
  }
}

function getAttackDamage(item) {
  if (item === "woodenSword") {
    return 2;
  }
  return 1;
}

function attackHostile(hostile) {
  const now = performance.now();
  if (state.player.attackCooldownUntil > now) {
    return;
  }

  const selectedItem = getSelectedItem();
  const damage = getAttackDamage(selectedItem);
  hostile.vx = (hostile.x < state.player.x ? -1 : 1) * 280;
  hostile.vy = -230;
  state.player.attackCooldownUntil = now + (selectedItem === "woodenSword" ? 180 : 260);
  hostile.aggroUntil = now + 9000;

  const defeatTextMap = {
    creeper: "Creeper dropped before it could explode and dropped loot.",
    zombie: "Zombie down. It dropped loot.",
    skeleton: "Skeleton collapsed and dropped loot.",
    spider: "Spider dropped and left loot behind.",
    slime: "Slime burst apart and dropped loot.",
    enderman: "Enderman fell and dropped loot.",
    villager: "Villager went down.",
    cow: "Cow dropped food.",
    pig: "Pig dropped food.",
    sheep: "Sheep dropped food.",
    chicken: "Chicken dropped food.",
  };
  if (damageMob(hostile, damage, now, defeatTextMap[hostile.type] || `${hostile.type} dropped loot.`)) {
    return;
  }

  const weaponText = selectedItem.startsWith("wooden") ? ITEM_LABELS[selectedItem].toLowerCase() : "your hands";
  showMessage(`Hit ${hostile.type} with ${weaponText}.`);
}

function catchFish(fish) {
  const now = performance.now();
  if (state.player.attackCooldownUntil > now) {
    return;
  }

  fish.caught = true;
  state.player.inventory[fish.item] += 1;
  state.player.attackCooldownUntil = now + 180;
  showMessage(
    `Caught ${ITEM_LABELS[fish.item].toLowerCase()}. H eats it for ${EDIBLE_VALUES[fish.item]} food.`,
    1800,
  );
}

function mineOrAttack() {
  if (state.isDead) {
    return;
  }

  const targetHostile = getHostileUnderCursor();
  if (targetHostile) {
    attackHostile(targetHostile);
    return;
  }

  const targetFish = getFishUnderCursor();
  if (targetFish) {
    catchFish(targetFish);
    state.fish = state.fish.filter((fish) => !fish.caught);
    return;
  }

  mineBlock();
}

function canAfford(cost) {
  return Object.entries(cost).every(([item, amount]) => state.player.inventory[item] >= amount);
}

function getCraftableRecipes() {
  return Object.entries(RECIPES)
    .filter(([, recipe]) => !recipe.needsTable || isNearCraftingTable())
    .map(([recipeName, recipe]) => ({ recipeName, recipe }));
}

function getCraftingPanelBounds() {
  return {
    x: canvas.width - 332,
    y: 18,
    width: 298,
    rowHeight: 34,
  };
}

function getRecipeAtMouse() {
  if (!state.craftingOpen) {
    return null;
  }
  const bounds = getCraftingPanelBounds();
  const recipes = getCraftableRecipes();
  if (
    state.mouse.x < bounds.x ||
    state.mouse.x > bounds.x + bounds.width ||
    state.mouse.y < bounds.y + 36 ||
    state.mouse.y > bounds.y + 36 + recipes.length * bounds.rowHeight
  ) {
    return null;
  }
  const index = Math.floor((state.mouse.y - (bounds.y + 36)) / bounds.rowHeight);
  return recipes[index] || null;
}

function getSelectionCards(choices, titleY) {
  const cardWidth = 170;
  const cardHeight = 88;
  const gap = 18;
  const totalWidth = choices.length * cardWidth + Math.max(0, choices.length - 1) * gap;
  const startX = canvas.width / 2 - totalWidth / 2;
  return choices.map((choice, index) => ({
    ...choice,
    screenX: startX + index * (cardWidth + gap),
    screenY: titleY,
    cardWidth,
    cardHeight,
  }));
}

function getSpawnChoiceAtMouse() {
  const cards = getSelectionCards(state.spawnChoices, canvas.height / 2 - 20);
  return cards.find(
    (card) =>
      card.available &&
      state.mouse.x >= card.screenX &&
      state.mouse.x <= card.screenX + card.cardWidth &&
      state.mouse.y >= card.screenY &&
      state.mouse.y <= card.screenY + card.cardHeight,
  ) || null;
}

function getBiomeChoiceAtMouse() {
  const cards = getSelectionCards(state.biomeChoices, canvas.height / 2 + 26);
  return cards.find(
    (card) =>
      card.available &&
      state.mouse.x >= card.screenX &&
      state.mouse.x <= card.screenX + card.cardWidth &&
      state.mouse.y >= card.screenY &&
      state.mouse.y <= card.screenY + card.cardHeight,
  ) || null;
}

function applyInventoryChange(change, sign) {
  Object.entries(change).forEach(([item, amount]) => {
    state.player.inventory[item] += amount * sign;
  });
}

function isNearCraftingTable() {
  const playerTile = worldToTile(
    state.player.x + state.player.width / 2,
    state.player.y + state.player.height / 2,
  );
  for (let y = playerTile.y - 2; y <= playerTile.y + 2; y += 1) {
    for (let x = playerTile.x - 2; x <= playerTile.x + 2; x += 1) {
      if (getTile(x, y) === "craftingTable") {
        return true;
      }
    }
  }
  return false;
}

function performRecipe(recipeName) {
  const recipe = RECIPES[recipeName];
  if (!recipe) {
    return;
  }

  if (recipe.needsTable && !isNearCraftingTable()) {
    showMessage("Stand near a crafting table.");
    return;
  }

  if (!state.craftingOpen) {
    showMessage("Open crafting with E first.");
    return;
  }

  if (!canAfford(recipe.cost)) {
    const costText = Object.entries(recipe.cost)
      .map(([item, amount]) => `${amount} ${ITEM_LABELS[item].toLowerCase()}`)
      .join(", ");
    showMessage(`Need ${costText}.`);
    return;
  }

  applyInventoryChange(recipe.cost, -1);
  applyInventoryChange(recipe.gain, 1);
  showMessage(recipe.success, 1800);
}

function placeSelectedBlock() {
  if (state.isDead) {
    return;
  }

  const item = getSelectedItem();
  if (!BLOCK_ITEMS.has(item)) {
    showMessage(`${ITEM_LABELS[item]} cannot be placed.`);
    return;
  }

  const hovered = getHoveredTile();
  if (!hovered) {
    return;
  }

  const hoveredTile = getTile(hovered.x, hovered.y);
  if (hoveredTile && hoveredTile !== "water") {
    return;
  }

  if (state.player.inventory[item] <= 0) {
    showMessage(`No ${ITEM_LABELS[item].toLowerCase()} available.`);
    return;
  }

  const tileRect = {
    x: hovered.x * TILE_SIZE,
    y: hovered.y * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE,
  };
  if (rectIntersects(tileRect, state.player)) {
    return;
  }
  if (state.hostiles.some((hostile) => rectIntersects(tileRect, hostile))) {
    return;
  }

  const tileType = item === "craftingTable" ? "craftingTable" : item;
  setTile(hovered.x, hovered.y, tileType);
  state.player.inventory[item] -= 1;
  showMessage(`Placed ${ITEM_LABELS[item].toLowerCase()}.`, 1200);
}

function interactWithHoveredTile() {
  const hovered = getHoveredTile();
  if (!hovered) {
    return false;
  }

  return openChest(hovered.x, hovered.y);
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, SKY_TOP);
  gradient.addColorStop(1, SKY_BOTTOM);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const star of state.stars) {
    const parallaxX = mod(star.x - state.camera.x * 0.18, canvas.width + 320) - 160;
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = "#f3f7ff";
    ctx.beginPath();
    ctx.arc(parallaxX, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.75;
  ctx.fillStyle = "#d9e4ff";
  ctx.beginPath();
  ctx.arc(canvas.width - 110, 92, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawWorld() {
  const startCol = Math.floor(state.camera.x / TILE_SIZE);
  const endCol = startCol + Math.ceil(canvas.width / TILE_SIZE) + 1;
  const startRow = Math.floor(state.camera.y / TILE_SIZE);
  const endRow = startRow + Math.ceil(canvas.height / TILE_SIZE) + 1;

  for (let y = startRow; y <= endRow; y += 1) {
    for (let x = startCol; x <= endCol; x += 1) {
      const tile = getTile(x, y);
      if (!tile || !BLOCKS[tile]) {
        continue;
      }
      const drawX = x * TILE_SIZE - state.camera.x;
      const drawY = y * TILE_SIZE - state.camera.y;
      if (tile === "fern") {
        ctx.fillStyle = "#2e7e52";
        ctx.fillRect(drawX + 14, drawY + 12, 4, 16);
        ctx.fillRect(drawX + 8, drawY + 18, 4, 8);
        ctx.fillRect(drawX + 20, drawY + 18, 4, 8);
        ctx.fillStyle = "#58ba79";
        ctx.fillRect(drawX + 10, drawY + 10, 4, 8);
        ctx.fillRect(drawX + 18, drawY + 10, 4, 8);
        ctx.fillRect(drawX + 6, drawY + 20, 4, 6);
        ctx.fillRect(drawX + 22, drawY + 20, 4, 6);
        continue;
      }

      if (tile === "wildflower" || tile === "sunbloom") {
        ctx.fillStyle = "#4f9a55";
        ctx.fillRect(drawX + 14, drawY + 12, 3, 16);
        ctx.fillRect(drawX + 11, drawY + 20, 3, 6);
        ctx.fillRect(drawX + 17, drawY + 18, 3, 6);
        ctx.fillStyle = tile === "wildflower" ? "#ff8dae" : "#ffd45b";
        ctx.fillRect(drawX + 10, drawY + 8, 10, 10);
        ctx.fillStyle = tile === "wildflower" ? "#fff0a8" : "#855d1f";
        ctx.fillRect(drawX + 13, drawY + 11, 4, 4);
        continue;
      }

      if (tile === "cattail") {
        ctx.fillStyle = "#507d3a";
        ctx.fillRect(drawX + 11, drawY + 8, 3, 20);
        ctx.fillRect(drawX + 18, drawY + 10, 3, 18);
        ctx.fillStyle = "#6f4a26";
        ctx.fillRect(drawX + 10, drawY + 6, 5, 8);
        ctx.fillRect(drawX + 17, drawY + 8, 5, 8);
        continue;
      }

      ctx.fillStyle = BLOCKS[tile].color;
      ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

      if (tile === "grass") {
        ctx.fillStyle = "#79d682";
        ctx.fillRect(drawX, drawY, TILE_SIZE, 6);
      } else if (tile === "water") {
        const waterLevel = getWaterLevel(x, y) || WATER_MAX_LEVEL;
        const surfaceInset = Math.floor(((waterLevel - 1) / (WATER_MAX_LEVEL - 1)) * 12);
        ctx.globalAlpha = 0.82;
        ctx.fillStyle = "#3aa3eb";
        ctx.fillRect(drawX, drawY + surfaceInset, TILE_SIZE, TILE_SIZE - surfaceInset);
        ctx.fillStyle = "rgba(206, 242, 255, 0.9)";
        ctx.fillRect(drawX, drawY + surfaceInset + 2, TILE_SIZE, 3);
        ctx.globalAlpha = 1;
      } else if (tile === "stone") {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(drawX + 6, drawY + 6, 5, 5);
        ctx.fillRect(drawX + 18, drawY + 17, 6, 6);
      } else if (tile === "wood") {
        ctx.fillStyle = "#6f4a26";
        ctx.fillRect(drawX + 10, drawY, 4, TILE_SIZE);
      } else if (tile === "chest" || tile === "openedChest") {
        ctx.fillStyle = tile === "openedChest" ? "#704e37" : "#8d5d33";
        ctx.fillRect(drawX + 3, drawY + 8, TILE_SIZE - 6, TILE_SIZE - 10);
        ctx.fillStyle = "#d9b06a";
        ctx.fillRect(drawX + 3, drawY + 8, TILE_SIZE - 6, 6);
        ctx.fillStyle = tile === "openedChest" ? "#e8c78b" : "#f1d08b";
        ctx.fillRect(drawX + 13, drawY + 17, 6, 6);
      } else if (tile === "craftingTable") {
        ctx.fillStyle = "#6e4a2b";
        ctx.fillRect(drawX + 5, drawY + 5, TILE_SIZE - 10, TILE_SIZE - 10);
        ctx.fillStyle = "#d7b17d";
        ctx.fillRect(drawX + 5, drawY + 5, TILE_SIZE - 10, 4);
      }
    }
  }
}

function drawFish() {
  for (const fish of state.fish) {
    const drawX = fish.x - state.camera.x;
    const drawY = fish.y - state.camera.y;
    const bodyColor = fish.type === "large" ? "#5bb7d8" : "#8de3f2";

    ctx.fillStyle = bodyColor;
    ctx.fillRect(drawX + 3, drawY + 2, fish.width - 8, fish.height - 4);
    ctx.fillStyle = fish.type === "large" ? "#378aa6" : "#5ab9cc";
    if (fish.facing > 0) {
      ctx.beginPath();
      ctx.moveTo(drawX + fish.width, drawY + fish.height / 2);
      ctx.lineTo(drawX + fish.width - 7, drawY + 1);
      ctx.lineTo(drawX + fish.width - 7, drawY + fish.height - 1);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.moveTo(drawX, drawY + fish.height / 2);
      ctx.lineTo(drawX + 7, drawY + 1);
      ctx.lineTo(drawX + 7, drawY + fish.height - 1);
      ctx.closePath();
    }
    ctx.fill();
    ctx.fillStyle = "#10324a";
    ctx.fillRect(drawX + (fish.facing > 0 ? 6 : fish.width - 10), drawY + 4, 2, 2);
  }
}

function drawProjectiles() {
  for (const projectile of state.projectiles) {
    const drawX = projectile.x - state.camera.x;
    const drawY = projectile.y - state.camera.y;
    const angle = Math.atan2(projectile.vy, projectile.vx);
    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.rotate(angle);
    ctx.fillStyle = "#f2e0b8";
    ctx.fillRect(-6, -1, 12, 2);
    ctx.fillStyle = "#7b5331";
    ctx.fillRect(-6, -1.5, 4, 3);
    ctx.restore();
  }
}

function drawPlayer() {
  const player = state.player;
  const drawX = player.x - state.camera.x;
  const drawY = player.y - state.camera.y;

  ctx.fillStyle = player.hurtUntil > performance.now() ? "#f8b4b4" : player.inWater ? "#8fd6ff" : "#79b8ff";
  ctx.fillRect(drawX, drawY, player.width, player.height);
  ctx.fillStyle = "#172235";
  ctx.fillRect(drawX + 5, drawY + 6, 4, 4);
  ctx.fillRect(drawX + 13, drawY + 6, 4, 4);
  ctx.fillStyle = "#e0f3ff";
  ctx.fillRect(drawX + (player.facing > 0 ? 14 : 4), drawY + 18, 5, 4);
}

function drawHostiles(now) {
  for (const hostile of state.hostiles) {
    const drawX = hostile.x - state.camera.x;
    const drawY = hostile.y - state.camera.y;
    const slimeSize = hostile.slimeSize ?? 2;

    if (hostile.type === "zombie") {
      ctx.fillStyle = hostile.hurtUntil > now ? "#f6c290" : hostile.inWater ? "#74be86" : "#5da86d";
      ctx.fillRect(drawX, drawY, hostile.width, hostile.height);
      ctx.fillStyle = "#1f2a1f";
      ctx.fillRect(drawX + 4, drawY + 6, 4, 4);
      ctx.fillRect(drawX + 14, drawY + 6, 4, 4);
      ctx.fillStyle = "#133a16";
      ctx.fillRect(drawX + 8, drawY + 18, 6, 5);
      continue;
    }

    if (hostile.type === "creeper") {
      const flashing = hostile.fuseUntil !== 0 && Math.floor(now / 100) % 2 === 0;
      ctx.fillStyle = flashing ? "#f7e2be" : hostile.hurtUntil > now ? "#f6c290" : hostile.inWater ? "#79d28d" : "#64cb73";
      ctx.fillRect(drawX, drawY, hostile.width, hostile.height);
      ctx.fillStyle = "#1c301f";
      ctx.fillRect(drawX + 6, drawY + 7, 3, 3);
      ctx.fillRect(drawX + 13, drawY + 7, 3, 3);
      ctx.fillRect(drawX + 7, drawY + 15, 8, 7);
      ctx.fillRect(drawX + 4, drawY + 21, 5, 4);
      ctx.fillRect(drawX + 13, drawY + 21, 5, 4);
      continue;
    }

    if (hostile.type === "skeleton") {
      ctx.fillStyle = hostile.hurtUntil > now ? "#f1d4be" : hostile.inWater ? "#cad9df" : "#d7dde3";
      ctx.fillRect(drawX + 6, drawY, hostile.width - 12, hostile.height);
      ctx.fillRect(drawX, drawY + 8, hostile.width, 4);
      ctx.fillRect(drawX + 8, drawY + 18, 3, 10);
      ctx.fillRect(drawX + 13, drawY + 18, 3, 10);
      ctx.fillStyle = "#222a36";
      ctx.fillRect(drawX + 6, drawY + 5, 3, 3);
      ctx.fillRect(drawX + 13, drawY + 5, 3, 3);
      ctx.fillStyle = "#8b5f3b";
      ctx.fillRect(drawX + (hostile.wanderDirection > 0 ? hostile.width - 5 : 1), drawY + 8, 3, 16);
      continue;
    }

    if (hostile.type === "spider") {
      ctx.fillStyle = hostile.hurtUntil > now ? "#c89c84" : "#45312f";
      ctx.fillRect(drawX + 4, drawY + 4, hostile.width - 8, hostile.height - 8);
      ctx.fillStyle = "#271919";
      ctx.fillRect(drawX + 2, drawY + 2, 5, 3);
      ctx.fillRect(drawX + hostile.width - 7, drawY + 2, 5, 3);
      ctx.fillRect(drawX + 2, drawY + hostile.height - 5, 5, 3);
      ctx.fillRect(drawX + hostile.width - 7, drawY + hostile.height - 5, 5, 3);
      ctx.fillStyle = "#ff5f66";
      ctx.fillRect(drawX + 9, drawY + 6, 2, 2);
      ctx.fillRect(drawX + 14, drawY + 6, 2, 2);
      continue;
    }

    if (hostile.type === "slime") {
      const palette = ["#bafc8d", "#7add65", "#4ebf4b"];
      ctx.fillStyle = hostile.hurtUntil > now ? "#f2dbb8" : palette[slimeSize] || "#7add65";
      ctx.fillRect(drawX, drawY, hostile.width, hostile.height);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(drawX + 2, drawY + 2, hostile.width - 4, 4);
      ctx.fillStyle = "#1b3b1f";
      ctx.fillRect(drawX + hostile.width * 0.28, drawY + hostile.height * 0.35, 2, 2);
      ctx.fillRect(drawX + hostile.width * 0.62, drawY + hostile.height * 0.35, 2, 2);
      continue;
    }

    if (hostile.type === "enderman") {
      ctx.fillStyle = hostile.hurtUntil > now ? "#b692ae" : hostile.inWater ? "#353447" : "#18151d";
      ctx.fillRect(drawX + 7, drawY, hostile.width - 14, hostile.height);
      ctx.fillRect(drawX + 2, drawY + 10, 5, hostile.height - 20);
      ctx.fillRect(drawX + hostile.width - 7, drawY + 10, 5, hostile.height - 20);
      ctx.fillStyle = "#d68cff";
      ctx.fillRect(drawX + 7, drawY + 7, 3, 2);
      ctx.fillRect(drawX + 12, drawY + 7, 3, 2);
      continue;
    }

    if (hostile.type === "villager") {
      ctx.fillStyle = hostile.hurtUntil > now ? "#f3c4b0" : "#8c6547";
      ctx.fillRect(drawX, drawY, hostile.width, hostile.height);
      ctx.fillStyle = "#e0b18b";
      ctx.fillRect(drawX + 5, drawY + 4, hostile.width - 10, 11);
      ctx.fillStyle = "#593726";
      ctx.fillRect(drawX + 8, drawY + 10, 6, 8);
      continue;
    }

    if (hostile.type === "cow") {
      ctx.fillStyle = hostile.hurtUntil > now ? "#f3cfbf" : "#7b5138";
      ctx.fillRect(drawX, drawY + 4, hostile.width, hostile.height - 4);
      ctx.fillStyle = "#f1ede5";
      ctx.fillRect(drawX + 3, drawY + 7, 8, 7);
      ctx.fillRect(drawX + 16, drawY + 10, 8, 6);
      continue;
    }

    if (hostile.type === "pig") {
      ctx.fillStyle = hostile.hurtUntil > now ? "#f8d7d8" : "#dd8c9b";
      ctx.fillRect(drawX, drawY + 4, hostile.width, hostile.height - 4);
      ctx.fillStyle = "#f6bcc7";
      ctx.fillRect(drawX + hostile.width - 9, drawY + 9, 6, 5);
      continue;
    }

    if (hostile.type === "sheep") {
      ctx.fillStyle = hostile.hurtUntil > now ? "#efe7da" : "#f1f1ed";
      ctx.fillRect(drawX, drawY + 3, hostile.width, hostile.height - 3);
      ctx.fillStyle = "#6b5647";
      ctx.fillRect(drawX + hostile.width - 8, drawY + 8, 7, 8);
      continue;
    }

    if (hostile.type === "chicken") {
      ctx.fillStyle = hostile.hurtUntil > now ? "#fff0d6" : "#f5f3ea";
      ctx.fillRect(drawX, drawY + 4, hostile.width, hostile.height - 4);
      ctx.fillStyle = "#f0c24a";
      ctx.fillRect(drawX + hostile.width - 5, drawY + 10, 4, 3);
      ctx.fillStyle = "#d84b3e";
      ctx.fillRect(drawX + 3, drawY + 4, 4, 3);
    }
  }
}

function drawPickups() {
  for (const pickup of state.pickups) {
    const drawX = pickup.x - state.camera.x;
    const drawY = pickup.y - state.camera.y;
    ctx.fillStyle = ITEM_COLORS[pickup.item] || "#ffffff";

    if (pickup.item === "food") {
      ctx.beginPath();
      ctx.arc(drawX + pickup.width / 2, drawY + pickup.height / 2, pickup.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff4d0";
      ctx.fillRect(drawX + 8, drawY + 2, 2, 4);
    } else {
      ctx.fillRect(drawX, drawY, pickup.width, pickup.height);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(drawX + 2, drawY + 2, pickup.width - 4, 3);
    }

    ctx.fillStyle = "#eef5ff";
    ctx.font = "10px Trebuchet MS";
    ctx.fillText(String(pickup.amount), drawX + pickup.width - 4, drawY + pickup.height + 9);
  }
}

function drawTargeting() {
  const hovered = getHoveredTile();
  state.hoverTile = hovered;
  if (!hovered) {
    return;
  }

  const drawX = hovered.x * TILE_SIZE - state.camera.x;
  const drawY = hovered.y * TILE_SIZE - state.camera.y;
  ctx.strokeStyle = "rgba(139, 224, 255, 0.95)";
  ctx.lineWidth = 2;
  ctx.strokeRect(drawX + 1, drawY + 1, TILE_SIZE - 2, TILE_SIZE - 2);
}

function drawHeart(x, y, filled) {
  const pixels = [
    [1, 0], [2, 0], [4, 0], [5, 0],
    [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
    [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
    [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
    [2, 4], [3, 4], [4, 4],
    [3, 5],
  ];
  ctx.fillStyle = filled ? "#ff6b6b" : "#41263f";
  for (const pixel of pixels) {
    ctx.fillRect(x + pixel[0] * 3, y + pixel[1] * 3, 3, 3);
  }
}

function drawHotbarSlot(item, index, x, y) {
  const isSelected = index === state.selectedSlot;
  ctx.fillStyle = isSelected ? "#d7ecff" : "rgba(255,255,255,0.12)";
  ctx.fillRect(x, y, 42, 42);
  ctx.fillStyle = ITEM_COLORS[item];
  ctx.fillRect(x + 5, y + 5, 32, 32);

  if (item === "woodenSword") {
    ctx.fillStyle = "#6f4a26";
    ctx.fillRect(x + 18, y + 7, 6, 23);
    ctx.fillStyle = "#efe5d5";
    ctx.fillRect(x + 19, y + 5, 4, 12);
  } else if (item === "woodenAxe") {
    ctx.fillStyle = "#714925";
    ctx.fillRect(x + 19, y + 8, 4, 22);
    ctx.fillStyle = "#d9c0a6";
    ctx.fillRect(x + 15, y + 9, 12, 8);
  } else if (item === "woodenPickaxe") {
    ctx.fillStyle = "#714925";
    ctx.fillRect(x + 19, y + 10, 4, 20);
    ctx.fillStyle = "#d9c0a6";
    ctx.fillRect(x + 10, y + 10, 22, 5);
  } else if (item === "woodenShovel") {
    ctx.fillStyle = "#714925";
    ctx.fillRect(x + 19, y + 10, 4, 20);
    ctx.fillStyle = "#d9c0a6";
    ctx.fillRect(x + 16, y + 7, 10, 9);
  }

  ctx.fillStyle = isSelected ? "#0f1b2f" : "#eef5ff";
  ctx.font = "11px Trebuchet MS";
  ctx.fillText(String(index + 1), x + 4, y + 13);

  const count = state.player.inventory[item];
  ctx.fillStyle = count > 0 ? "#f7dfbc" : "#7384a8";
  ctx.fillText(String(count), x + 27, y + 37);
}

function drawHud() {
  ctx.fillStyle = "rgba(4, 10, 18, 0.72)";
  ctx.fillRect(18, 18, 544, 154);
  ctx.strokeStyle = "rgba(139, 224, 255, 0.22)";
  ctx.strokeRect(18.5, 18.5, 544, 154);

  ctx.fillStyle = "#eef5ff";
  ctx.font = "16px Trebuchet MS";
  ctx.fillText("HP", 34, 44);
  for (let i = 0; i < state.player.maxHearts; i += 1) {
    drawHeart(62 + i * 28, 28, i < state.player.hearts);
  }

  ctx.fillStyle = "#eef5ff";
  ctx.fillText("Food", 34, 72);
  for (let i = 0; i < state.player.maxHunger; i += 1) {
    ctx.fillStyle = i < state.player.hunger ? "#f4c46c" : "#3a2d1e";
    ctx.fillRect(80 + i * 14, 59, 10, 14);
  }

  if (state.player.inWater) {
    const bubbleCount = Math.ceil((state.player.airMs / state.player.maxAirMs) * 10);
    ctx.fillStyle = "#eef8ff";
    ctx.fillText("Air", 34, 94);
    for (let i = 0; i < 10; i += 1) {
      ctx.fillStyle = i < bubbleCount ? "#89dbff" : "#1b3f59";
      ctx.beginPath();
      ctx.arc(82 + i * 14, 88, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const selectedItem = getSelectedItem();
  ctx.fillStyle = "#8be0ff";
  ctx.font = "15px Trebuchet MS";
  ctx.fillText(`Selected: ${ITEM_LABELS[selectedItem]} x${state.player.inventory[selectedItem]}`, 228, 43);
  ctx.fillStyle = "#9fb1d0";
  ctx.fillText(
    `Edibles: food ${state.player.inventory.food} | small fish ${state.player.inventory.fishSmall} | large fish ${state.player.inventory.fishLarge}`,
    228,
    71,
  );
  ctx.fillText("Hotbar", 34, 97);

  HOTBAR.forEach((item, index) => {
    drawHotbarSlot(item, index, 28 + index * 58, 110);
  });

  ctx.fillStyle = "rgba(4, 10, 18, 0.66)";
  ctx.fillRect(18, canvas.height - 88, 620, 70);
  ctx.strokeStyle = "rgba(249, 182, 92, 0.24)";
  ctx.strokeRect(18.5, canvas.height - 87.5, 620, 70);
  ctx.fillStyle = "#f7dfbc";
  ctx.font = "15px Trebuchet MS";

  const craftingText = isNearCraftingTable()
    ? "E opens crafting | table recipes unlocked | H eats provisions | Hold jump to swim"
    : "E opens hand crafting | Click fish to catch | H eats provisions | Hold jump to swim";
  ctx.fillText(craftingText, 34, canvas.height - 52);

  const hostileCounts = getHostileCounts();
  ctx.fillStyle = "#9fb1d0";
  ctx.fillText(
    `Z ${hostileCounts.zombie}  C ${hostileCounts.creeper}  Sk ${hostileCounts.skeleton}  Sp ${hostileCounts.spider}  Sl ${hostileCounts.slime}  E ${hostileCounts.enderman}  V ${hostileCounts.villager}  Animals ${hostileCounts.cow + hostileCounts.pig + hostileCounts.sheep + hostileCounts.chicken}  Fish ${state.fish.length}`,
    34,
    canvas.height - 30,
  );

  if (state.craftingOpen) {
    const bounds = getCraftingPanelBounds();
    const recipes = getCraftableRecipes();
    ctx.fillStyle = "rgba(4, 10, 18, 0.88)";
    ctx.fillRect(bounds.x, bounds.y, bounds.width, 52 + recipes.length * bounds.rowHeight);
    ctx.strokeStyle = "rgba(139, 224, 255, 0.25)";
    ctx.strokeRect(bounds.x + 0.5, bounds.y + 0.5, bounds.width, 52 + recipes.length * bounds.rowHeight);
    ctx.fillStyle = "#eef5ff";
    ctx.font = "16px Trebuchet MS";
    ctx.fillText(isNearCraftingTable() ? "Crafting Table Recipes" : "Hand Crafting", bounds.x + 14, bounds.y + 22);
    ctx.fillStyle = "#9fb1d0";
    ctx.font = "12px Trebuchet MS";
    ctx.fillText("Click a recipe to craft it", bounds.x + 14, bounds.y + 40);

    recipes.forEach(({ recipeName, recipe }, index) => {
      const rowY = bounds.y + 48 + index * bounds.rowHeight;
      const affordable = canAfford(recipe.cost);
      ctx.fillStyle = affordable ? "rgba(139, 224, 255, 0.12)" : "rgba(255,255,255,0.06)";
      ctx.fillRect(bounds.x + 8, rowY, bounds.width - 16, bounds.rowHeight - 4);
      ctx.fillStyle = affordable ? "#eef5ff" : "#6f809a";
      ctx.font = "13px Trebuchet MS";
      const gainText = Object.entries(recipe.gain).map(([item, amount]) => `${amount} ${ITEM_LABELS[item]}`).join(", ");
      const costText = Object.entries(recipe.cost).map(([item, amount]) => `${amount} ${ITEM_LABELS[item]}`).join(", ");
      ctx.fillText(`${ITEM_LABELS[recipeName] || recipeName}: ${gainText}`, bounds.x + 16, rowY + 14);
      ctx.fillStyle = affordable ? "#f7dfbc" : "#7f8eab";
      ctx.font = "11px Trebuchet MS";
      ctx.fillText(`Cost: ${costText}`, bounds.x + 16, rowY + 28);
    });
  }

  if (state.message && state.messageUntil > performance.now()) {
    const width = Math.min(canvas.width - 48, Math.max(280, state.message.length * 8.2));
    const x = canvas.width / 2 - width / 2;
    const y = 22;
    ctx.fillStyle = "rgba(4, 10, 18, 0.82)";
    ctx.fillRect(x, y, width, 34);
    ctx.strokeStyle = "rgba(249, 182, 92, 0.28)";
    ctx.strokeRect(x + 0.5, y + 0.5, width, 34);
    ctx.fillStyle = "#f7dfbc";
    ctx.fillText(state.message, x + 16, y + 22);
  }

  if (state.isDead && !state.deathBiomeSelectionOpen) {
    ctx.fillStyle = "rgba(3, 7, 14, 0.72)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f2f6ff";
    ctx.font = "bold 44px Trebuchet MS";
    ctx.fillText("You Died", canvas.width / 2 - 92, canvas.height / 2 - 8);
  }
}

function updateCamera() {
  ensureChunksAroundPlayer();
  const pixelBounds = getLoadedPixelBounds();
  state.camera.x = clamp(
    state.player.x + state.player.width / 2 - canvas.width / 2,
    pixelBounds.min,
    pixelBounds.max - canvas.width,
  );
  state.camera.y = clamp(
    state.player.y + state.player.height / 2 - canvas.height / 2,
    0,
    WORLD_HEIGHT * TILE_SIZE - canvas.height,
  );
}

function render(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawWorld();
  drawFish();
  drawPickups();
  drawProjectiles();
  drawHostiles(now);
  drawPlayer();
  drawTargeting();
  drawHud();
}

function tick(now) {
  const dt = Math.min((now - state.lastFrame) / 1000, 1 / 30);
  state.lastFrame = now;
  renderSelectionOverlay();

  if (!state.isDead && !state.startSelectionOpen && !state.deathBiomeSelectionOpen) {
    updateWater(now);
    updatePlayer(dt, now);
    updatePickups(dt);
    updateHostiles(dt, now);
    updateProjectiles(dt, now);
    updateFish(dt, now);
    state.fish = state.fish.filter((fish) => !fish.caught);
    updateCamera();
  }

  render(now);
  requestAnimationFrame(tick);
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (key === "a") {
    state.input.left = true;
  } else if (key === "d") {
    state.input.right = true;
  } else if (key === "w" || key === " ") {
    state.input.jumpHeld = true;
  } else if (key === "e") {
    if (state.startSelectionOpen || state.deathBiomeSelectionOpen) {
      return;
    }
    state.craftingOpen = !state.craftingOpen;
  } else if (key === "h") {
    consumeFood();
  } else if (key === "r" && state.isDead) {
    respawnAfterDeath();
  } else if (/^[1-9]$/.test(key)) {
    state.selectedSlot = Number(key) - 1;
  }
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  if (key === "a") {
    state.input.left = false;
  } else if (key === "d") {
    state.input.right = false;
  } else if (key === "w" || key === " ") {
    state.input.jumpHeld = false;
  }
}

function updateMousePosition(event) {
  const rect = canvas.getBoundingClientRect();
  state.mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  state.mouse.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
}

function installEvents() {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  document.addEventListener("fullscreenchange", syncFullscreenButton);
  document.addEventListener("webkitfullscreenchange", syncFullscreenButton);
  if (fullscreenToggle) {
    fullscreenToggle.addEventListener("click", () => {
      toggleFullscreen();
    });
  }
  canvas.addEventListener("mousemove", updateMousePosition);
  canvas.addEventListener("mousedown", (event) => {
    updateMousePosition(event);
    if (event.button === 0) {
      if (state.startSelectionOpen) {
        const spawnChoice = getSpawnChoiceAtMouse();
        if (spawnChoice) {
          chooseSpawnPoint(spawnChoice);
        }
        return;
      }
      if (state.deathBiomeSelectionOpen) {
        const biomeChoice = getBiomeChoiceAtMouse();
        if (biomeChoice) {
          state.player.hearts = state.player.maxHearts;
          state.player.hunger = Math.max(6, state.player.maxHunger - 2);
          state.player.hurtUntil = 0;
          chooseSpawnPoint(biomeChoice);
        }
        return;
      }
      const clickedRecipe = getRecipeAtMouse();
      if (clickedRecipe) {
        performRecipe(clickedRecipe.recipeName);
        return;
      }
      mineOrAttack();
    }
  });
  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    updateMousePosition(event);
    if (interactWithHoveredTile()) {
      return;
    }
    placeSelectedBlock();
  });
}

function init() {
  resetGame();
  installEvents();
  syncFullscreenButton();
  requestAnimationFrame((time) => {
    state.lastFrame = time;
    tick(time);
  });
}

init();
