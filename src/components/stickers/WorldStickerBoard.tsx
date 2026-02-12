import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DraggablePlacedSticker from './DraggablePlacedSticker';
import StickerTray, { CLEANUP_TARGET_GAP, TRAY_ITEM_SIZE } from './StickerTray';
import { PlacedSticker, StickerDefinition } from './types';

type WorldStickerBoardProps = {
  backgroundSource: ImageSourcePropType;
  stickers: StickerDefinition[];
  trayHeight?: number;
  placedStickerSize?: number;
  topInset?: number;
  children?: ReactNode;
};

type Mode = 'creative' | 'cleanup';

const DEFAULT_TRAY_HEIGHT = 112;
const DEFAULT_STICKER_SIZE = 88;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function WorldStickerBoard({
  backgroundSource,
  stickers,
  trayHeight = DEFAULT_TRAY_HEIGHT,
  placedStickerSize = DEFAULT_STICKER_SIZE,
  topInset = 12,
  children,
}: WorldStickerBoardProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [mode, setMode] = useState<Mode>('creative');
  const [showCelebration, setShowCelebration] = useState(false);

  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }
    };
  }, []);

  const stickerMap = useMemo(() => {
    return stickers.reduce<Record<string, StickerDefinition>>((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  }, [stickers]);

  const playAreaHeight = Math.max(0, layout.height - trayHeight);

  const cleanupTrayTargets = useMemo(() => {
    if (!layout.width || !layout.height || !stickers.length) {
      return {} as Record<string, { x: number; y: number; size: number }>;
    }

    const targetSize = TRAY_ITEM_SIZE;
    const totalWidth =
      stickers.length * targetSize +
      Math.max(0, stickers.length - 1) * CLEANUP_TARGET_GAP;
    const startX = Math.max(12, (layout.width - totalWidth) / 2);
    const trayTop = layout.height - trayHeight;
    const y = trayTop + (trayHeight - targetSize) / 2;

    return stickers.reduce<Record<string, { x: number; y: number; size: number }>>(
      (acc, sticker, index) => {
        acc[sticker.id] = {
          x: startX + index * (targetSize + CLEANUP_TARGET_GAP),
          y,
          size: targetSize,
        };
        return acc;
      },
      {}
    );
  }, [layout.height, layout.width, stickers, trayHeight]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  const handleTrayPress = (stickerId: string) => {
    if (mode !== 'creative' || !layout.width || !playAreaHeight) {
      return;
    }

    const baseX = layout.width / 2 - placedStickerSize / 2;
    const randomOffset = (Math.random() - 0.5) * 60;
    const maxX = Math.max(12, layout.width - placedStickerSize - 12);

    const newSticker: PlacedSticker = {
      instanceId: `${stickerId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      stickerId,
      x: clamp(baseX + randomOffset, 12, maxX),
      y: Math.max(12, playAreaHeight - placedStickerSize - 24),
    };

    setPlacedStickers((current) => [...current, newSticker]);
  };

  const handleModeToggle = () => {
    if (mode === 'creative') {
      if (!placedStickers.length) {
        return;
      }
      setMode('cleanup');
      return;
    }

    setMode('creative');
  };

  const handleStickerRelease = ({
    instanceId,
    stickerId,
    x,
    y,
  }: {
    instanceId: string;
    stickerId: string;
    x: number;
    y: number;
  }) => {
    if (mode !== 'cleanup') {
      return;
    }

    const target = cleanupTrayTargets[stickerId];
    if (!target) {
      return;
    }

    const stickerCenterX = x + placedStickerSize / 2;
    const stickerCenterY = y + placedStickerSize / 2;

    const withinX =
      stickerCenterX >= target.x - target.size * 0.25 &&
      stickerCenterX <= target.x + target.size * 1.25;
    const withinY =
      stickerCenterY >= target.y - target.size * 0.25 &&
      stickerCenterY <= target.y + target.size * 1.25;

    if (!withinX || !withinY) {
      return;
    }

    let shouldCelebrate = false;

    setPlacedStickers((current) => {
      const next = current.filter((item) => item.instanceId !== instanceId);
      shouldCelebrate = current.length > 0 && next.length === 0;
      return next;
    });

    if (!shouldCelebrate) {
      return;
    }

    setShowCelebration(true);

    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
    }

    cleanupTimerRef.current = setTimeout(() => {
      setShowCelebration(false);
      setMode('creative');
    }, 950);
  };

  const dragBounds = {
    minX: 0,
    maxX: Math.max(0, layout.width - placedStickerSize),
    minY: 0,
    maxY:
      mode === 'creative'
        ? Math.max(0, playAreaHeight - placedStickerSize)
        : Math.max(0, layout.height - placedStickerSize),
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={[styles.playArea, { bottom: trayHeight }]}>
        <View style={styles.backgroundBase} />
        <ImageBackground
          source={backgroundSource}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        <View style={styles.playLayer} pointerEvents="box-none">
          {placedStickers.map((placed) => {
            const sticker = stickerMap[placed.stickerId];
            if (!sticker) {
              return null;
            }

            return (
              <DraggablePlacedSticker
                key={placed.instanceId}
                instanceId={placed.instanceId}
                stickerId={placed.stickerId}
                name={sticker.name}
                color={sticker.color}
                imageSource={sticker.imageSource}
                initialX={placed.x}
                initialY={placed.y}
                size={placedStickerSize}
                bounds={dragBounds}
                onRelease={handleStickerRelease}
              />
            );
          })}
        </View>

        <View pointerEvents="box-none" style={styles.contentLayer}>
          {children}
        </View>

        <TouchableOpacity
          style={[
            styles.modeButton,
            { top: topInset, opacity: mode === 'creative' && !placedStickers.length ? 0.55 : 1 },
          ]}
          onPress={handleModeToggle}
          activeOpacity={0.85}
        >
          <Text style={styles.modeButtonText}>
            {mode === 'creative' ? 'Clean Up' : 'Back to Play'}
          </Text>
        </TouchableOpacity>

        {showCelebration ? (
          <View pointerEvents="none" style={styles.celebrationOverlay}>
            <Text style={styles.celebrationText}>Great cleanup!</Text>
          </View>
        ) : null}
      </View>

      <StickerTray
        stickers={stickers}
        trayHeight={trayHeight}
        onStickerPress={handleTrayPress}
        mode={mode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C9E9FF',
  },
  playArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  backgroundBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DFF2FF',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  contentLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  playLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  modeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F3A45',
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  celebrationText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
