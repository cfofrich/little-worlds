import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import StickerVisual from './StickerVisual';
import { StickerDefinition } from './types';

export const TRAY_ITEM_SIZE = 64;
export const CLEANUP_TARGET_GAP = 12;

type StickerTrayProps = {
  stickers: StickerDefinition[];
  trayHeight: number;
  onStickerPress: (stickerId: string) => void;
  mode: 'creative' | 'cleanup';
};

export default function StickerTray({
  stickers,
  trayHeight,
  onStickerPress,
  mode,
}: StickerTrayProps) {
  const isCleanup = mode === 'cleanup';

  return (
    <View style={[styles.tray, { height: trayHeight }]}>
      {isCleanup ? (
        <View style={styles.cleanupRow}>
          {stickers.map((sticker) => (
            <View key={sticker.id} style={styles.cleanupItemWrap}>
              <View
                style={[
                  styles.cleanupGlow,
                  { shadowColor: sticker.glowColor ?? sticker.color },
                ]}
              >
                <StickerVisual
                  size={TRAY_ITEM_SIZE}
                  name={sticker.name}
                  color={sticker.color}
                  imageSource={sticker.imageSource}
                />
              </View>
            </View>
          ))}
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
              />
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.13,
    shadowRadius: 5,
    elevation: 8,
    justifyContent: 'center',
  },
  trayContent: {
    paddingHorizontal: 12,
    flexGrow: 1,
    justifyContent: 'center',
  },
  trayButton: {
    marginHorizontal: 8,
  },
  cleanupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: CLEANUP_TARGET_GAP,
  },
  cleanupItemWrap: {
    borderRadius: 18,
    padding: 2,
  },
  cleanupGlow: {
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 5,
  },
});
