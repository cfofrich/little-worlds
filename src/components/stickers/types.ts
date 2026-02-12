import { ImageSourcePropType } from 'react-native';

export type StickerDefinition = {
  id: string;
  name: string;
  color: string;
  glowColor?: string;
  imageSource?: ImageSourcePropType;
};

export type PlacedSticker = {
  instanceId: string;
  stickerId: string;
  x: number;
  y: number;
};
