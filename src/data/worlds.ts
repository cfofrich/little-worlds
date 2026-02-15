import { ImageSourcePropType } from 'react-native';
import type { RootStackParamList } from '../../App';
import { StickerDefinition } from '../components/stickers/types';

export type WorldId = 'playground' | 'beach' | 'construction' | 'farm' | 'space' | 'zoo';
export type WorldRouteName = Exclude<keyof RootStackParamList, 'Home'>;

export type WorldConfig = {
  id: WorldId;
  routeName: WorldRouteName;
  name: string;
  worldLabel: string;
  cardColor: string;
  worldBackgroundSource: ImageSourcePropType;
  homeBackgroundSource: ImageSourcePropType;
  titleImageSource: ImageSourcePropType;
  stickers: StickerDefinition[];
};

function sticker(
  id: string,
  name: string,
  color: string,
  imageSource: ImageSourcePropType
): StickerDefinition {
  return {
    id,
    name,
    color,
    glowColor: color,
    imageSource,
  };
}

const PLAYGROUND_STICKERS: StickerDefinition[] = [
  sticker('playground-cat', 'Cat', '#f97316', require('../../assets/stickers/playground/cat.png')),
  sticker('playground-dog', 'Dog', '#a16207', require('../../assets/stickers/playground/dog.png')),
  sticker(
    'playground-dumptrucktransparent',
    'Dump Truck',
    '#f59e0b',
    require('../../assets/stickers/playground/dumptrucktransparent.png')
  ),
  sticker('playground-kite', 'Kite', '#0ea5e9', require('../../assets/stickers/playground/kite.png')),
  sticker('playground-seasaw', 'Seesaw', '#8b5cf6', require('../../assets/stickers/playground/seasaw.png')),
  sticker('playground-slide', 'Slide', '#22c55e', require('../../assets/stickers/playground/slide.png')),
  sticker('playground-soccerball', 'Soccer Ball', '#eab308', require('../../assets/stickers/playground/soccerball.png')),
  sticker('playground-toddlerboy', 'Boy', '#3b82f6', require('../../assets/stickers/playground/toddlerboy.png')),
  sticker('playground-toddlergirl', 'Girl', '#ec4899', require('../../assets/stickers/playground/toddlergirl.png')),
  sticker('playground-tree', 'Tree', '#16a34a', require('../../assets/stickers/playground/tree.png')),
];

const BEACH_STICKERS: StickerDefinition[] = [
  sticker('beach-beach-ball', 'Beach Ball', '#ef4444', require('../../assets/stickers/beach/Beach Ball.png')),
  sticker('beach-crab', 'Crab', '#f97316', require('../../assets/stickers/beach/Crab.png')),
  sticker('beach-sand-castle', 'Sand Castle', '#f59e0b', require('../../assets/stickers/beach/Sand Castle.png')),
  sticker('beach-sailboat', 'Sailboat', '#06b6d4', require('../../assets/stickers/beach/sailboat.png')),
  sticker('beach-starfish', 'Starfish', '#fb7185', require('../../assets/stickers/beach/Starfish.png')),
  sticker('beach-sun', 'Sun', '#eab308', require('../../assets/stickers/beach/sun.png')),
  sticker('beach-surfboard', 'Surfboard', '#3b82f6', require('../../assets/stickers/beach/Surfboard.png')),
  sticker('beach-umbrella', 'Umbrella', '#a855f7', require('../../assets/stickers/beach/umbrella.png')),
];

const CONSTRUCTION_STICKERS: StickerDefinition[] = [
  sticker('construction-bulldozer', 'Bulldozer', '#f59e0b', require('../../assets/stickers/construction/bulldozer.png')),
  sticker(
    'construction-construction-worker',
    'Construction Worker',
    '#f97316',
    require('../../assets/stickers/construction/construction worker.png')
  ),
  sticker('construction-crane', 'Crane', '#facc15', require('../../assets/stickers/construction/crane.png')),
  sticker('construction-dump-truck', 'Dump Truck', '#eab308', require('../../assets/stickers/construction/dumptruck.png')),
  sticker('construction-excavator', 'Excavator', '#fb923c', require('../../assets/stickers/construction/excavator.png')),
  sticker('construction-orange-barrel', 'Orange Barrel', '#f87171', require('../../assets/stickers/construction/orange barrel.png')),
  sticker('construction-traffic-cone', 'Traffic Cone', '#ef4444', require('../../assets/stickers/construction/traffic cone.png')),
  sticker('construction-wheelbarrow', 'Wheelbarrow', '#0ea5e9', require('../../assets/stickers/construction/wheelbarrow.png')),
];

const FARM_STICKERS: StickerDefinition[] = [
  sticker('farm-chicken', 'Chicken', '#f59e0b', require('../../assets/stickers/farm/chicken.png')),
  sticker('farm-cow', 'Cow', '#94a3b8', require('../../assets/stickers/farm/Cow.png')),
  sticker('farm-farmer', 'Farmer', '#2563eb', require('../../assets/stickers/farm/farmer.png')),
  sticker('farm-horse', 'Horse', '#a16207', require('../../assets/stickers/farm/horse.png')),
  sticker('farm-jackrabbit', 'Jackrabbit', '#64748b', require('../../assets/stickers/farm/Jackrabbit.png')),
  sticker('farm-pig', 'Pig', '#ec4899', require('../../assets/stickers/farm/Pig.png')),
  sticker('farm-sheep', 'Sheep', '#22c55e', require('../../assets/stickers/farm/sheep.png')),
  sticker('farm-tractor', 'Tractor', '#16a34a', require('../../assets/stickers/farm/tractor.png')),
];

const SPACE_STICKERS: StickerDefinition[] = [
  sticker('space-alien', 'Alien', '#22c55e', require('../../assets/stickers/space/Alien.png')),
  sticker('space-astronaut', 'Astronaut', '#f8fafc', require('../../assets/stickers/space/Astronaut.png')),
  sticker('space-moon', 'Moon', '#e2e8f0', require('../../assets/stickers/space/Moon.png')),
  sticker('space-planet', 'Planet', '#a78bfa', require('../../assets/stickers/space/Planet.png')),
  sticker('space-rocket-ship', 'Rocket Ship', '#38bdf8', require('../../assets/stickers/space/Rocket Ship.png')),
  sticker('space-space-cat', 'Space Cat', '#f97316', require('../../assets/stickers/space/Space Cat.png')),
  sticker('space-star', 'Star', '#facc15', require('../../assets/stickers/space/Star.png')),
  sticker('space-ufo', 'UFO', '#06b6d4', require('../../assets/stickers/space/UFO.png')),
];

const ZOO_STICKERS: StickerDefinition[] = [
  sticker('zoo-elephant', 'Elephant', '#94a3b8', require('../../assets/stickers/zoo/Elephant.png')),
  sticker('zoo-giraffe', 'Giraffe', '#f59e0b', require('../../assets/stickers/zoo/Giraffe.png')),
  sticker('zoo-hippo', 'Hippo', '#64748b', require('../../assets/stickers/zoo/Hippo.png')),
  sticker('zoo-lion', 'Lion', '#f97316', require('../../assets/stickers/zoo/Lion.png')),
  sticker('zoo-monkey', 'Monkey', '#a16207', require('../../assets/stickers/zoo/Monkey.png')),
  sticker('zoo-penguin', 'Penguin', '#06b6d4', require('../../assets/stickers/zoo/Penguin.png')),
  sticker('zoo-zebra', 'Zebra', '#334155', require('../../assets/stickers/zoo/Zebra.png')),
  sticker('zoo-zookeeper', 'Zoo Keeper', '#22c55e', require('../../assets/stickers/zoo/Zoo Kepper.png')),
];

const WORLD_CONFIGS: Record<WorldId, WorldConfig> = {
  playground: {
    id: 'playground',
    routeName: 'Playground',
    name: 'Playground',
    worldLabel: 'Playground Stickers',
    cardColor: '#FFB84D',
    worldBackgroundSource: require('../../assets/backgrounds/worlds/playground.png'),
    homeBackgroundSource: require('../../assets/backgrounds/backgrounds_homescreen/playground.png'),
    titleImageSource: require('../../assets/worldtitles/playground.png'),
    stickers: PLAYGROUND_STICKERS,
  },
  beach: {
    id: 'beach',
    routeName: 'Beach',
    name: 'Beach',
    worldLabel: 'Beach Stickers',
    cardColor: '#6BBFFF',
    worldBackgroundSource: require('../../assets/backgrounds/worlds/beach.png'),
    homeBackgroundSource: require('../../assets/backgrounds/backgrounds_homescreen/beach.png'),
    titleImageSource: require('../../assets/worldtitles/beach.png'),
    stickers: BEACH_STICKERS,
  },
  construction: {
    id: 'construction',
    routeName: 'Construction',
    name: 'Construction',
    worldLabel: 'Construction Stickers',
    cardColor: '#FFD93D',
    worldBackgroundSource: require('../../assets/backgrounds/worlds/construction.png'),
    homeBackgroundSource: require('../../assets/backgrounds/backgrounds_homescreen/construction.png'),
    titleImageSource: require('../../assets/worldtitles/construction.png'),
    stickers: CONSTRUCTION_STICKERS,
  },
  farm: {
    id: 'farm',
    routeName: 'Farm',
    name: 'Farm',
    worldLabel: 'Farm Stickers',
    cardColor: '#95D5A0',
    worldBackgroundSource: require('../../assets/backgrounds/worlds/farm.png'),
    homeBackgroundSource: require('../../assets/backgrounds/backgrounds_homescreen/farm.png'),
    titleImageSource: require('../../assets/worldtitles/farm.png'),
    stickers: FARM_STICKERS,
  },
  space: {
    id: 'space',
    routeName: 'Space',
    name: 'Space',
    worldLabel: 'Space Stickers',
    cardColor: '#A78BFA',
    worldBackgroundSource: require('../../assets/backgrounds/worlds/space.png'),
    homeBackgroundSource: require('../../assets/backgrounds/backgrounds_homescreen/space.png'),
    titleImageSource: require('../../assets/worldtitles/space.png'),
    stickers: SPACE_STICKERS,
  },
  zoo: {
    id: 'zoo',
    routeName: 'Zoo',
    name: 'Zoo',
    worldLabel: 'Zoo Stickers',
    cardColor: '#77C06C',
    worldBackgroundSource: require('../../assets/backgrounds/worlds/zoo.png'),
    homeBackgroundSource: require('../../assets/backgrounds/backgrounds_homescreen/zoo.png'),
    titleImageSource: require('../../assets/worldtitles/zoo.png'),
    stickers: ZOO_STICKERS,
  },
};

export const WORLD_ORDER: WorldId[] = ['playground', 'beach', 'construction', 'farm', 'space', 'zoo'];

export function getWorldConfig(worldId: WorldId): WorldConfig {
  return WORLD_CONFIGS[worldId];
}

export const HOME_SCENES = WORLD_ORDER.map((worldId) => {
  const world = WORLD_CONFIGS[worldId];
  return {
    id: world.id,
    name: world.name,
    color: world.cardColor,
    imageSource: world.worldBackgroundSource,
    titleImageSource: world.titleImageSource,
    homeBackgroundSource: world.homeBackgroundSource,
    routeName: world.routeName,
  };
});
