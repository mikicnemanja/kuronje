const fs = require("fs");
const path = require("path");

const names = [
  "Nemanja",
  "Zeka",
  "Maksa",
  "Paja",
  "Pedja",
  "Punisa",
  "Stupar",
  "Garic",
  "Cile",
  "Prcko",
  "Marko",
  "Cinc",
  "Dokic",
  "Petra",
  "Salica",
  "Moca",
  "Gliga",
  "Raka",
  "Doza",
  "Dimitrije",
  "Seba",
  "Jova",
  "Kozma",
  "Obi",
  "Sindza",
  "Moki",
  "Djuraga",
  "Dondur",
  "Djole",
  "Liza",
];

const traits = {
  backgrounds: [
    "Dark Forest",
    "Mystic Cave",
    "Ancient Temple",
    "Void Realm",
    "Neon City",
    "Desert",
  ],
  eyes: ["Glowing Red", "Ice Blue", "Golden", "Purple", "Green", "Silver"],
  weapons: [
    "Shadow Blade",
    "Fire Staff",
    "Ice Bow",
    "Lightning Spear",
    "Axe",
    "Dagger",
  ],
};

// Rarity distribution: 1 Legendary, 6 Epic, 7 Rare, 8 Uncommon, 8 Common
const rarities = [
  "Legendary", // Nemanja only
  ...Array(6).fill("Epic"),
  ...Array(7).fill("Rare"),
  ...Array(8).fill("Uncommon"),
  ...Array(8).fill("Common"),
];

// Shuffle rarities (except first one which stays Legendary)
const shuffledRarities = [
  rarities[0],
  ...rarities.slice(1).sort(() => Math.random() - 0.5),
];

// Create directories
const revealedDir = "./metadata/revealed";
const combinationsDir = "./combinations";
if (!fs.existsSync(revealedDir)) {
  fs.mkdirSync(revealedDir, { recursive: true });
}
if (!fs.existsSync(combinationsDir)) {
  fs.mkdirSync(combinationsDir, { recursive: true });
}

let allCombinations = [];

for (let i = 0; i < 30; i++) {
  const name = names[i];
  const rarity = name === "Nemanja" ? "Legendary" : shuffledRarities[i];
  const background =
    traits.backgrounds[Math.floor(Math.random() * traits.backgrounds.length)];
  const eyes = traits.eyes[Math.floor(Math.random() * traits.eyes.length)];
  const weapon =
    traits.weapons[Math.floor(Math.random() * traits.weapons.length)];

  const metadata = {
    name: `Kuronje #${i} - ${name}`,
    description: `${name} is a ${rarity.toLowerCase()} Kuronje with unique abilities`,
    image: `ipfs://QmRevealedImageHash/${i}.png`,
    attributes: [
      { trait_type: "Name", value: name },
      { trait_type: "Background", value: background },
      { trait_type: "Eyes", value: eyes },
      { trait_type: "Weapon", value: weapon },
      { trait_type: "Rarity", value: rarity },
    ],
  };

  // Save metadata JSON
  fs.writeFileSync(
    path.join(revealedDir, `${i}.json`),
    JSON.stringify(metadata, null, 2)
  );

  // Save combination for AI prompts
  const combination = {
    id: i,
    name: name,
    background: background,
    eyes: eyes,
    weapon: weapon,
    rarity: rarity,
    aiPrompt: `Serbian fuckboy named ${name}, ${background.toLowerCase()}, ${eyes.toLowerCase()} eyes, holding ${weapon.toLowerCase()}, ${rarity.toLowerCase()} rarity character`,
  };

  allCombinations.push(combination);

  // Save individual combination file
  fs.writeFileSync(
    path.join(combinationsDir, `${i}-${name}.txt`),
    `Kuronje #${i} - ${name}
Background: ${background}
Eyes: ${eyes}
Weapon: ${weapon}
Rarity: ${rarity}

AI Prompt: ${combination.aiPrompt}`
  );
}

// Save all combinations in one file
fs.writeFileSync(
  path.join(combinationsDir, "all-combinations.json"),
  JSON.stringify(allCombinations, null, 2)
);

console.log("Generated metadata for 30 Kuronje NFTs:");
console.log("1 Legendary, 6 Epic, 7 Rare, 8 Uncommon, 8 Common");
console.log("Combinations saved to ./combinations/ folder");
