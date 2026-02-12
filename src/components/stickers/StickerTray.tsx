import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StickerVisual from './StickerVisual';
import { StickerDefinition, StickerTrayTheme } from './types';

export const TRAY_ITEM_SIZE = 64;
export const CLEANUP_TARGET_GAP = 12;

type StickerTrayProps = {
  stickers: StickerDefinition[];
  trayHeight: number;
  onStickerPress: (stickerId: string) => void;
  mode: 'creative' | 'cleanup';
  remainingStickerIds?: Set<string>;
  cleanupTargetSize: number;
  worldLabel?: string;
  theme: StickerTrayTheme;
};

export default function StickerTray({
  stickers,
  trayHeight,
  onStickerPress,
  mode,
  remainingStickerIds,
  cleanupTargetSize,
  worldLabel,
  theme,
}: StickerTrayProps) {
  const isCleanup = mode === 'cleanup';

  return (
    <View
      style={[
        styles.tray,
        {
          height: trayHeight,
          backgroundColor: theme.trayBackground,
          borderColor: theme.trayBorder,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { color: theme.trayLabelText }]}>
          {worldLabel ?? 'Stickers'}
        </Text>
        <Text style={[styles.modeText, { color: theme.trayLabelText }]}>
          {isCleanup ? 'Match & Return' : 'Tap to Add'}
        </Text>
      </View>

      {isCleanup ? (
        <View style={styles.cleanupRow}>
          {stickers.map((sticker) => {
            const isRemaining = remainingStickerIds?.has(sticker.id) ?? false;

            return (
              <View key={sticker.id} style={styles.cleanupItem}>
                <View
                  style={[
                    styles.cleanupTarget,
                    {
                      width: cleanupTargetSize + 8,
                      height: cleanupTargetSize + 8,
                      borderColor: sticker.glowColor ?? sticker.color,
                      backgroundColor: theme.cleanupSlotBackground,
                      opacity: isRemaining ? 1 : 0.35,
                    },
                  ]}
                >
                  <StickerVisual
                    size={cleanupTargetSize}
                    name={sticker.name}
                    color={sticker.color}
                    imageSource={sticker.imageSource}
                    imageScale={sticker.imageScale}
                    imageOffsetY={sticker.imageOffsetY}
                  />
                </View>
                <Text style={[styles.stickerLabel, { color: theme.trayLabelText }]}>
                  {sticker.name}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trayContent}
        >
          {stickers.map((sticker) => (
            <TouchableOpacity
              key={sticker.id}
              onPress={() => onStickerPress(sticker.id)}
              activeOpacity={0.85}
              style={styles.trayButton}
            >
              <StickerVisual
                size={TRAY_ITEM_SIZE}
                name={sticker.name}
                color={sticker.color}
                imageSource={sticker.imageSource}
                imageScale={sticker.imageScale}
                imageOffsetY={sticker.imageOffsetY}
              />
              <Text style={[styles.stickerLabel, { color: theme.trayLabelText }]}>
                {sticker.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    position: 'absolute',
    left: 0,
    right: 0,
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
    paddingHorizontal: 8,
    paddingBottom: 4,
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  trayButton: {
    marginHorizontal: 8,
    alignItems: 'center',
    width: 78,
    minHeight: 88,
    justifyContent: 'flex-start',
  },
  cleanupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: CLEANUP_TARGET_GAP,
    flex: 1,
  },
  cleanupItem: {
    alignItems: 'center',
    width: 78,
    minHeight: 88,
    justifyContent: 'flex-start',
  },
  cleanupTarget: {
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 7,
    elevation: 4,
  },
  stickerLabel: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
