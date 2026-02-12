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
    const cardWidth = Math.round(screenWidth * (isTablet ? 0.35 : 0.45));
    const cardHeight = Math.round(cardWidth * 0.625);
    const snapInterval = cardWidth + SPACING;
    const paddingHorizontal = Math.max(0, (screenWidth - cardWidth) / 2);

    const titleHeight = Math.round(screenHeight * 0.35);
    const titleWidth = Math.round(screenWidth * (isTablet ? 0.6 : 0.7));

    const carouselTop = Math.max(0, (screenHeight - cardHeight) / 2);
    const titleTop = Math.max(
      0,
      carouselTop - titleHeight + Math.round(screenHeight * 0.05)
    );

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
