export default {
  minLevelRequired: 'Required Level',
  duration: 'Duration',
  gameNameFirst: 'Chest',
  gameNameLast: 'Idle',
  gameName: '@:gameNameFirst @:gameNameLast',
  loading: 'Loading',
  loadDataFail: 'Loading data fail!',
  start: 'Start',
  stop: 'Stop',
  remove: 'Remove',
  nothing: 'Nothing',
  notification: {
    levelUp: 'Skill {skill} upgrade to {level}!',
    levelTooLow: '{skill} level {level} is too low for {action} (requires {required}).',
    notEnoughMaterials: 'Not enough materials for {action}.',
    chestObtained: 'Obtained {count} {chest}',
  },
  ui: {
    level: 'Lv.{level}',
    xp: 'Experience',
    nextLevel: 'Next Level',
    xpPerCycle: 'XP per action',
    chestPoints: 'Chest points per action',
    requiredMaterials: 'Required Materials',
    noMaterialsRequired: 'None',
    rewards: 'Rewards',
    noRewards: 'None',
    amount: 'Amount',
    unlimited: 'Unlimited',
    cancel: 'Cancel',
    seconds: '{value}s',
    currentAction: 'Current Action',
    queue: 'Queued Actions',
    queuedItems: 'items',
    addToQueue: 'Add to Queue #{position}',
    startImmediately: 'Start Immediately',
    cannotStart: 'Cannot Start',
    insufficientMaterial: '{item}: Need {required}, have {available}',
    quantity: 'Quantity',
    type: 'Type',
    slot: 'Slot',
    effects: 'Effects',
    equip: 'Equip',
    unequip: 'Unequip',
    open: 'Open',
    chestOpenResults: 'Chest Opening Results',
    noItemsObtained: 'No items obtained',
    viewItem: 'View item: {item}',
    confirm: 'Confirm',
    close: 'Close',
    inventory: 'Inventory',
    equipment: 'Equipment',
    abilities: 'Abilities',
    myStuff: 'My Stuff',
    categoryChest: 'Chests',
    categoryResource: 'Resources',
    categoryEquipment: 'Equipment',
    categoryConsumable: 'Consumables',
    chests: 'Chests',
    chestsDescription: 'View all chest progress',
    currentProgress: 'Current Progress',
    progressPercentage: 'Progress',
    remainingPoints: 'Remaining',
    possibleRewards: 'Possible Rewards',
    dropChance: 'Drop Chance',
    chest: 'Chest',
    consumable: {
      empty: 'Empty',
      selectTitle: 'Select Consumable',
      noItems: 'No consumables available',
    },
    combat: {
      title: 'Combat',
      description: 'Fight enemies to gain combat experience and loot.',
      overview: 'Enemy Overview',
      enemies: 'Enemies',
      currentBattle: 'Current Battle',
      noEnemies: 'No enemies available yet.',
      noBattle: 'No battle in progress.',
      selectEnemyHint: 'Select an enemy to start.',
      viewEnemies: 'View Enemies',
      hp: 'HP',
      attack: 'Attack',
      attackInterval: 'Attack Interval',
      xpReward: 'XP Reward',
      playerStats: 'Player Stats',
      battleEstimate: 'Battle Estimate',
      prediction: 'Prediction',
      canWin: 'Victory',
      cannotWin: 'Defeat',
      battleCount: 'Battle Count',
      startBattle: 'Start Battle',
      insufficientPower: 'You are not strong enough to defeat this enemy.',
      fighting: 'Fighting {enemy}',
      cancelBattle: 'Cancel Battle',
      battleProgress: 'Battle Progress',
      remainingBattles: 'Remaining Battles',
      battleDuration: 'Battle Duration',
      autoAttack: 'Auto Attack',
      dps: 'DPS',
      cooldown: 'Attack Cooldown',
      enemyInfo: 'Enemy Stats',
      expectedRewards: 'Expected Rewards',
      perBattleRewards: 'Rewards per Battle',
      respawning: 'Respawning...',
      preparingNextBattle: 'Preparing for next battle',
      eventLog: {
        title: 'Battle Log',
        noEvents: 'No battle events yet',
        player: 'Player',
        enemy: 'Enemy',
        attackEvent: '{actor} attacked {target} for {damage} damage',
        enemyDefeated: '💀 Enemy defeated!',
        playerDefeated: '💔 Player defeated!',
        battleComplete: 'Battle Complete!',
        totalEvents: '{count} events total',
      },
    },
  },
  enemy: {
    slime: { name: 'Slime', description: 'A weak slime monster. Easy to defeat.' },
    goblin: { name: 'Goblin', description: 'A sneaky goblin. Watch out for its quick attacks.' },
    skeleton: { name: 'Skeleton', description: 'An undead skeleton warrior. Tough but slow.' },
  },
  skill: {
    mining: { name: 'Mining', description: 'Mining.' },
    woodcutting: { name: 'Woodcutting', description: 'Woodcutting.' },
    foraging: {
      name: 'Foraging',
      description: 'Foraging.',
      tab: {
        farm: 'Farm',
        plain: 'Plain',
        forest: 'Forest',
        mountain: 'Mountain',
        swamp: 'Swamp',
        desert: 'Desert',
        grassland: 'Grassland',
        volcano: 'Volcano',
      },
    },
    smithing: {
      name: 'Smithing',
      description: 'Smithing.',
      tab: {
        materials: 'Materials',
        equipment: 'Weapons',
        armor: 'Armor',
      },
    },
    woodworking: {
      name: 'Woodworking',
      description: 'Woodworking.',
      tab: {
        materials: 'Materials',
        equipment: 'Weapons',
      },
    },
    tailoring: { name: 'Tailoring', description: 'Tailoring.' },
    cooking: { name: 'Cooking', description: 'Cooking.' },
    brewing: { name: 'Brewing', description: 'Brewing.' },
    intelligence: { name: 'Intelligence', description: 'Intelligence.' },
    stamina: { name: 'Stamina', description: 'Stamina.' },
    defense: { name: 'Defense', description: 'Defense.' },
    melee: { name: 'Melee', description: 'Melee.' },
    ranged: { name: 'Ranged', description: 'Ranged.' },
    magic: { name: 'Magic', description: 'Magic.' },
  },
  slot: {
    head: { name: 'Head', description: 'Wear helmet' },
    chest: { name: 'Chest', description: 'Wear chest armor' },
    legs: { name: 'Legs', description: 'Wear leg armor' },
    feet: { name: 'Feet', description: 'Wear boots' },
    mainHand: { name: 'Main Hand', description: 'Primary weapon slot' },
    offHand: { name: 'Off Hand', description: 'Secondary weapon or shield' },
    miningTool: { name: 'Mining Tool' },
    woodcuttingTool: { name: 'Woodcutting Tool' },
    foragingTool: { name: 'Foraging Tool' },
    smithingTool: { name: 'Smithing Tool' },
    woodworkingTool: { name: 'Woodworking Tool' },
    tailoringTool: { name: 'Tailoring Tool' },
    cookingTool: { name: 'Cooking Tool' },
    brewingTool: { name: 'Brewing Tool' },
  },
  property: {
    'mining.speed': {
      name: 'Mining Speed',
    },
    'woodcutting.speed': {
      name: 'Woodcutting Speed',
    },
    'foraging.speed': {
      name: 'Foraging Speed',
    },
    'smithing.speed': {
      name: 'Smithing Speed',
    },
    'woodworking.speed': {
      name: 'Woodworking Speed',
    },
    'tailoring.speed': {
      name: 'Tailoring Speed',
    },
    'cooking.speed': {
      name: 'Cooking Speed',
    },
    'brewing.speed': {
      name: 'Brewing Speed',
    },
  },
  item: {
    copperMineChest: {
      name: 'Copper Mine Chest',
      description: 'A chest containing copper ore and related rewards.',
    },
    ironMineChest: {
      name: 'Iron Mine Chest',
      description: 'A chest containing iron ore and related rewards.',
    },
    silverMineChest: {
      name: 'Silver Mine Chest',
      description: 'A chest containing silver ore and related rewards.',
    },
    goldMineChest: {
      name: 'Gold Mine Chest',
      description: 'A chest containing gold ore and related rewards.',
    },
    orichalcumMineChest: {
      name: 'Orichalcum Mine Chest',
      description: 'A chest containing orichalcum ore and related rewards.',
    },
    darkIronMineChest: {
      name: 'Dark Iron Mine Chest',
      description: 'A chest containing dark iron ore and related rewards.',
    },
    mithrilMineChest: {
      name: 'Mithril Mine Chest',
      description: 'A chest containing mithril ore and related rewards.',
    },
    adamantineMineChest: {
      name: 'Adamantine Mine Chest',
      description: 'A chest containing adamantine ore and related rewards.',
    },
    copperOre: {
      name: 'Copper Ore',
      description: 'Copper Ore.',
    },
    copperIngot: {
      name: 'Copper Ingot',
      description: 'Copper Ingot.',
    },
    copperPickaxe: {
      name: 'Copper Pickaxe',
      description: 'Copper Pickaxe.',
    },
    copperSmithingHammer: {
      name: 'Copper Smithing Hammer',
      description: 'Copper Smithing Hammer.',
    },
    copperAxe: {
      name: 'Copper Axe',
      description: 'Copper Axe.',
    },
    copperForagingKnife: {
      name: 'Copper Foraging Knife',
      description: 'Copper Foraging Knife.',
    },
    copperWoodworkingTool: {
      name: 'Copper Woodworking Tool',
      description: 'Copper Woodworking Tool.',
    },
    copperTailoringNeedle: {
      name: 'Copper Tailoring Needle',
      description: 'Copper Tailoring Needle.',
    },
    copperCookingUtensil: {
      name: 'Copper Cooking Utensil',
      description: 'Copper Cooking Utensil.',
    },
    copperBrewingKit: {
      name: 'Copper Brewing Kit',
      description: 'Copper Brewing Kit.',
    },
    copperAlchemistKit: {
      name: 'Copper Alchemist Kit',
      description: 'Copper Alchemist Kit.',
    },
    copperEnhancingTool: {
      name: 'Copper Enhancing Tool',
      description: 'Copper Enhancing Tool.',
    },
    ironOre: { name: 'Iron Ore', description: 'Iron Ore.' },
    ironIngot: { name: 'Iron Ingot', description: 'Iron Ingot.' },
    ironPickaxe: { name: 'Iron Pickaxe', description: 'Iron Pickaxe.' },
    ironSmithingHammer: { name: 'Iron Smithing Hammer', description: 'Iron Smithing Hammer.' },
    ironAxe: { name: 'Iron Axe', description: 'Iron Axe.' },
    ironForagingKnife: { name: 'Iron Foraging Knife', description: 'Iron Foraging Knife.' },
    ironWoodworkingTool: { name: 'Iron Woodworking Tool', description: 'Iron Woodworking Tool.' },
    ironTailoringNeedle: { name: 'Iron Tailoring Needle', description: 'Iron Tailoring Needle.' },
    ironCookingUtensil: { name: 'Iron Cooking Utensil', description: 'Iron Cooking Utensil.' },
    ironBrewingKit: { name: 'Iron Brewing Kit', description: 'Iron Brewing Kit.' },
    ironAlchemistKit: { name: 'Iron Alchemist Kit', description: 'Iron Alchemist Kit.' },
    ironEnhancingTool: { name: 'Iron Enhancing Tool', description: 'Iron Enhancing Tool.' },

    silverOre: { name: 'Silver Ore', description: 'Silver Ore.' },
    silverIngot: { name: 'Silver Ingot', description: 'Silver Ingot.' },
    silverPickaxe: { name: 'Silver Pickaxe', description: 'Silver Pickaxe.' },
    silverSmithingHammer: {
      name: 'Silver Smithing Hammer',
      description: 'Silver Smithing Hammer.',
    },
    silverAxe: { name: 'Silver Axe', description: 'Silver Axe.' },
    silverForagingKnife: { name: 'Silver Foraging Knife', description: 'Silver Foraging Knife.' },
    silverWoodworkingTool: {
      name: 'Silver Woodworking Tool',
      description: 'Silver Woodworking Tool.',
    },
    silverTailoringNeedle: {
      name: 'Silver Tailoring Needle',
      description: 'Silver Tailoring Needle.',
    },
    silverCookingUtensil: {
      name: 'Silver Cooking Utensil',
      description: 'Silver Cooking Utensil.',
    },
    silverBrewingKit: { name: 'Silver Brewing Kit', description: 'Silver Brewing Kit.' },
    silverAlchemistKit: { name: 'Silver Alchemist Kit', description: 'Silver Alchemist Kit.' },
    silverEnhancingTool: { name: 'Silver Enhancing Tool', description: 'Silver Enhancing Tool.' },

    goldOre: { name: 'Gold Ore', description: 'Gold Ore.' },
    goldIngot: { name: 'Gold Ingot', description: 'Gold Ingot.' },
    goldPickaxe: { name: 'Gold Pickaxe', description: 'Gold Pickaxe.' },
    goldSmithingHammer: { name: 'Gold Smithing Hammer', description: 'Gold Smithing Hammer.' },
    goldAxe: { name: 'Gold Axe', description: 'Gold Axe.' },
    goldForagingKnife: { name: 'Gold Foraging Knife', description: 'Gold Foraging Knife.' },
    goldWoodworkingTool: { name: 'Gold Woodworking Tool', description: 'Gold Woodworking Tool.' },
    goldTailoringNeedle: { name: 'Gold Tailoring Needle', description: 'Gold Tailoring Needle.' },
    goldCookingUtensil: { name: 'Gold Cooking Utensil', description: 'Gold Cooking Utensil.' },
    goldBrewingKit: { name: 'Gold Brewing Kit', description: 'Gold Brewing Kit.' },
    goldAlchemistKit: { name: 'Gold Alchemist Kit', description: 'Gold Alchemist Kit.' },
    goldEnhancingTool: { name: 'Gold Enhancing Tool', description: 'Gold Enhancing Tool.' },

    orichalcumOre: { name: 'Orichalcum Ore', description: 'Orichalcum Ore.' },
    orichalcumIngot: { name: 'Orichalcum Ingot', description: 'Orichalcum Ingot.' },
    orichalcumPickaxe: { name: 'Orichalcum Pickaxe', description: 'Orichalcum Pickaxe.' },
    orichalcumSmithingHammer: {
      name: 'Orichalcum Smithing Hammer',
      description: 'Orichalcum Smithing Hammer.',
    },
    orichalcumAxe: { name: 'Orichalcum Axe', description: 'Orichalcum Axe.' },
    orichalcumForagingKnife: {
      name: 'Orichalcum Foraging Knife',
      description: 'Orichalcum Foraging Knife.',
    },
    orichalcumWoodworkingTool: {
      name: 'Orichalcum Woodworking Tool',
      description: 'Orichalcum Woodworking Tool.',
    },
    orichalcumTailoringNeedle: {
      name: 'Orichalcum Tailoring Needle',
      description: 'Orichalcum Tailoring Needle.',
    },
    orichalcumCookingUtensil: {
      name: 'Orichalcum Cooking Utensil',
      description: 'Orichalcum Cooking Utensil.',
    },
    orichalcumBrewingKit: {
      name: 'Orichalcum Brewing Kit',
      description: 'Orichalcum Brewing Kit.',
    },
    orichalcumAlchemistKit: {
      name: 'Orichalcum Alchemist Kit',
      description: 'Orichalcum Alchemist Kit.',
    },
    orichalcumEnhancingTool: {
      name: 'Orichalcum Enhancing Tool',
      description: 'Orichalcum Enhancing Tool.',
    },

    darkIronOre: { name: 'Dark Iron Ore', description: 'Dark Iron Ore.' },
    darkIronIngot: { name: 'Dark Iron Ingot', description: 'Dark Iron Ingot.' },
    darkIronPickaxe: { name: 'Dark Iron Pickaxe', description: 'Dark Iron Pickaxe.' },
    darkIronSmithingHammer: {
      name: 'Dark Iron Smithing Hammer',
      description: 'Dark Iron Smithing Hammer.',
    },
    darkIronAxe: { name: 'Dark Iron Axe', description: 'Dark Iron Axe.' },
    darkIronForagingKnife: {
      name: 'Dark Iron Foraging Knife',
      description: 'Dark Iron Foraging Knife.',
    },
    darkIronWoodworkingTool: {
      name: 'Dark Iron Woodworking Tool',
      description: 'Dark Iron Woodworking Tool.',
    },
    darkIronTailoringNeedle: {
      name: 'Dark Iron Tailoring Needle',
      description: 'Dark Iron Tailoring Needle.',
    },
    darkIronCookingUtensil: {
      name: 'Dark Iron Cooking Utensil',
      description: 'Dark Iron Cooking Utensil.',
    },
    darkIronBrewingKit: { name: 'Dark Iron Brewing Kit', description: 'Dark Iron Brewing Kit.' },
    darkIronAlchemistKit: {
      name: 'Dark Iron Alchemist Kit',
      description: 'Dark Iron Alchemist Kit.',
    },
    darkIronEnhancingTool: {
      name: 'Dark Iron Enhancing Tool',
      description: 'Dark Iron Enhancing Tool.',
    },

    mithrilOre: { name: 'Mithril Ore', description: 'Mithril Ore.' },
    mithrilIngot: { name: 'Mithril Ingot', description: 'Mithril Ingot.' },
    mithrilPickaxe: { name: 'Mithril Pickaxe', description: 'Mithril Pickaxe.' },
    mithrilSmithingHammer: {
      name: 'Mithril Smithing Hammer',
      description: 'Mithril Smithing Hammer.',
    },
    mithrilAxe: { name: 'Mithril Axe', description: 'Mithril Axe.' },
    mithrilForagingKnife: {
      name: 'Mithril Foraging Knife',
      description: 'Mithril Foraging Knife.',
    },
    mithrilWoodworkingTool: {
      name: 'Mithril Woodworking Tool',
      description: 'Mithril Woodworking Tool.',
    },
    mithrilTailoringNeedle: {
      name: 'Mithril Tailoring Needle',
      description: 'Mithril Tailoring Needle.',
    },
    mithrilCookingUtensil: {
      name: 'Mithril Cooking Utensil',
      description: 'Mithril Cooking Utensil.',
    },
    mithrilBrewingKit: { name: 'Mithril Brewing Kit', description: 'Mithril Brewing Kit.' },
    mithrilAlchemistKit: { name: 'Mithril Alchemist Kit', description: 'Mithril Alchemist Kit.' },
    mithrilEnhancingTool: {
      name: 'Mithril Enhancing Tool',
      description: 'Mithril Enhancing Tool.',
    },

    adamantineOre: { name: 'Adamantine Ore', description: 'Adamantine Ore.' },
    adamantineIngot: { name: 'Adamantine Ingot', description: 'Adamantine Ingot.' },
    adamantinePickaxe: { name: 'Adamantine Pickaxe', description: 'Adamantine Pickaxe.' },
    adamantineSmithingHammer: {
      name: 'Adamantine Smithing Hammer',
      description: 'Adamantine Smithing Hammer.',
    },
    adamantineAxe: { name: 'Adamantine Axe', description: 'Adamantine Axe.' },
    adamantineForagingKnife: {
      name: 'Adamantine Foraging Knife',
      description: 'Adamantine Foraging Knife.',
    },
    adamantineWoodworkingTool: {
      name: 'Adamantine Woodworking Tool',
      description: 'Adamantine Woodworking Tool.',
    },
    adamantineTailoringNeedle: {
      name: 'Adamantine Tailoring Needle',
      description: 'Adamantine Tailoring Needle.',
    },
    adamantineCookingUtensil: {
      name: 'Adamantine Cooking Utensil',
      description: 'Adamantine Cooking Utensil.',
    },
    adamantineBrewingKit: {
      name: 'Adamantine Brewing Kit',
      description: 'Adamantine Brewing Kit.',
    },
    adamantineAlchemistKit: {
      name: 'Adamantine Alchemist Kit',
      description: 'Adamantine Alchemist Kit.',
    },
    adamantineEnhancingTool: {
      name: 'Adamantine Enhancing Tool',
      description: 'Adamantine Enhancing Tool.',
    },
    copperSword: { name: 'Copper Sword', description: 'Basic one-handed sword' },
    ironGreatsword: { name: 'Iron Greatsword', description: 'Powerful two-handed sword' },
    shortBow: { name: 'Short Bow', description: 'Light ranged weapon' },
    magicStaff: { name: 'Magic Staff', description: 'Two-handed weapon for magic' },
    woodenShield: { name: 'Wooden Shield', description: 'Basic defensive tool' },
    ironHelmet: { name: 'Iron Helmet', description: 'Head protection armor' },
    willowWood: { name: 'Willow Wood', description: 'Willow Wood.' },
    pineWood: { name: 'Pine Wood', description: 'Pine Wood.' },
    oakWood: { name: 'Oak Wood', description: 'Oak Wood.' },
    mapleWood: { name: 'Maple Wood', description: 'Maple Wood.' },
    elmWood: { name: 'Elm Wood', description: 'Elm Wood.' },
    beechWood: { name: 'Beech Wood', description: 'Beech Wood.' },
    mahoganyWood: { name: 'Mahogany Wood', description: 'Mahogany Wood.' },
    ebonyWood: { name: 'Ebony Wood', description: 'Ebony Wood.' },
    willowPlank: { name: 'Willow Plank', description: 'Willow Plank.' },
    pinePlank: { name: 'Pine Plank', description: 'Pine Plank.' },
    oakPlank: { name: 'Oak Plank', description: 'Oak Plank.' },
    maplePlank: { name: 'Maple Plank', description: 'Maple Plank.' },
    elmPlank: { name: 'Elm Plank', description: 'Elm Plank.' },
    beechPlank: { name: 'Beech Plank', description: 'Beech Plank.' },
    mahoganyPlank: { name: 'Mahogany Plank', description: 'Mahogany Plank.' },
    ebonyPlank: { name: 'Ebony Plank', description: 'Ebony Plank.' },
    chicken: { name: 'Chicken', description: 'Fresh chicken meat.' },
    pork: { name: 'Pork', description: 'Fresh pork.' },
    bear: { name: 'Bear Meat', description: 'Fresh bear meat.' },
    bison: { name: 'Bison Meat', description: 'Fresh bison meat.' },
    crocodile: { name: 'Crocodile Meat', description: 'Fresh crocodile meat.' },
    camel: { name: 'Camel Meat', description: 'Fresh camel meat.' },
    venison: { name: 'Venison', description: 'Fresh deer meat.' },
    turkey: { name: 'Turkey', description: 'Fresh turkey meat.' },
    crucianCarp: { name: 'Crucian Carp', description: 'Fresh crucian carp meat.' },
    carp: { name: 'Carp', description: 'Fresh carp meat.' },
    salmon: { name: 'Salmon', description: 'Fresh salmon meat.' },
    trout: { name: 'Trout', description: 'Fresh trout meat.' },
    catfish: { name: 'Catfish', description: 'Fresh catfish meat.' },
    tuna: { name: 'Tuna', description: 'Fresh tuna meat.' },
    grassCarp: { name: 'Grass Carp', description: 'Fresh grass carp meat.' },
    grouper: { name: 'Grouper', description: 'Fresh grouper meat.' },
    cabbage: { name: 'Cabbage', description: 'Fresh cabbage.' },
    carrot: { name: 'Carrot', description: 'Fresh carrot.' },
    potato: { name: 'Potato', description: 'Fresh potato.' },
    onion: { name: 'Onion', description: 'Fresh onion.' },
    sweetPotato: { name: 'Sweet Potato', description: 'Fresh sweet potato.' },
    corn: { name: 'Corn', description: 'Fresh corn.' },
    pepper: { name: 'Pepper', description: 'Fresh pepper.' },
    konjac: { name: 'Konjac', description: 'Fresh konjac.' },
    apple: { name: 'Apple', description: 'Fresh apple.' },
    grape: { name: 'Grape', description: 'Fresh grape.' },
    berry: { name: 'Berry', description: 'Fresh berries.' },
    cherry: { name: 'Cherry', description: 'Fresh cherry.' },
    banana: { name: 'Banana', description: 'Fresh banana.' },
    cactusFruit: { name: 'Cactus Fruit', description: 'Fresh cactus fruit.' },
    peach: { name: 'Peach', description: 'Fresh peach.' },
    longan: { name: 'Longan', description: 'Fresh longan.' },
    licorice: { name: 'Licorice', description: 'A herb used for alchemy and cooking.' },
    cotton: { name: 'Cotton', description: 'Fiber used for tailoring.' },
    artemisia: { name: 'Artemisia', description: 'A herb used for alchemy and cooking.' },
    flax: { name: 'Flax', description: 'Fiber used for tailoring.' },
    ginseng: { name: 'Ginseng', description: 'A precious herb.' },
    bamboo: { name: 'Bamboo', description: 'A multipurpose plant fiber.' },
    reishi: { name: 'Reishi', description: 'A precious herb.' },
    silkworm: { name: 'Silkworm', description: 'A precious material for silk production.' },
    willowTreeChest: {
      name: 'Willow Tree Chest',
      description: 'A chest containing willow wood and related rewards.',
    },
    pineTreeChest: {
      name: 'Pine Tree Chest',
      description: 'A chest containing pine wood and related rewards.',
    },
    oakTreeChest: {
      name: 'Oak Tree Chest',
      description: 'A chest containing oak wood and related rewards.',
    },
    mapleTreeChest: {
      name: 'Maple Tree Chest',
      description: 'A chest containing maple wood and related rewards.',
    },
    elmTreeChest: {
      name: 'Elm Tree Chest',
      description: 'A chest containing elm wood and related rewards.',
    },
    beechTreeChest: {
      name: 'Beech Tree Chest',
      description: 'A chest containing beech wood and related rewards.',
    },
    mahoganyTreeChest: {
      name: 'Mahogany Tree Chest',
      description: 'A chest containing mahogany wood and related rewards.',
    },
    ebonyTreeChest: {
      name: 'Ebony Tree Chest',
      description: 'A chest containing ebony wood and related rewards.',
    },
    willowPlankChest: {
      name: 'Willow Plank Chest',
      description: 'A chest containing willow planks and related rewards.',
    },
    pinePlankChest: {
      name: 'Pine Plank Chest',
      description: 'A chest containing pine planks and related rewards.',
    },
    oakPlankChest: {
      name: 'Oak Plank Chest',
      description: 'A chest containing oak planks and related rewards.',
    },
    maplePlankChest: {
      name: 'Maple Plank Chest',
      description: 'A chest containing maple planks and related rewards.',
    },
    elmPlankChest: {
      name: 'Elm Plank Chest',
      description: 'A chest containing elm planks and related rewards.',
    },
    beechPlankChest: {
      name: 'Beech Plank Chest',
      description: 'A chest containing beech planks and related rewards.',
    },
    mahoganyPlankChest: {
      name: 'Mahogany Plank Chest',
      description: 'A chest containing mahogany planks and related rewards.',
    },
    ebonyPlankChest: {
      name: 'Ebony Plank Chest',
      description: 'A chest containing ebony planks and related rewards.',
    },
    farmChest: {
      name: 'Farm Chest',
      description: 'A chest containing farm produce and related rewards.',
    },
    plainChest: {
      name: 'Plain Chest',
      description: 'A chest containing plain produce and related rewards.',
    },
    forestChest: {
      name: 'Forest Chest',
      description: 'A chest containing forest produce and related rewards.',
    },
    mountainChest: {
      name: 'Mountain Chest',
      description: 'A chest containing mountain produce and related rewards.',
    },
    swampChest: {
      name: 'Swamp Chest',
      description: 'A chest containing swamp produce and related rewards.',
    },
    desertChest: {
      name: 'Desert Chest',
      description: 'A chest containing desert produce and related rewards.',
    },
    grasslandChest: {
      name: 'Grassland Chest',
      description: 'A chest containing grassland produce and related rewards.',
    },
    volcanoChest: {
      name: 'Volcano Chest',
      description: 'A chest containing volcano produce and related rewards.',
    },

    speedCoffeeLow: {
      name: 'Low-Grade Speed Coffee',
      description: 'Increases skill speed by 8% for 1 minute.',
    },
    speedCoffeeMid: {
      name: 'Mid-Grade Speed Coffee',
      description: 'Increases skill speed by 15% for 2 minutes.',
    },
    speedCoffeeHigh: {
      name: 'High-Grade Speed Coffee',
      description: 'Increases skill speed by 25% for 3 minutes.',
    },
    xpCoffeeLow: {
      name: 'Low-Grade XP Coffee',
      description: 'Increases XP gain by 10% for 1 minute.',
    },
    xpCoffeeMid: {
      name: 'Mid-Grade XP Coffee',
      description: 'Increases XP gain by 20% for 2 minutes.',
    },
    xpCoffeeHigh: {
      name: 'High-Grade XP Coffee',
      description: 'Increases XP gain by 35% for 3 minutes.',
    },
    pointsCoffeeLow: {
      name: 'Low-Grade Points Coffee',
      description: 'Increases chest points gain by 10% for 1 minute.',
    },
    pointsCoffeeMid: {
      name: 'Mid-Grade Points Coffee',
      description: 'Increases chest points gain by 20% for 2 minutes.',
    },
    pointsCoffeeHigh: {
      name: 'High-Grade Points Coffee',
      description: 'Increases chest points gain by 35% for 3 minutes.',
    },
  },
  action: {
    materials: {
      name: 'Materials',
      description: 'Basic materials and intermediates.',
    },
    tools: {
      name: 'Tools',
      description: 'Tools and utensils for production and gathering.',
    },
    equipment: {
      name: 'Weapons',
      description: 'Craft various weapons.',
    },
    armor: {
      name: 'Armor',
      description: 'Craft various armor pieces.',
    },
    copperMine: {
      name: 'Copper Mine',
      description: 'Mine Copper Ore using Copper Pickaxe.',
    },
    copperIngot: {
      name: 'Copper Ingot',
      description: 'Copper Ingot.',
    },
    copperPickaxe: {
      name: 'Copper Pickaxe',
      description: 'Copper Pickaxe.',
    },
    copperSmithingHammer: {
      name: 'Copper Smithing Hammer',
      description: 'Copper Smithing Hammer.',
    },
    copperAxe: {
      name: 'Copper Axe',
      description: 'Recipe to craft Copper Axe.',
    },
    copperForagingKnife: {
      name: 'Copper Foraging Knife',
      description: 'Recipe to craft Copper Foraging Knife.',
    },
    copperWoodworkingTool: {
      name: 'Copper Woodworking Tool',
      description: 'Recipe to craft Copper Woodworking Tool.',
    },
    copperTailoringNeedle: {
      name: 'Copper Tailoring Needle',
      description: 'Recipe to craft Copper Tailoring Needle.',
    },
    copperCookingUtensil: {
      name: 'Copper Cooking Utensil',
      description: 'Recipe to craft Copper Cooking Utensil.',
    },
    copperBrewingKit: {
      name: 'Copper Brewing Kit',
      description: 'Recipe to craft Copper Brewing Kit.',
    },
    copperAlchemistKit: {
      name: 'Copper Alchemist Kit',
      description: 'Recipe to craft Copper Alchemist Kit.',
    },
    copperEnhancingTool: {
      name: 'Copper Enhancing Tool',
      description: 'Recipe to craft Copper Enhancing Tool.',
    },
    ironMine: { name: 'Iron Mine', description: 'Mine Iron Ore in the Iron Mine.' },
    ironIngot: { name: 'Iron Ingot', description: 'Iron Ingot.' },
    ironPickaxe: { name: 'Iron Pickaxe', description: 'Recipe to craft Iron Pickaxe.' },
    ironSmithingHammer: {
      name: 'Iron Smithing Hammer',
      description: 'Use Iron Smithing Hammer to smelt Iron Ingots.',
    },
    ironAxe: { name: 'Iron Axe', description: 'Recipe to craft Iron Axe.' },
    ironForagingKnife: {
      name: 'Iron Foraging Knife',
      description: 'Recipe to craft Iron Foraging Knife.',
    },
    ironWoodworkingTool: {
      name: 'Iron Woodworking Tool',
      description: 'Recipe to craft Iron Woodworking Tool.',
    },
    ironTailoringNeedle: {
      name: 'Iron Tailoring Needle',
      description: 'Recipe to craft Iron Tailoring Needle.',
    },
    ironCookingUtensil: {
      name: 'Iron Cooking Utensil',
      description: 'Recipe to craft Iron Cooking Utensil.',
    },
    ironBrewingKit: { name: 'Iron Brewing Kit', description: 'Recipe to craft Iron Brewing Kit.' },
    ironAlchemistKit: {
      name: 'Iron Alchemist Kit',
      description: 'Recipe to craft Iron Alchemist Kit.',
    },
    ironEnhancingTool: {
      name: 'Iron Enhancing Tool',
      description: 'Recipe to craft Iron Enhancing Tool.',
    },

    silverMine: { name: 'Silver Mine', description: 'Mine Silver Ore in the Silver Mine.' },
    silverIngot: { name: 'Silver Ingot', description: 'Silver Ingot.' },
    silverPickaxe: { name: 'Silver Pickaxe', description: 'Recipe to craft Silver Pickaxe.' },
    silverSmithingHammer: {
      name: 'Silver Smithing Hammer',
      description: 'Use Silver Smithing Hammer to smelt Silver Ingots.',
    },
    silverAxe: { name: 'Silver Axe', description: 'Recipe to craft Silver Axe.' },
    silverForagingKnife: {
      name: 'Silver Foraging Knife',
      description: 'Recipe to craft Silver Foraging Knife.',
    },
    silverWoodworkingTool: {
      name: 'Silver Woodworking Tool',
      description: 'Recipe to craft Silver Woodworking Tool.',
    },
    silverTailoringNeedle: {
      name: 'Silver Tailoring Needle',
      description: 'Recipe to craft Silver Tailoring Needle.',
    },
    silverCookingUtensil: {
      name: 'Silver Cooking Utensil',
      description: 'Recipe to craft Silver Cooking Utensil.',
    },
    silverBrewingKit: {
      name: 'Silver Brewing Kit',
      description: 'Recipe to craft Silver Brewing Kit.',
    },
    silverAlchemistKit: {
      name: 'Silver Alchemist Kit',
      description: 'Recipe to craft Silver Alchemist Kit.',
    },
    silverEnhancingTool: {
      name: 'Silver Enhancing Tool',
      description: 'Recipe to craft Silver Enhancing Tool.',
    },

    goldMine: { name: 'Gold Mine', description: 'Mine Gold Ore in the Gold Mine.' },
    goldIngot: { name: 'Gold Ingot', description: 'Gold Ingot.' },
    goldPickaxe: { name: 'Gold Pickaxe', description: 'Recipe to craft Gold Pickaxe.' },
    goldSmithingHammer: {
      name: 'Gold Smithing Hammer',
      description: 'Use Gold Smithing Hammer to smelt Gold Ingots.',
    },
    goldAxe: { name: 'Gold Axe', description: 'Recipe to craft Gold Axe.' },
    goldForagingKnife: {
      name: 'Gold Foraging Knife',
      description: 'Recipe to craft Gold Foraging Knife.',
    },
    goldWoodworkingTool: {
      name: 'Gold Woodworking Tool',
      description: 'Recipe to craft Gold Woodworking Tool.',
    },
    goldTailoringNeedle: {
      name: 'Gold Tailoring Needle',
      description: 'Recipe to craft Gold Tailoring Needle.',
    },
    goldCookingUtensil: {
      name: 'Gold Cooking Utensil',
      description: 'Recipe to craft Gold Cooking Utensil.',
    },
    goldBrewingKit: { name: 'Gold Brewing Kit', description: 'Recipe to craft Gold Brewing Kit.' },
    goldAlchemistKit: {
      name: 'Gold Alchemist Kit',
      description: 'Recipe to craft Gold Alchemist Kit.',
    },
    goldEnhancingTool: {
      name: 'Gold Enhancing Tool',
      description: 'Recipe to craft Gold Enhancing Tool.',
    },

    orichalcumMine: {
      name: 'Orichalcum Mine',
      description: 'Mine Orichalcum Ore in the Orichalcum Mine.',
    },
    orichalcumIngot: { name: 'Orichalcum Ingot', description: 'Orichalcum Ingot.' },
    orichalcumPickaxe: {
      name: 'Orichalcum Pickaxe',
      description: 'Recipe to craft Orichalcum Pickaxe.',
    },
    orichalcumSmithingHammer: {
      name: 'Orichalcum Smithing Hammer',
      description: 'Use Orichalcum Smithing Hammer to smelt Orichalcum Ingots.',
    },
    orichalcumAxe: { name: 'Orichalcum Axe', description: 'Recipe to craft Orichalcum Axe.' },
    orichalcumForagingKnife: {
      name: 'Orichalcum Foraging Knife',
      description: 'Recipe to craft Orichalcum Foraging Knife.',
    },
    orichalcumWoodworkingTool: {
      name: 'Orichalcum Woodworking Tool',
      description: 'Recipe to craft Orichalcum Woodworking Tool.',
    },
    orichalcumTailoringNeedle: {
      name: 'Orichalcum Tailoring Needle',
      description: 'Recipe to craft Orichalcum Tailoring Needle.',
    },
    orichalcumCookingUtensil: {
      name: 'Orichalcum Cooking Utensil',
      description: 'Recipe to craft Orichalcum Cooking Utensil.',
    },
    orichalcumBrewingKit: {
      name: 'Orichalcum Brewing Kit',
      description: 'Recipe to craft Orichalcum Brewing Kit.',
    },
    orichalcumAlchemistKit: {
      name: 'Orichalcum Alchemist Kit',
      description: 'Recipe to craft Orichalcum Alchemist Kit.',
    },
    orichalcumEnhancingTool: {
      name: 'Orichalcum Enhancing Tool',
      description: 'Recipe to craft Orichalcum Enhancing Tool.',
    },

    darkIronMine: {
      name: 'Dark Iron Mine',
      description: 'Mine Dark Iron Ore in the Dark Iron Mine.',
    },
    darkIronIngot: { name: 'Dark Iron Ingot', description: 'Dark Iron Ingot.' },
    darkIronPickaxe: {
      name: 'Dark Iron Pickaxe',
      description: 'Recipe to craft Dark Iron Pickaxe.',
    },
    darkIronSmithingHammer: {
      name: 'Dark Iron Smithing Hammer',
      description: 'Use Dark Iron Smithing Hammer to smelt Dark Iron Ingots.',
    },
    darkIronAxe: { name: 'Dark Iron Axe', description: 'Recipe to craft Dark Iron Axe.' },
    darkIronForagingKnife: {
      name: 'Dark Iron Foraging Knife',
      description: 'Recipe to craft Dark Iron Foraging Knife.',
    },
    darkIronWoodworkingTool: {
      name: 'Dark Iron Woodworking Tool',
      description: 'Recipe to craft Dark Iron Woodworking Tool.',
    },
    darkIronTailoringNeedle: {
      name: 'Dark Iron Tailoring Needle',
      description: 'Recipe to craft Dark Iron Tailoring Needle.',
    },
    darkIronCookingUtensil: {
      name: 'Dark Iron Cooking Utensil',
      description: 'Recipe to craft Dark Iron Cooking Utensil.',
    },
    darkIronBrewingKit: {
      name: 'Dark Iron Brewing Kit',
      description: 'Recipe to craft Dark Iron Brewing Kit.',
    },
    darkIronAlchemistKit: {
      name: 'Dark Iron Alchemist Kit',
      description: 'Recipe to craft Dark Iron Alchemist Kit.',
    },
    darkIronEnhancingTool: {
      name: 'Dark Iron Enhancing Tool',
      description: 'Recipe to craft Dark Iron Enhancing Tool.',
    },

    mithrilMine: { name: 'Mithril Mine', description: 'Mine Mithril Ore in the Mithril Mine.' },
    mithrilIngot: { name: 'Mithril Ingot', description: 'Mithril Ingot.' },
    mithrilPickaxe: { name: 'Mithril Pickaxe', description: 'Recipe to craft Mithril Pickaxe.' },
    mithrilSmithingHammer: {
      name: 'Mithril Smithing Hammer',
      description: 'Use Mithril Smithing Hammer to smelt Mithril Ingots.',
    },
    mithrilAxe: { name: 'Mithril Axe', description: 'Recipe to craft Mithril Axe.' },
    mithrilForagingKnife: {
      name: 'Mithril Foraging Knife',
      description: 'Recipe to craft Mithril Foraging Knife.',
    },
    mithrilWoodworkingTool: {
      name: 'Mithril Woodworking Tool',
      description: 'Recipe to craft Mithril Woodworking Tool.',
    },
    mithrilTailoringNeedle: {
      name: 'Mithril Tailoring Needle',
      description: 'Recipe to craft Mithril Tailoring Needle.',
    },
    mithrilCookingUtensil: {
      name: 'Mithril Cooking Utensil',
      description: 'Recipe to craft Mithril Cooking Utensil.',
    },
    mithrilBrewingKit: {
      name: 'Mithril Brewing Kit',
      description: 'Recipe to craft Mithril Brewing Kit.',
    },
    mithrilAlchemistKit: {
      name: 'Mithril Alchemist Kit',
      description: 'Recipe to craft Mithril Alchemist Kit.',
    },
    mithrilEnhancingTool: {
      name: 'Mithril Enhancing Tool',
      description: 'Recipe to craft Mithril Enhancing Tool.',
    },

    adamantineMine: {
      name: 'Adamantine Mine',
      description: 'Mine Adamantine Ore in the Adamantine Mine.',
    },
    adamantineIngot: { name: 'Adamantine Ingot', description: 'Adamantine Ingot.' },
    adamantinePickaxe: {
      name: 'Adamantine Pickaxe',
      description: 'Recipe to craft Adamantine Pickaxe.',
    },
    adamantineSmithingHammer: {
      name: 'Adamantine Smithing Hammer',
      description: 'Use Adamantine Smithing Hammer to smelt Adamantine Ingots.',
    },
    adamantineAxe: { name: 'Adamantine Axe', description: 'Recipe to craft Adamantine Axe.' },
    adamantineForagingKnife: {
      name: 'Adamantine Foraging Knife',
      description: 'Recipe to craft Adamantine Foraging Knife.',
    },
    adamantineWoodworkingTool: {
      name: 'Adamantine Woodworking Tool',
      description: 'Recipe to craft Adamantine Woodworking Tool.',
    },
    adamantineTailoringNeedle: {
      name: 'Adamantine Tailoring Needle',
      description: 'Recipe to craft Adamantine Tailoring Needle.',
    },
    adamantineCookingUtensil: {
      name: 'Adamantine Cooking Utensil',
      description: 'Recipe to craft Adamantine Cooking Utensil.',
    },
    adamantineBrewingKit: {
      name: 'Adamantine Brewing Kit',
      description: 'Recipe to craft Adamantine Brewing Kit.',
    },
    adamantineAlchemistKit: {
      name: 'Adamantine Alchemist Kit',
      description: 'Recipe to craft Adamantine Alchemist Kit.',
    },
    adamantineEnhancingTool: {
      name: 'Adamantine Enhancing Tool',
      description: 'Recipe to craft Adamantine Enhancing Tool.',
    },
    craftCopperSword: { name: 'Craft Copper Sword', description: 'Forge a copper sword from copper ingots' },
    craftWoodenShield: { name: 'Craft Wooden Shield', description: 'Craft a wooden shield from willow planks' },
    craftIronGreatsword: { name: 'Craft Iron Greatsword', description: 'Forge a powerful two-handed sword from iron ingots' },
    craftShortBow: { name: 'Craft Short Bow', description: 'Craft a short bow from willow planks' },
    craftMagicStaff: { name: 'Craft Magic Staff', description: 'Forge a magic staff from silver ingots' },
    craftIronHelmet: { name: 'Craft Iron Helmet', description: 'Forge an iron helmet from iron ingots' },
    willowTree: {
      name: 'Willow Tree',
      description: 'Cut willow wood using axe.',
    },
    pineTree: {
      name: 'Pine Tree',
      description: 'Cut pine wood using axe.',
    },
    oakTree: {
      name: 'Oak Tree',
      description: 'Cut oak wood using axe.',
    },
    mapleTree: {
      name: 'Maple Tree',
      description: 'Cut maple wood using axe.',
    },
    elmTree: {
      name: 'Elm Tree',
      description: 'Cut elm wood using axe.',
    },
    beechTree: {
      name: 'Beech Tree',
      description: 'Cut beech wood using axe.',
    },
    mahoganyTree: {
      name: 'Mahogany Tree',
      description: 'Cut mahogany wood using axe.',
    },
    ebonyTree: {
      name: 'Ebony Tree',
      description: 'Cut ebony wood using axe.',
    },
    willowPlank: {
      name: 'Willow Plank',
      description: 'Recipe to craft willow plank.',
    },
    pinePlank: {
      name: 'Pine Plank',
      description: 'Recipe to craft pine plank.',
    },
    oakPlank: {
      name: 'Oak Plank',
      description: 'Recipe to craft oak plank.',
    },
    maplePlank: {
      name: 'Maple Plank',
      description: 'Recipe to craft maple plank.',
    },
    elmPlank: {
      name: 'Elm Plank',
      description: 'Recipe to craft elm plank.',
    },
    beechPlank: {
      name: 'Beech Plank',
      description: 'Recipe to craft beech plank.',
    },
    mahoganyPlank: {
      name: 'Mahogany Plank',
      description: 'Recipe to craft mahogany plank.',
    },
    ebonyPlank: {
      name: 'Ebony Plank',
      description: 'Recipe to craft ebony plank.',
    },
    farm: {
      name: 'Farm',
      description: 'Gather various farm produce.',
    },
    chicken: {
      name: 'Chicken',
      description: 'Gather chicken at the farm.',
    },
    crucianCarp: {
      name: 'Crucian Carp',
      description: 'Gather crucian carp at the farm.',
    },
    cabbage: {
      name: 'Cabbage',
      description: 'Gather cabbage at the farm.',
    },
    apple: {
      name: 'Apple',
      description: 'Gather apple at the farm.',
    },
    licorice: {
      name: 'Licorice',
      description: 'Gather licorice at the farm.',
    },
    plain: {
      name: 'Plain',
      description: 'Gather various plain produce.',
    },
    pork: {
      name: 'Pork',
      description: 'Gather pork at the plain.',
    },
    carp: {
      name: 'Carp',
      description: 'Gather carp at the plain.',
    },
    carrot: {
      name: 'Carrot',
      description: 'Gather carrot at the plain.',
    },
    grape: {
      name: 'Grape',
      description: 'Gather grape at the plain.',
    },
    cotton: {
      name: 'Cotton',
      description: 'Gather cotton at the plain.',
    },
    forest: {
      name: 'Forest',
      description: 'Gather various forest produce.',
    },
    bear: {
      name: 'Bear Meat',
      description: 'Gather bear meat in the forest.',
    },
    salmon: {
      name: 'Salmon',
      description: 'Gather salmon in the forest.',
    },
    potato: {
      name: 'Potato',
      description: 'Gather potato in the forest.',
    },
    berry: {
      name: 'Berry',
      description: 'Gather berries in the forest.',
    },
    artemisia: {
      name: 'Artemisia',
      description: 'Gather artemisia in the forest.',
    },
    mountain: {
      name: 'Mountain',
      description: 'Gather various mountain produce.',
    },
    bison: {
      name: 'Bison Meat',
      description: 'Gather bison meat in the mountain.',
    },
    trout: {
      name: 'Trout',
      description: 'Gather trout in the mountain.',
    },
    onion: {
      name: 'Onion',
      description: 'Gather onion in the mountain.',
    },
    cherry: {
      name: 'Cherry',
      description: 'Gather cherry in the mountain.',
    },
    flax: {
      name: 'Flax',
      description: 'Gather flax in the mountain.',
    },
    swamp: {
      name: 'Swamp',
      description: 'Gather various swamp produce.',
    },
    crocodile: {
      name: 'Crocodile Meat',
      description: 'Gather crocodile meat in the swamp.',
    },
    catfish: {
      name: 'Catfish',
      description: 'Gather catfish in the swamp.',
    },
    sweetPotato: {
      name: 'Sweet Potato',
      description: 'Gather sweet potato in the swamp.',
    },
    banana: {
      name: 'Banana',
      description: 'Gather banana in the swamp.',
    },
    ginseng: {
      name: 'Ginseng',
      description: 'Gather ginseng in the swamp.',
    },
    desert: {
      name: 'Desert',
      description: 'Gather various desert produce.',
    },
    camel: {
      name: 'Camel Meat',
      description: 'Gather camel meat in the desert.',
    },
    tuna: {
      name: 'Tuna',
      description: 'Gather tuna in the desert.',
    },
    corn: {
      name: 'Corn',
      description: 'Gather corn in the desert.',
    },
    cactusFruit: {
      name: 'Cactus Fruit',
      description: 'Gather cactus fruit in the desert.',
    },
    bamboo: {
      name: 'Bamboo',
      description: 'Gather bamboo in the desert.',
    },
    grassland: {
      name: 'Grassland',
      description: 'Gather various grassland produce.',
    },
    venison: {
      name: 'Venison',
      description: 'Gather venison in the grassland.',
    },
    grassCarp: {
      name: 'Grass Carp',
      description: 'Gather grass carp in the grassland.',
    },
    pepper: {
      name: 'Pepper',
      description: 'Gather pepper in the grassland.',
    },
    peach: {
      name: 'Peach',
      description: 'Gather peach in the grassland.',
    },
    reishi: {
      name: 'Reishi',
      description: 'Gather reishi in the grassland.',
    },
    volcano: {
      name: 'Volcano',
      description: 'Gather various volcano produce.',
    },
    turkey: {
      name: 'Turkey',
      description: 'Gather turkey at the volcano.',
    },
    grouper: {
      name: 'Grouper',
      description: 'Gather grouper at the volcano.',
    },
    konjac: {
      name: 'Konjac',
      description: 'Gather konjac at the volcano.',
    },
    longan: {
      name: 'Longan',
      description: 'Gather longan at the volcano.',
    },
    silkworm: {
      name: 'Silkworm',
      description: 'Gather silkworm at the volcano.',
    },
    speedCoffeeLow: {
      name: 'Low-Grade Speed Coffee',
      description: 'Increases skill speed by 8% for 1 minute.',
    },
    speedCoffeeMid: {
      name: 'Mid-Grade Speed Coffee',
      description: 'Increases skill speed by 15% for 2 minutes.',
    },
    speedCoffeeHigh: {
      name: 'High-Grade Speed Coffee',
      description: 'Increases skill speed by 25% for 3 minutes.',
    },
    xpCoffeeLow: {
      name: 'Low-Grade XP Coffee',
      description: 'Increases XP gain by 10% for 1 minute.',
    },
    xpCoffeeMid: {
      name: 'Mid-Grade XP Coffee',
      description: 'Increases XP gain by 20% for 2 minutes.',
    },
    xpCoffeeHigh: {
      name: 'High-Grade XP Coffee',
      description: 'Increases XP gain by 35% for 3 minutes.',
    },
    pointsCoffeeLow: {
      name: 'Low-Grade Points Coffee',
      description: 'Increases chest points gain by 10% for 1 minute.',
    },
    pointsCoffeeMid: {
      name: 'Mid-Grade Points Coffee',
      description: 'Increases chest points gain by 20% for 2 minutes.',
    },
    pointsCoffeeHigh: {
      name: 'High-Grade Points Coffee',
      description: 'Increases chest points gain by 35% for 3 minutes.',
    },
  },
  stat: {
    miningSpeed: { name: 'Mining Speed', description: 'Increases mining skill speed.' },
    woodcuttingSpeed: {
      name: 'Woodcutting Speed',
      description: 'Increases woodcutting skill speed.',
    },
    foragingSpeed: { name: 'Foraging Speed', description: 'Increases foraging skill speed.' },
    smithingSpeed: { name: 'Smithing Speed', description: 'Increases smithing skill speed.' },
    woodworkingSpeed: {
      name: 'Woodworking Speed',
      description: 'Increases woodworking skill speed.',
    },
    tailoringSpeed: { name: 'Tailoring Speed', description: 'Increases tailoring skill speed.' },
    cookingSpeed: { name: 'Cooking Speed', description: 'Increases cooking skill speed.' },
    brewingSpeed: { name: 'Brewing Speed', description: 'Increases brewing skill speed.' },
    miningXpGain: { name: 'Mining XP Gain', description: 'Increases mining XP gain.' },
    miningChestPointsGain: {
      name: 'Mining Chest Points Gain',
      description: 'Increases mining chest points gain.',
    },
    woodcuttingXpGain: {
      name: 'Woodcutting XP Gain',
      description: 'Increases woodcutting XP gain.',
    },
    woodcuttingChestPointsGain: {
      name: 'Woodcutting Chest Points Gain',
      description: 'Increases woodcutting chest points gain.',
    },
    foragingXpGain: { name: 'Foraging XP Gain', description: 'Increases foraging XP gain.' },
    foragingChestPointsGain: {
      name: 'Foraging Chest Points Gain',
      description: 'Increases foraging chest points gain.',
    },
    smithingXpGain: { name: 'Smithing XP Gain', description: 'Increases smithing XP gain.' },
    smithingChestPointsGain: {
      name: 'Smithing Chest Points Gain',
      description: 'Increases smithing chest points gain.',
    },
    woodworkingXpGain: {
      name: 'Woodworking XP Gain',
      description: 'Increases woodworking XP gain.',
    },
    woodworkingChestPointsGain: {
      name: 'Woodworking Chest Points Gain',
      description: 'Increases woodworking chest points gain.',
    },
    tailoringXpGain: { name: 'Tailoring XP Gain', description: 'Increases tailoring XP gain.' },
    tailoringChestPointsGain: {
      name: 'Tailoring Chest Points Gain',
      description: 'Increases tailoring chest points gain.',
    },
    cookingXpGain: { name: 'Cooking XP Gain', description: 'Increases cooking XP gain.' },
    cookingChestPointsGain: {
      name: 'Cooking Chest Points Gain',
      description: 'Increases cooking chest points gain.',
    },
    brewingXpGain: { name: 'Brewing XP Gain', description: 'Increases brewing XP gain.' },
    brewingChestPointsGain: {
      name: 'Brewing Chest Points Gain',
      description: 'Increases brewing chest points gain.',
    },
  },
}
