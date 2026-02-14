import {
  Alert,
  Animated,
  Easing,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as MailComposer from 'expo-mail-composer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import SceneCarousel from '../components/SceneCarousel';
import SettingsModal from '../components/SettingsModal';
import { useHomeLayoutMetrics, SPACING } from '../hooks/useHomeLayoutMetrics';
import { useSound } from '../context/SoundContext';
import { HOME_SCENES } from '../data/worlds';

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
  const logoPulse = useRef(new Animated.Value(1)).current;

  const scenes = useMemo(() => HOME_SCENES, []);

  useEffect(() => {
    const prefetchTasks = scenes.flatMap((scene) => {
      const assets = [scene.homeBackgroundSource, scene.imageSource];
      return assets
        .map((assetSource) => Image.resolveAssetSource(assetSource))
        .filter((resolved) => resolved?.uri)
        .map((resolved) => Image.prefetch(resolved.uri));
    });

    if (!prefetchTasks.length) {
      return;
    }

    void Promise.all(prefetchTasks).catch(() => {});
  }, [scenes]);

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

  const handleCardPress = (_index: number, routeName: keyof RootStackParamList) => {
    if (routeName === 'Home') {
      return;
    }

    navigation.navigate(routeName);
    void playPlop();
  };

  const handleLogoPress = () => {
    logoPulse.setValue(1);
    Animated.sequence([
      Animated.timing(logoPulse, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(logoPulse, {
        toValue: 1.1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(logoPulse, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start();

    void playPlop();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundOverlay, { opacity: layerAOpacity }]} pointerEvents="none">
        <Image source={scenes[layerAIndex].homeBackgroundSource} style={styles.backgroundLayer} resizeMode="cover" />
      </Animated.View>
      <Animated.View style={[styles.backgroundOverlay, { opacity: layerBOpacity }]} pointerEvents="none">
        <Image source={scenes[layerBIndex].homeBackgroundSource} style={styles.backgroundLayer} resizeMode="cover" />
      </Animated.View>

      <View style={styles.contentLayer}>
        <TouchableOpacity
          style={[styles.header, { top: insets.top + 8 }]}
          onPress={() => {
            void playPlop();
            setSettingsVisible(true);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.gearIcon}>
            <Animated.Text style={styles.gearText}>⚙️</Animated.Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={{ position: 'absolute', top: titleTop, alignSelf: 'center' }} onPress={handleLogoPress} activeOpacity={0.9}>
          <Animated.View style={{ transform: [{ scale: logoPulse }] }}>
            <Image
              source={require('../../assets/backgrounds/littleworldstitle.png')}
              style={{ width: Math.round(titleWidth * 1.18), height: Math.round(titleHeight * 1.18) }}
              resizeMode="contain"
            />
          </Animated.View>
        </TouchableOpacity>

        <View style={{ position: 'absolute', left: 0, right: 0, top: carouselTop }}>
          <SceneCarousel
            scenes={scenes}
            centeredIndex={centeredIndex}
            onCenteredIndexChange={setCenteredIndex}
            onCardPress={(index, sceneId) => {
              const scene = scenes.find((item) => item.id === sceneId);
              if (!scene) {
                return;
              }
              handleCardPress(index, scene.routeName);
            }}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            snapInterval={snapInterval}
            paddingHorizontal={paddingHorizontal}
            spacing={SPACING}
            titleImageWidth={Math.round(cardWidth * 0.96)}
            titleImageHeight={Math.round(cardHeight * 0.48)}
          />
        </View>

        <SettingsModal
          visible={settingsVisible}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onClose={() => setSettingsVisible(false)}
          onFeedbackPress={handleFeedback}
          onButtonPress={() => {
            void playPlop();
          }}
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  gearText: {
    fontSize: 32,
  },
});
