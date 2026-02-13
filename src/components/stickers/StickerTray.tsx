import { useMemo, useState } from 'react';
import {
  GestureResponderEvent,
  ImageBackground,
  ImageSourcePropType,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import StickerVisual from './StickerVisual';
import { StickerDefinition, StickerTrayTheme } from './types';

export const TRAY_ITEM_SIZE = 58;

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
    <View style={[styles.trayButton, isDragging && styles.trayButtonDragging]} {...panResponder.panHandlers}>
      <View
        style={[
          styles.stickerFrame,
          isActiveSticker && styles.stickerFrameActive,
          highlightDropZone && isActiveSticker && styles.stickerFrameDropHint,
          highlightDropZone && isActiveSticker
            ? {
                borderColor: sticker.glowColor ?? sticker.color,
                shadowColor: sticker.glowColor ?? sticker.color,
              }
            : null,
        ]}
      >
        <StickerVisual
          size={TRAY_ITEM_SIZE}
          name={sticker.name}
          color={sticker.color}
          imageSource={sticker.imageSource}
          imageScale={sticker.imageScale}
          imageOffsetY={sticker.imageOffsetY}
        />
      </View>
      <Text numberOfLines={1} style={[styles.stickerLabel, { color: labelColor }]}> 
        {sticker.name}
      </Text>
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

  const trayHeader = (
    <View style={styles.headerRow}>
      <Text style={[styles.headerText, { color: theme.trayLabelText }]}>{worldLabel ?? 'Stickers'}</Text>
      <Text style={[styles.modeText, { color: theme.trayLabelText }]}>
        {highlightDropZone ? 'Release in tray to put away' : 'Drag to place'}
      </Text>
    </View>
  );

  const trayItems = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.trayContent,
        contentOffsetY !== 0 && { transform: [{ translateY: contentOffsetY }] },
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
    </ScrollView>
  );

  return (
    <View
      style={[
        styles.tray,
        {
          height: trayHeight,
          backgroundColor: hasTrayAsset ? 'transparent' : theme.trayBackground,
          borderColor: hasTrayAsset ? 'transparent' : theme.trayBorder,
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
          {highlightDropZone ? <View style={styles.trayHighlightOverlay} /> : null}
          {trayHeader}
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
    borderTopWidth: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  assetBackground: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
  },
  assetBackgroundImage: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  trayHighlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    backgroundColor: 'rgba(255, 244, 196, 0.12)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  headerText: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '800',
  },
  modeText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    opacity: 0.84,
  },
  trayContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 6,
    minWidth: '100%',
  },
  trayButton: {
    marginHorizontal: 8,
    alignItems: 'center',
    width: 84,
    minHeight: 112,
  },
  trayButtonDragging: {
    opacity: 0.35,
  },
  stickerFrame: {
    borderRadius: 18,
    padding: 2,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  stickerFrameActive: {
    transform: [{ scale: 1.07 }],
  },
  stickerFrameDropHint: {
    borderWidth: 2,
    borderStyle: 'dashed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 7,
    elevation: 5,
  },
  stickerLabel: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    width: '100%',
  },
});
