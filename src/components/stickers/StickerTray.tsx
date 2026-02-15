import { useMemo, useState } from 'react';
import {
  GestureResponderEvent,
  ImageBackground,
  ImageSourcePropType,
  PanResponder,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import StickerVisual from './StickerVisual';
import { StickerDefinition, StickerTrayTheme } from './types';

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
  itemSize: number;
  buttonWidth: number;
  buttonMinHeight: number;
  labelMinHeight: number;
  labelFontSize: number;
  labelLineHeight: number;
  showLabel: boolean;
  labelColor: string;
  highlightDropZone: boolean;
  isActiveSticker: boolean;
};

function truncateLabel(value: string, maxChars: number) {
  if (value.length <= maxChars) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}

function formatStickerLabel(rawLabel: string): string {
  const normalized = rawLabel
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return '';
  }

  const maxSingleLineChars = 12;
  const maxFirstLineChars = 12;
  const maxSecondLineChars = 13;

  if (normalized.length <= maxSingleLineChars) {
    return normalized;
  }

  const words = normalized.split(' ');
  if (words.length === 1) {
    return truncateLabel(normalized, maxSingleLineChars);
  }

  let bestBreakIndex = 1;
  let bestBalance = Number.POSITIVE_INFINITY;

  for (let i = 1; i < words.length; i += 1) {
    const left = words.slice(0, i).join(' ');
    const right = words.slice(i).join(' ');
    const leftLen = left.length;
    const rightLen = right.length;
    const penalty =
      Math.abs(leftLen - rightLen) +
      Math.max(0, leftLen - maxFirstLineChars) * 3 +
      Math.max(0, rightLen - maxSecondLineChars) * 3;

    if (penalty < bestBalance) {
      bestBalance = penalty;
      bestBreakIndex = i;
    }
  }

  const lineOne = truncateLabel(words.slice(0, bestBreakIndex).join(' '), maxFirstLineChars);
  const lineTwo = truncateLabel(words.slice(bestBreakIndex).join(' '), maxSecondLineChars);

  if (!lineTwo) {
    return lineOne;
  }

  return `${lineOne}\n${lineTwo}`;
}

function TrayItem({
  sticker,
  onDragStart,
  onDragMove,
  onDragEnd,
  itemSize,
  buttonWidth,
  buttonMinHeight,
  labelMinHeight,
  labelFontSize,
  labelLineHeight,
  showLabel,
  labelColor,
  highlightDropZone: _highlightDropZone,
  isActiveSticker: _isActiveSticker,
}: TrayItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const label = formatStickerLabel(sticker.name);

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
      style={[
        styles.trayButton,
        {
          width: buttonWidth,
          minHeight: showLabel ? buttonMinHeight : itemSize + 14,
          justifyContent: showLabel ? 'flex-start' : 'center',
        },
        isDragging && styles.trayButtonDragging,
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.stickerFrame}>
        <StickerVisual
          size={itemSize}
          name={sticker.name}
          color={sticker.color}
          imageSource={sticker.imageSource}
          imageScale={sticker.imageScale}
          imageOffsetY={sticker.imageOffsetY}
        />
      </View>
      {showLabel ? (
        <View style={[styles.labelWrap, { minHeight: labelMinHeight }]}>
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[
              styles.stickerLabel,
              {
                color: labelColor,
                fontSize: labelFontSize,
                lineHeight: labelLineHeight,
              },
            ]}
          >
            {label}
          </Text>
        </View>
      ) : null}
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
  const { width: screenWidth } = useWindowDimensions();
  const isPhoneLandscape = screenWidth < 1024;
  const hasTrayAsset = Boolean(trayAssetSource);
  const isCompactTray = trayHeight < 170;
  const showLabels = !isPhoneLandscape;
  const itemSize = Math.max(36, Math.min(56, Math.round(trayHeight * (isCompactTray ? 0.34 : 0.28))));
  const buttonWidth = itemSize + (isCompactTray ? 22 : 30);
  const buttonMinHeight = itemSize + (isCompactTray ? 34 : 54);
  const labelMinHeight = isCompactTray ? 20 : 30;
  const labelFontSize = isCompactTray ? 9 : 11;
  const labelLineHeight = isCompactTray ? 11 : 13;
  const dynamicAssetPaddingTop = isCompactTray ? 10 : 30;
  const dynamicAssetPaddingBottom = isCompactTray ? 18 : 16;
  const dynamicAssetScaleY = isCompactTray ? 1.4 : 1.9;
  const dynamicAssetTranslateY = isCompactTray ? 10 : 18;
  const dynamicTraySideInset = isCompactTray ? 18 : 36;
  const dynamicTrayBottom = isCompactTray ? 4 : 14;

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
          itemSize={itemSize}
          buttonWidth={buttonWidth}
          buttonMinHeight={buttonMinHeight}
          labelMinHeight={labelMinHeight}
          labelFontSize={labelFontSize}
          labelLineHeight={labelLineHeight}
          showLabel={showLabels}
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
          left: dynamicTraySideInset,
          right: dynamicTraySideInset,
          bottom: dynamicTrayBottom,
          backgroundColor: hasTrayAsset ? 'transparent' : theme.trayBackground,
          borderColor: hasTrayAsset ? 'transparent' : theme.trayBorder,
        },
      ]}
    >
      {hasTrayAsset ? (
        <ImageBackground
          source={trayAssetSource!}
          style={[
            styles.assetBackground,
            {
              paddingTop: dynamicAssetPaddingTop,
              paddingBottom: dynamicAssetPaddingBottom,
            },
          ]}
          imageStyle={[
            styles.assetBackgroundImage,
            {
              transform: [{ scaleY: dynamicAssetScaleY }, { translateY: dynamicAssetTranslateY }],
            },
          ]}
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
    paddingHorizontal: 6,
    minWidth: '100%',
  },
  trayButton: {
    marginHorizontal: 5,
    alignItems: 'center',
    width: 84,
    minHeight: 104,
    justifyContent: 'flex-start',
  },
  trayButtonDragging: {
    opacity: 0.35,
  },
  stickerFrame: {
    borderRadius: 18,
    padding: 2,
  },
  labelWrap: {
    marginTop: 0,
    minHeight: 30,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  stickerLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    textAlign: 'center',
    textAlignVertical: 'top',
    textShadowColor: 'rgba(255, 255, 255, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    width: '100%',
    paddingHorizontal: 2,
  },
});
