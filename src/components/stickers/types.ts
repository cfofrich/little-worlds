import { ImageSourcePropType } from 'react-native';

export type StickerDefinition = {
  id: string;
  name: string;
  color: string;
  glowColor?: string;
  imageSource?: ImageSourcePropType;
  imageScale?: number;
  trayImageScale?: number;
  fieldImageScale?: number;
  imageOffsetY?: number;
};

export type StickerTrayTheme = {
  trayBackground: string;
  traySurface: string;
  trayBorder: string;
  trayLabelBackground: string;
  trayLabelText: string;
  cleanupSlotBackground: string;
};

export type PlacedSticker = {
  instanceId: string;
  stickerId: string;
  x: number;
  y: number;
};
