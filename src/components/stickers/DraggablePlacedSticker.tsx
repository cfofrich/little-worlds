import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  GestureResponderEvent,
  ImageSourcePropType,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
} from 'react-native';
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
  initialScale?: number;
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
    scale: number;
    interaction: 'drag' | 'pinch';
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
  initialScale = 1,
  size,
  bounds,
  onRelease,
  glowColor: _glowColor,
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
  const stickerScale = useRef(new Animated.Value(initialScale)).current;
  const popScale = useRef(new Animated.Value(1)).current;
  const removeScale = useRef(new Animated.Value(1)).current;
  const removeOpacity = useRef(new Animated.Value(1)).current;
  const removeShiftY = useRef(new Animated.Value(0)).current;
  const interactionModeRef = useRef<'none' | 'drag' | 'pinch'>('none');
  const currentScaleRef = useRef(initialScale);
  const pinchStartDistanceRef = useRef(0);
  const pinchStartScaleRef = useRef(initialScale);

  const clampScale = (value: number) => clamp(value, 0.5, 2);

  const getDistanceBetweenTouches = (event: GestureResponderEvent) => {
    const touches = event.nativeEvent.touches;
    if (!touches || touches.length < 2) {
      return 0;
    }

    const first = touches[0];
    const second = touches[1];
    const dx = second.pageX - first.pageX;
    const dy = second.pageY - first.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const updateDragPosition = (gestureState: PanResponderGestureState) => {
    pan.setValue({ x: gestureState.dx, y: gestureState.dy });
  };

  const beginDrag = () => {
    interactionModeRef.current = 'drag';
    onDragStart?.(stickerId);
    onInteraction?.();
    pan.stopAnimation((value) => {
      pan.setOffset({
        x: value.x,
        y: value.y,
      });
      pan.setValue({ x: 0, y: 0 });
    });
  };

  const beginPinch = (event: GestureResponderEvent) => {
    if (interactionModeRef.current === 'drag') {
      pan.flattenOffset();
    }

    interactionModeRef.current = 'pinch';
    onInteraction?.();
    pinchStartDistanceRef.current = getDistanceBetweenTouches(event);
    pinchStartScaleRef.current = currentScaleRef.current;
  };

  const updatePinchScale = (event: GestureResponderEvent) => {
    const distance = getDistanceBetweenTouches(event);
    const startDistance = pinchStartDistanceRef.current;
    if (!distance || !startDistance) {
      return;
    }

    const nextScale = clampScale(pinchStartScaleRef.current * (distance / startDistance));
    currentScaleRef.current = nextScale;
    stickerScale.setValue(nextScale);
  };

  useEffect(() => {
    if (!popOnMount) {
      return;
    }

    popScale.setValue(0.9);
    Animated.sequence([
      Animated.timing(popScale, {
        toValue: 1.1,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(popScale, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start();
  }, [popOnMount, popScale]);

  useEffect(() => {
    if (!isRemoving) {
      return;
    }

    Animated.parallel([
      Animated.timing(removeScale, {
        toValue: 0.78,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(removeOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(removeShiftY, {
        toValue: 36,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemoveAnimationComplete?.(instanceId);
    });
  }, [
    instanceId,
    isRemoving,
    onRemoveAnimationComplete,
    removeOpacity,
    removeScale,
    removeShiftY,
  ]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          if (event.nativeEvent.touches.length >= 2) {
            beginPinch(event);
            return;
          }

          beginDrag();
        },
        onPanResponderMove: (event, gestureState) => {
          const touches = event.nativeEvent.touches.length;

          if (touches >= 2) {
            if (interactionModeRef.current !== 'pinch') {
              beginPinch(event);
            }
            updatePinchScale(event);
            return;
          }

          if (interactionModeRef.current === 'pinch') {
            return;
          }

          if (interactionModeRef.current !== 'drag') {
            beginDrag();
          }

          updateDragPosition(gestureState);
        },
        onPanResponderRelease: () => {
          const interaction = interactionModeRef.current;
          interactionModeRef.current = 'none';

          if (interaction === 'drag') {
            pan.flattenOffset();
          }

          pan.stopAnimation((value) => {
            const clampedX = clamp(value.x, bounds.minX, bounds.maxX);
            const clampedY = clamp(value.y, bounds.minY, bounds.maxY);

            pan.setValue({ x: clampedX, y: clampedY });

            onRelease?.({
              instanceId,
              stickerId,
              x: clampedX,
              y: clampedY,
              scale: currentScaleRef.current,
              interaction: interaction === 'pinch' ? 'pinch' : 'drag',
            });
            onInteraction?.();
            onDragEnd?.();
          });
        },
        onPanResponderTerminate: () => {
          if (interactionModeRef.current === 'drag') {
            pan.flattenOffset();
          }
          interactionModeRef.current = 'none';
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
      stickerScale,
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
          opacity: removeOpacity,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { translateY: removeShiftY },
            { scale: Animated.multiply(Animated.multiply(popScale, removeScale), stickerScale) },
          ],
        },
      ]}
      {...(!isRemoving ? panResponder.panHandlers : {})}
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
