import { useMemo } from 'react';

type HomeLayoutMetrics = {
  isTablet: boolean;
  cardWidth: number;
  cardHeight: number;
  snapInterval: number;
  paddingHorizontal: number;
  titleWidth: number;
  titleHeight: number;
  carouselTop: number;
  titleTop: number;
};

const SPACING = 24;

export function useHomeLayoutMetrics(
  screenWidth: number,
  screenHeight: number
): HomeLayoutMetrics {
  return useMemo(() => {
    const isTablet = screenWidth >= 1024;
    const cardWidth = Math.round(
      isTablet
        ? screenWidth * 0.54
        : Math.min(screenWidth * 0.5, screenHeight * 1.02)
    );
    const cardHeight = Math.round(cardWidth * (isTablet ? 0.625 : 0.58));
    const snapInterval = cardWidth + SPACING;
    const paddingHorizontal = Math.max(0, (screenWidth - cardWidth) / 2);

    const titleHeight = Math.round(screenHeight * (isTablet ? 0.19 : 0.15));
    const titleWidth = Math.round(screenWidth * (isTablet ? 0.46 : 0.5));

    const carouselTop = Math.max(0, Math.round(screenHeight * (isTablet ? 0.2 : 0.18)) - (isTablet ? 0 : 10));
    const titleTop = Math.max(0, carouselTop - titleHeight - Math.round(screenHeight * 0.008));

    return {
      isTablet,
      cardWidth,
      cardHeight,
      snapInterval,
      paddingHorizontal,
      titleWidth,
      titleHeight,
      carouselTop,
      titleTop,
    };
  }, [screenHeight, screenWidth]);
}

export { SPACING };
