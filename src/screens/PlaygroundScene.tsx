import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import WorldStickerBoard from '../components/stickers/WorldStickerBoard';
import { StickerDefinition } from '../components/stickers/types';

type PlaygroundSceneProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Playground'>;
};

const PLAYGROUND_STICKERS: StickerDefinition[] = [
  { id: 'red-ball', name: 'Ball', color: '#EF4444', glowColor: '#F87171' },
  { id: 'bear', name: 'Bear', color: '#A855F7', glowColor: '#C084FC' },
  { id: 'truck', name: 'Truck', color: '#F59E0B', glowColor: '#FBBF24' },
  { id: 'bucket', name: 'Bucket', color: '#EC4899', glowColor: '#F472B6' },
  { id: 'kite', name: 'Kite', color: '#0EA5E9', glowColor: '#38BDF8' },
];

export default function PlaygroundScene({ navigation }: PlaygroundSceneProps) {
  const insets = useSafeAreaInsets();

  return (
    <WorldStickerBoard
      backgroundSource={require('../../assets/backgrounds/playground.png')}
      stickers={PLAYGROUND_STICKERS}
      topInset={insets.top + 8}
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
