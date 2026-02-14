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

export const TRAY_ITEM_SIZE = 52;

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
  highlightDropZone: _highlightDropZone,
  isActiveSticker: _isActiveSticker,
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
      <View style={styles.stickerFrame}>
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
  worldLabel: _worldLabel,
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

  const trayItems = (
    <View
      style={[
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
    </View>
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
          {trayItems}
        </ImageBackground>
      ) : (
        <>
          {trayItems}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    position: 'absolute',
    left: 36,
    right: 36,
    bottom: 14,
    borderTopWidth: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  assetBackground: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 16,
    justifyContent: 'center',
  },
  assetBackgroundImage: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    transform: [{ scaleY: 1.9 }, { translateY: 18 }],
  },
  trayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: '100%',
  },
  trayButton: {
    marginHorizontal: 6,
    alignItems: 'center',
    width: 72,
    minHeight: 84,
    justifyContent: 'center',
  },
  trayButtonDragging: {
    opacity: 0.35,
  },
  stickerFrame: {
    borderRadius: 18,
    padding: 2,
  },
  stickerLabel: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 12,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    width: '100%',
  },
});
