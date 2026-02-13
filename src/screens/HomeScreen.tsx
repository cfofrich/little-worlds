import {
  Alert,
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import * as MailComposer from 'expo-mail-composer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import SceneCarousel from '../components/SceneCarousel';
import SettingsModal from '../components/SettingsModal';
import { useHomeLayoutMetrics, SPACING } from '../hooks/useHomeLayoutMetrics';
import { useSound } from '../context/SoundContext';

type Scene = {
  id: string;
  name: string;
  color: string;
  imageSource?: ImageSourcePropType;
  titleImageSource?: ImageSourcePropType;
  homeBackgroundSource: ImageSourcePropType;
};

const SCENES: Scene[] = [
  {
    id: 'playground',
    name: 'Playground',
    color: '#FFB84D',
    imageSource: require('../../assets/backgrounds/playground.png'),
    titleImageSource: require('../../assets/worldtitles/playground.png'),
    homeBackgroundSource: require('../../assets/backgrounds/backgrounds_homescreen/playground.png'),
  },
  {
    id: 'beach',
    name: 'Beach',
    color: '#6BBFFF',
    titleImageSource: require('../../assets/worldtitles/beach.png'),
    homeBackgroundSource: require('../../assets/backgrounds/backgrounds_homescreen/beach.png'),
  },
  {
    id: 'construction',
    name: 'Construction',
    color: '#FFD93D',
    titleImageSource: require('../../assets/worldtitles/construction.png'),
    homeBackgroundSource: require('../../assets/backgrounds/backgrounds_homescreen/construction.png'),
  },
  {
    id: 'farm',
    name: 'Farm',
    color: '#95D5A0',
    titleImageSource: require('../../assets/worldtitles/farm.png'),
    homeBackgroundSource: require('../../assets/backgrounds/backgrounds_homescreen/farm.png'),
  },
  {
    id: 'space',
    name: 'Space',
    color: '#A78BFA',
    titleImageSource: require('../../assets/worldtitles/space.png'),
    homeBackgroundSource: require('../../assets/backgrounds/backgrounds_homescreen/space.png'),
  },
];

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const {
    cardWidth,
    cardHeight,
    snapInterval,
    paddingHorizontal,
    titleWidth,
    titleHeight,
    carouselTop,
    titleTop,
  } = useHomeLayoutMetrics(screenWidth, screenHeight);

  const { soundEnabled, toggleSound, playPlop } = useSound();

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [centeredIndex, setCenteredIndex] = useState(0);
  const [layerAIndex, setLayerAIndex] = useState(0);
  const [layerBIndex, setLayerBIndex] = useState(0);
  const layerAOpacity = useRef(new Animated.Value(1)).current;
  const layerBOpacity = useRef(new Animated.Value(0)).current;
  const activeLayerRef = useRef<'A' | 'B'>('A');
  const activeBackgroundIndexRef = useRef(0);
  const transitionIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const preloadBackgrounds = async () => {
      const preloadTasks = SCENES.map((scene) => {
        if (typeof scene.homeBackgroundSource === 'number' || scene.homeBackgroundSource) {
          const resolved = Image.resolveAssetSource(scene.homeBackgroundSource);
          if (resolved?.uri) {
            return Image.prefetch(resolved.uri);
          }
        }
        return Promise.resolve();
      });

      try {
        await Promise.all(preloadTasks);
      } catch {
        // Non-blocking: transitions still work, this only improves smoothness.
      }

      if (cancelled) {
        return;
      }
    };

    preloadBackgrounds();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (centeredIndex === activeBackgroundIndexRef.current) {
      return;
    }

    transitionIdRef.current += 1;
    const transitionId = transitionIdRef.current;
    const incomingLayer = activeLayerRef.current === 'A' ? 'B' : 'A';
    const incomingOpacity = incomingLayer === 'A' ? layerAOpacity : layerBOpacity;
    const outgoingOpacity = incomingLayer === 'A' ? layerBOpacity : layerAOpacity;

    if (incomingLayer === 'A') {
      setLayerAIndex(centeredIndex);
    } else {
      setLayerBIndex(centeredIndex);
    }

    incomingOpacity.stopAnimation();
    outgoingOpacity.stopAnimation();
    incomingOpacity.setValue(0);
    outgoingOpacity.setValue(1);

    Animated.timing(incomingOpacity, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished || transitionId !== transitionIdRef.current) {
        return;
      }
      activeLayerRef.current = incomingLayer;
      activeBackgroundIndexRef.current = centeredIndex;
      outgoingOpacity.setValue(0);
      incomingOpacity.setValue(1);
    });
  }, [centeredIndex, layerAOpacity, layerBOpacity]);

  const handleFeedback = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();

    if (!isAvailable) {
      Alert.alert('Mail Unavailable', 'Mail is not configured on this device yet.');
      return;
    }

    await MailComposer.composeAsync({
      recipients: ['littleworldsapp@proton.me'],
      subject: 'Little Worlds Feedback',
    });
  };

  const handleCardPress = (index: number, sceneId: string) => {
    if (index !== centeredIndex) {
      return;
    }
    void playPlop();
    if (sceneId === 'playground') navigation.navigate('Playground');
    if (sceneId === 'beach') navigation.navigate('Beach');
    if (sceneId === 'construction') navigation.navigate('Construction');
    if (sceneId === 'farm') navigation.navigate('Farm');
    if (sceneId === 'space') navigation.navigate('Space');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundOverlay, { opacity: layerAOpacity }]} pointerEvents="none">
        <Image
          source={SCENES[layerAIndex].homeBackgroundSource}
          style={styles.backgroundLayer}
          resizeMode="cover"
        />
      </Animated.View>
      <Animated.View style={[styles.backgroundOverlay, { opacity: layerBOpacity }]} pointerEvents="none">
        <Image
          source={SCENES[layerBIndex].homeBackgroundSource}
          style={styles.backgroundLayer}
          resizeMode="cover"
        />
      </Animated.View>
      <View style={styles.contentLayer}>
      <TouchableOpacity
        style={[styles.header, { top: insets.top + 8 }]}
        onPress={() => setSettingsVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.gearIcon}>
          <Text style={styles.gearText}>⚙️</Text>
        </View>
      </TouchableOpacity>

      <Image
        source={require('../../assets/backgrounds/littleworldstitle.png')}
        style={{
          position: 'absolute',
          top: titleTop,
          alignSelf: 'center',
          width: titleWidth,
          height: titleHeight,
        }}
        resizeMode="contain"
      />

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: carouselTop,
        }}
      >
        <SceneCarousel
          scenes={SCENES}
          centeredIndex={centeredIndex}
          onCenteredIndexChange={setCenteredIndex}
          onCardPress={handleCardPress}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          snapInterval={snapInterval}
          paddingHorizontal={paddingHorizontal}
          spacing={SPACING}
          titleImageWidth={Math.round(cardWidth * 0.92)}
          titleImageHeight={Math.round(cardHeight * 0.36)}
        />
      </View>

      <SettingsModal
        visible={settingsVisible}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onClose={() => setSettingsVisible(false)}
        onFeedbackPress={handleFeedback}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    right: 20,
    zIndex: 2,
  },
  gearIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearText: {
    fontSize: 28,
  },
});
