import {
  ImageBackground,
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import {
  ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import DraggablePlacedSticker from './DraggablePlacedSticker';
import StickerTray from './StickerTray';
import StickerVisual from './StickerVisual';
import { PlacedSticker, StickerDefinition, StickerTrayTheme } from './types';
import { useSound } from '../../context/SoundContext';

export type WorldStickerBoardHandle = {
  cleanupAll: () => void;
};

type WorldStickerBoardProps = {
  backgroundSource?: ImageSourcePropType;
  backgroundColor?: string;
  stickers: StickerDefinition[];
  trayHeight?: number;
  placedStickerSize?: number;
  worldLabel?: string;
  trayTheme?: StickerTrayTheme;
  trayAssetSource?: ImageSourcePropType;
  trayContentOffsetY?: number;
  children?: ReactNode;
};

type ActiveTrayDrag = {
  stickerId: string;
  x: number;
  y: number;
};

const DEFAULT_TRAY_HEIGHT = 196;
const DEFAULT_STICKER_SIZE = 92;
const TRAY_HORIZONTAL_INSET = 44;
const CLEANUP_RETURN_DEPTH = 42;
const DEFAULT_TRAY_THEME: StickerTrayTheme = {
  trayBackground: 'rgba(220, 248, 236, 0.96)',
  traySurface: 'rgba(243, 253, 247, 0.98)',
  trayBorder: '#88C9A1',
  trayLabelBackground: '#D8F3E3',
  trayLabelText: '#246A4D',
  cleanupSlotBackground: 'rgba(255, 255, 255, 0.85)',
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const WorldStickerBoard = forwardRef<WorldStickerBoardHandle, WorldStickerBoardProps>(
  (
    {
      backgroundSource,
      backgroundColor = '#DFF2FF',
      stickers,
      trayHeight = DEFAULT_TRAY_HEIGHT,
      placedStickerSize = DEFAULT_STICKER_SIZE,
      worldLabel,
      trayTheme = DEFAULT_TRAY_THEME,
      trayAssetSource,
      trayContentOffsetY = 0,
      children,
    },
    ref
  ) => {
    const { playPlop, playCleanup } = useSound();
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
    const [activeTrayDrag, setActiveTrayDrag] = useState<ActiveTrayDrag | null>(null);
    const [activePlacedDragStickerId, setActivePlacedDragStickerId] = useState<string | null>(null);

    const cleanupTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

    useEffect(() => {
      return () => {
        cleanupTimersRef.current.forEach((timer) => clearTimeout(timer));
        cleanupTimersRef.current = [];
      };
    }, []);

    const stickerMap = useMemo(() => {
      return stickers.reduce<Record<string, StickerDefinition>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
    }, [stickers]);

    const trayTopY = Math.max(0, layout.height - trayHeight);

    const handleLayout = (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setLayout({ width, height });
    };

    const cleanupAll = () => {
      if (!placedStickers.length) {
        return;
      }

      cleanupTimersRef.current.forEach((timer) => clearTimeout(timer));
      cleanupTimersRef.current = [];

      placedStickers.forEach((placed, index) => {
        const timer = setTimeout(() => {
          setRemovingIds((current) => {
            if (current.has(placed.instanceId)) {
              return current;
            }
            const next = new Set(current);
            next.add(placed.instanceId);
            return next;
          });
        }, index * 55);

        cleanupTimersRef.current.push(timer);
      });
    };

    useImperativeHandle(ref, () => ({ cleanupAll }), [placedStickers]);

    const handleTrayDragStart = (stickerId: string, x: number, y: number) => {
      setActiveTrayDrag({ stickerId, x, y });
    };

    const handleTrayDragMove = (stickerId: string, x: number, y: number) => {
      setActiveTrayDrag((current) => {
        if (!current || current.stickerId !== stickerId) {
          return { stickerId, x, y };
        }
        return { ...current, x, y };
      });
    };

    const handleTrayDragEnd = (stickerId: string, x: number, y: number) => {
      setActiveTrayDrag(null);

      if (!layout.width || !layout.height) {
        return;
      }

      if (y >= trayTopY) {
        return;
      }

      const newSticker: PlacedSticker = {
        instanceId: `${stickerId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        stickerId,
        x: clamp(x - placedStickerSize / 2, 0, Math.max(0, layout.width - placedStickerSize)),
        y: clamp(y - placedStickerSize / 2, 0, Math.max(0, layout.height - placedStickerSize)),
      };

      setPlacedStickers((current) => [...current, newSticker]);
      void playPlop();
    };

    const handleRemoveAnimationComplete = (instanceId: string) => {
      setPlacedStickers((current) => current.filter((item) => item.instanceId !== instanceId));

      setRemovingIds((current) => {
        const next = new Set(current);
        next.delete(instanceId);
        return next;
      });
    };

    const handleStickerRelease = ({
      x,
      instanceId,
      y,
    }: {
      instanceId: string;
      stickerId: string;
      x: number;
      y: number;
    }) => {
      const stickerCenterX = x + placedStickerSize / 2;
      const stickerCenterY = y + placedStickerSize / 2;

      if (stickerCenterY < trayTopY + CLEANUP_RETURN_DEPTH) {
        return;
      }

      if (
        stickerCenterX < TRAY_HORIZONTAL_INSET ||
        stickerCenterX > layout.width - TRAY_HORIZONTAL_INSET
      ) {
        return;
      }

      setRemovingIds((current) => {
        if (current.has(instanceId)) {
          return current;
        }
        const next = new Set(current);
        next.add(instanceId);
        void playCleanup();
        return next;
      });
    };

    const dragBounds = {
      minX: 0,
      maxX: Math.max(0, layout.width - placedStickerSize),
      minY: 0,
      maxY: Math.max(0, layout.height - placedStickerSize),
    };

    const activeDragSticker = activeTrayDrag ? stickerMap[activeTrayDrag.stickerId] : undefined;

    return (
      <View style={styles.container} onLayout={handleLayout}>
        <View style={styles.playArea}>
          <View style={[styles.backgroundBase, { backgroundColor }]} />
          {backgroundSource ? (
            <ImageBackground
              source={backgroundSource}
              style={styles.backgroundImage}
              imageStyle={styles.backgroundImageAsset}
              resizeMode="cover"
            />
          ) : null}

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
                  imageScale={sticker.imageScale}
                  imageOffsetY={sticker.imageOffsetY}
                  initialX={placed.x}
                  initialY={placed.y}
                  size={placedStickerSize}
                  bounds={dragBounds}
                  onRelease={handleStickerRelease}
                  glowColor={sticker.glowColor ?? sticker.color}
                  glowActive={false}
                  isRemoving={removingIds.has(placed.instanceId)}
                  onRemoveAnimationComplete={handleRemoveAnimationComplete}
                  popOnMount
                  onDragStart={setActivePlacedDragStickerId}
                  onDragEnd={() => setActivePlacedDragStickerId(null)}
                />
              );
            })}

            {activeTrayDrag && activeDragSticker ? (
              <View
                pointerEvents="none"
                style={[
                  styles.dragGhost,
                  {
                    width: placedStickerSize,
                    height: placedStickerSize,
                    left: activeTrayDrag.x - placedStickerSize / 2,
                    top: activeTrayDrag.y - placedStickerSize / 2,
                  },
                ]}
              >
                <StickerVisual
                  size={placedStickerSize}
                  name={activeDragSticker.name}
                  color={activeDragSticker.color}
                  imageSource={activeDragSticker.imageSource}
                  imageScale={activeDragSticker.imageScale}
                  imageOffsetY={activeDragSticker.imageOffsetY}
                />
              </View>
            ) : null}
          </View>

          <View pointerEvents="box-none" style={styles.contentLayer}>
            {children}
          </View>

        </View>

        <StickerTray
          stickers={stickers}
          trayHeight={trayHeight}
          worldLabel={worldLabel}
          theme={trayTheme}
          onTrayDragStart={handleTrayDragStart}
          onTrayDragMove={handleTrayDragMove}
          onTrayDragEnd={handleTrayDragEnd}
          highlightDropZone={Boolean(activeTrayDrag) || Boolean(activePlacedDragStickerId)}
          activeStickerId={activeTrayDrag?.stickerId ?? activePlacedDragStickerId ?? undefined}
          trayAssetSource={trayAssetSource}
          contentOffsetY={trayContentOffsetY}
        />
      </View>
    );
  }
);

WorldStickerBoard.displayName = 'WorldStickerBoard';

export default WorldStickerBoard;

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
    bottom: 0,
  },
  backgroundBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DFF2FF',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImageAsset: {
    width: '100%',
    height: '100%',
  },
  contentLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  playLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  dragGhost: {
    position: 'absolute',
    opacity: 0.95,
  },
});
