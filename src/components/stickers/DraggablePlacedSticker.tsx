import { useEffect, useMemo, useRef } from 'react';
import { Animated, ImageSourcePropType, PanResponder, StyleSheet } from 'react-native';
import StickerVisual from './StickerVisual';

type DraggablePlacedStickerProps = {
  instanceId: string;
  stickerId: string;
  name: string;
  color: string;
  imageSource?: ImageSourcePropType;
  imageScale?: number;
  imageOffsetY?: number;
  initialX: number;
  initialY: number;
  size: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  onRelease?: (payload: {
    instanceId: string;
    stickerId: string;
    x: number;
    y: number;
  }) => void;
  glowColor?: string;
  glowActive?: boolean;
  glowIntensity?: number;
  isRemoving?: boolean;
  onRemoveAnimationComplete?: (instanceId: string) => void;
  onInteraction?: () => void;
  popOnMount?: boolean;
  onDragStart?: (stickerId: string) => void;
  onDragEnd?: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function DraggablePlacedSticker({
  instanceId,
  stickerId,
  name,
  color,
  imageSource,
  imageScale,
  imageOffsetY,
  initialX,
  initialY,
  size,
  bounds,
  onRelease,
  glowColor,
  glowActive = false,
  glowIntensity = 0.3,
  isRemoving = false,
  onRemoveAnimationComplete,
  onInteraction,
  popOnMount = false,
  onDragStart,
  onDragEnd,
}: DraggablePlacedStickerProps) {
  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const popAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!popOnMount) {
      return;
    }

    popAnim.setValue(0.88);
    Animated.sequence([
      Animated.timing(popAnim, {
        toValue: 1.08,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(popAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [popAnim, popOnMount]);

  useEffect(() => {
    if (!isRemoving) {
      return;
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.15,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemoveAnimationComplete?.(instanceId);
    });
  }, [instanceId, isRemoving, onRemoveAnimationComplete, opacityAnim, scaleAnim]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          onDragStart?.(stickerId);
          onInteraction?.();
          pan.stopAnimation((value) => {
            pan.setOffset({
              x: value.x,
              y: value.y,
            });
            pan.setValue({ x: 0, y: 0 });
          });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: () => {
          pan.flattenOffset();
          pan.stopAnimation((value) => {
            const clampedX = clamp(value.x, bounds.minX, bounds.maxX);
            const clampedY = clamp(value.y, bounds.minY, bounds.maxY);

            if (clampedX !== value.x || clampedY !== value.y) {
              Animated.spring(pan, {
                toValue: { x: clampedX, y: clampedY },
                useNativeDriver: false,
                bounciness: 4,
              }).start(() => {
                onRelease?.({
                  instanceId,
                  stickerId,
                  x: clampedX,
                  y: clampedY,
                });
                onInteraction?.();
                onDragEnd?.();
              });
              return;
            }

            onRelease?.({
              instanceId,
              stickerId,
              x: clampedX,
              y: clampedY,
            });
            onInteraction?.();
            onDragEnd?.();
          });
        },
        onPanResponderTerminate: () => {
          pan.flattenOffset();
          onDragEnd?.();
        },
      }),
    [
      bounds.maxX,
      bounds.maxY,
      bounds.minX,
      bounds.minY,
      instanceId,
      onRelease,
      onInteraction,
      onDragEnd,
      onDragStart,
      pan,
      stickerId,
    ]
  );

  return (
    <Animated.View
      key={instanceId}
      style={[
        styles.sticker,
        {
          width: size,
          height: size,
          opacity: opacityAnim,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: Animated.multiply(scaleAnim, popAnim) },
          ],
          shadowColor: glowActive ? glowColor ?? color : '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowActive ? glowIntensity : 0.1,
          shadowRadius: glowActive ? 10 : 2,
          elevation: glowActive ? 7 : 2,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <StickerVisual
        size={size}
        name={name}
        color={color}
        imageSource={imageSource}
        imageScale={imageScale}
        imageOffsetY={imageOffsetY}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sticker: {
    position: 'absolute',
  },
});
