# Blockfall Night

A small 2D Minecraft-inspired browser prototype with an even wider world, nighttime survival, rivers and lakes you can swim through, villages with houses and villagers, a broader mob roster, block building, a craftable crafting table, and simple wooden tools.

## Run

Open [`index.html`](./index.html) in a browser.

If you prefer a local server:

```bash
cd /Users/a_ding2024/Desktop/VibeCodingProjs/minecraft-2d
python3 -m http.server 8002
```

Then visit `http://localhost:8002`.

## Controls

- `A / D`: move
- `W` or `Space`: jump, or swim upward while in water
- Left click: mine blocks or attack mobs
- Right click: open a chest, or place the selected block
- `1-9`: select the hotbar slot
- `H`: eat 1 food and refill 1 hunger bar
- `E`: open or close the crafting panel
- Left click a recipe in the crafting panel to craft it
- `R`: respawn after death at a newly chosen spawn point

## Notes

- The world always starts at night.
- The game is now worked from `/Users/a_ding2024/Desktop/VibeCodingProjs/minecraft-2d`.
- The world is wider and taller than before, and now generates lakes, a river, and fewer villages with multiple houses.
- Trees only grow from clear ground, so they no longer stack on top of other trees.
- Zombies, creepers, skeletons, spiders, and slimes respawn over time with zombies favored more heavily and slimes made rarer.
- Villagers stay near villages, passive animals roam the world, skeletons fire arrows, spiders leap, slimes split, and endermen can aggro when you face them and take damage in water.
- Water now behaves as a stable body with buoyancy-focused swimming, and non-zombie mobs are forced out of water.
- Hand crafting now covers planks, sticks, and crafting tables; standing near a crafting table unlocks wooden tools plus furnace and chest recipes.
- Death no longer regenerates the whole world by default; respawning chooses a biome and a fresh nearby spawn point in the current world.
- Creeper blasts damage nearby mobs as well as the player, but they no longer destroy water tiles.
- Mobs now drop visible pickups instead of instantly going into your inventory.
- Village chests can spill useful supplies and tools, and animals can be hunted for food.
- Placeable items are dirt, stone, wood, planks, and crafting tables.
- Wooden axe, pickaxe, and shovel give bonus resource yield on matching block types.
- Mob health now loosely tracks Minecraft values: zombie/skeleton/creeper/villager 20 HP, spider 16 HP, cow/pig 10 HP, sheep 8 HP, chicken 4 HP, and slimes split as they shrink.
