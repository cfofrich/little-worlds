import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import WorldStickerBoard from '../components/stickers/WorldStickerBoard';
import { StickerDefinition, StickerTrayTheme } from '../components/stickers/types';

type PlaygroundSceneProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Playground'>;
};

const PLAYGROUND_STICKERS: StickerDefinition[] = [
  {
    id: 'beach-ball',
    name: 'Ball',
    color: '#EF4444',
    glowColor: '#F87171',
    imageSource: require('../../assets/stickers/playground/beachball.png'),
    imageScale: 1.45,
  },
  {
    id: 'dump-truck',
    name: 'Truck',
    color: '#F59E0B',
    glowColor: '#FBBF24',
    imageSource: require('../../assets/stickers/playground/dumptrucktransparent.png'),
    imageScale: 1.25,
  },
  {
    id: 'slide',
    name: 'Slide',
    color: '#22C55E',
    glowColor: '#4ADE80',
    imageSource: require('../../assets/stickers/playground/slide.png'),
    imageScale: 1.35,
  },
  {
    id: 'tree',
    name: 'Tree',
    color: '#16A34A',
    glowColor: '#4ADE80',
    imageSource: require('../../assets/stickers/playground/tree.png'),
    imageScale: 1.35,
  },
  {
    id: 'toddler-boy',
    name: 'Boy',
    color: '#3B82F6',
    glowColor: '#60A5FA',
    imageSource: require('../../assets/stickers/playground/toddlerboy.png'),
    imageScale: 1.95,
    imageOffsetY: 2,
  },
  {
    id: 'toddler-girl',
    name: 'Girl',
    color: '#EC4899',
    glowColor: '#F472B6',
    imageSource: require('../../assets/stickers/playground/toddlergirl.png'),
    imageScale: 1.25,
    imageOffsetY: 0,
  },
];

const PLAYGROUND_TRAY_THEME: StickerTrayTheme = {
  trayBackground: 'rgba(209, 250, 229, 0.97)',
  traySurface: 'rgba(240, 253, 244, 0.98)',
  trayBorder: '#86EFAC',
  trayLabelBackground: '#D1FAE5',
  trayLabelText: '#166534',
  cleanupSlotBackground: 'rgba(255, 255, 255, 0.88)',
};

export default function PlaygroundScene({ navigation }: PlaygroundSceneProps) {
  const insets = useSafeAreaInsets();

  return (
    <WorldStickerBoard
      backgroundSource={require('../../assets/backgrounds/playground.png')}
      stickers={PLAYGROUND_STICKERS}
      topInset={insets.top + 8}
      worldLabel="Playground Stickers"
      trayTheme={PLAYGROUND_TRAY_THEME}
    >
      <View pointerEvents="box-none" style={styles.container}>
        <TouchableOpacity
          style={[styles.homeButton, { top: insets.top + 8 }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>Home</Text>
        </TouchableOpacity>
      </View>
    </WorldStickerBoard>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  homeButton: {
    position: 'absolute',
    left: 20,
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F3A45',
  },
});
