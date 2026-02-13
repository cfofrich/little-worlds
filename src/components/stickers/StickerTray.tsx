import { useMemo, useState } from 'react';
import {
  GestureResponderEvent,
  ImageBackground,
  ImageSourcePropType,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import StickerVisual from './StickerVisual';
import { StickerDefinition, StickerTrayTheme } from './types';

export const TRAY_ITEM_SIZE = 56;

type StickerTrayProps = {
  stickers: StickerDefinition[];
  trayHeight: number;
  worldLabel?: string;
  theme: StickerTrayTheme;
  onTrayDragStart: (stickerId: string, x: number, y: number) => void;
  onTrayDragMove: (stickerId: string, x: number, y: number) => void;
  onTrayDragEnd: (stickerId: string, x: number, y: number) => void;
  highlightDropZone?: boolean;
  activeStickerId?: string;
  trayAssetSource?: ImageSourcePropType;
  contentOffsetY?: number;
};

type TrayItemProps = {
  sticker: StickerDefinition;
  onDragStart: (stickerId: string, x: number, y: number) => void;
  onDragMove: (stickerId: string, x: number, y: number) => void;
  onDragEnd: (stickerId: string, x: number, y: number) => void;
  labelColor: string;
  highlightDropZone: boolean;
  isActiveSticker: boolean;
};

function TrayItem({
  sticker,
  onDragStart,
  onDragMove,
  onDragEnd,
  labelColor,
  highlightDropZone,
  isActiveSticker,
}: TrayItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event: GestureResponderEvent) => {
          setIsDragging(true);
          onDragStart(sticker.id, event.nativeEvent.pageX, event.nativeEvent.pageY);
        },
        onPanResponderMove: (event: GestureResponderEvent) => {
          onDragMove(sticker.id, event.nativeEvent.pageX, event.nativeEvent.pageY);
        },
        onPanResponderRelease: (event: GestureResponderEvent) => {
          setIsDragging(false);
          onDragEnd(sticker.id, event.nativeEvent.pageX, event.nativeEvent.pageY);
        },
        onPanResponderTerminate: (event: GestureResponderEvent) => {
          setIsDragging(false);
          onDragEnd(sticker.id, event.nativeEvent.pageX, event.nativeEvent.pageY);
        },
      }),
    [onDragEnd, onDragMove, onDragStart, sticker.id]
  );

  return (
    <View
      style={[styles.trayButton, isDragging && styles.trayButtonDragging]}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.slotRing,
          highlightDropZone && isActiveSticker && styles.slotRingHighlighted,
          highlightDropZone &&
            isActiveSticker && {
              borderColor: sticker.glowColor ?? sticker.color,
              shadowColor: sticker.glowColor ?? sticker.color,
            },
          isActiveSticker && styles.slotRingActive,
        ]}
      >
        <StickerVisual
          size={TRAY_ITEM_SIZE}
          name={sticker.name}
          color={sticker.color}
          imageSource={sticker.imageSource}
          imageScale={Math.min(sticker.trayImageScale ?? sticker.imageScale ?? 1, 3)}
          imageOffsetY={sticker.imageOffsetY}
        />
      </View>
      <Text style={[styles.stickerLabel, { color: labelColor }]}>{sticker.name}</Text>
    </View>
  );
}

export default function StickerTray({
  stickers,
  trayHeight,
  worldLabel,
  theme,
  onTrayDragStart,
  onTrayDragMove,
  onTrayDragEnd,
  highlightDropZone = false,
  activeStickerId,
  trayAssetSource,
  contentOffsetY = 0,
}: StickerTrayProps) {
  const hasTrayAsset = Boolean(trayAssetSource);
  const trayTranslateY = (hasTrayAsset ? -10 : 0) + contentOffsetY;

  const trayHeader = (
    <View style={styles.headerRow}>
      <Text style={[styles.headerText, { color: theme.trayLabelText }]}>
        {worldLabel ?? 'Stickers'}
      </Text>
      <Text style={[styles.modeText, { color: theme.trayLabelText }]}>
        {highlightDropZone ? 'Release in tray to put away' : 'Drag to place'}
      </Text>
    </View>
  );

  const trayItems = (
    <View
      style={[
        styles.trayContent,
        hasTrayAsset && styles.trayContentOnAsset,
        trayTranslateY !== 0 && { transform: [{ translateY: trayTranslateY }] },
      ]}
    >
      {stickers.map((sticker) => (
        <TrayItem
          key={sticker.id}
          sticker={sticker}
          labelColor={theme.trayLabelText}
          onDragStart={onTrayDragStart}
          onDragMove={onTrayDragMove}
          onDragEnd={onTrayDragEnd}
          highlightDropZone={highlightDropZone}
          isActiveSticker={activeStickerId === sticker.id}
        />
      ))}
    </View>
  );

  return (
    <View
      style={[
        styles.tray,
        {
          height: trayHeight,
          backgroundColor: hasTrayAsset ? 'transparent' : theme.trayBackground,
          borderColor: hasTrayAsset
            ? 'transparent'
            : highlightDropZone
              ? theme.trayLabelText
              : theme.trayBorder,
          borderTopWidth: hasTrayAsset ? 0 : 2,
          shadowOpacity: hasTrayAsset ? 0 : 0.1,
          elevation: hasTrayAsset ? 0 : 6,
          paddingHorizontal: hasTrayAsset ? 0 : 14,
          paddingTop: hasTrayAsset ? 0 : 8,
          paddingBottom: hasTrayAsset ? 0 : 12,
        },
      ]}
    >
      {hasTrayAsset ? (
        <ImageBackground
          source={trayAssetSource!}
          style={styles.assetBackground}
          imageStyle={styles.assetBackgroundImage}
          resizeMode="stretch"
        >
          {trayItems}
        </ImageBackground>
      ) : (
        <>
          {trayHeader}
          {trayItems}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    position: 'absolute',
    left: 44,
    right: 44,
    bottom: 0,
    borderTopWidth: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },
  assetBackground: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 18,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  assetBackgroundImage: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    transform: [{ scaleY: 2.35 }],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.75,
  },
  trayContent: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
  },
  trayContentOnAsset: {
    paddingHorizontal: 4,
    paddingBottom: 0,
    alignItems: 'center',
  },
  trayButton: {
    marginHorizontal: 8,
    alignItems: 'center',
    width: 76,
    minHeight: 98,
    justifyContent: 'center',
  },
  trayButtonDragging: {
    opacity: 0.35,
  },
  slotRing: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 18,
    padding: 2,
  },
  slotRingHighlighted: {
    borderWidth: 2,
    borderStyle: 'dashed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 7,
    elevation: 5,
  },
  slotRingActive: {
    transform: [{ scale: 1.08 }],
  },
  stickerLabel: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
