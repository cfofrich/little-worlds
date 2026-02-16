import {
  Alert,
  Animated,
  Easing,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as MailComposer from 'expo-mail-composer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import SceneCarousel from '../components/SceneCarousel';
import SettingsModal from '../components/SettingsModal';
import { useHomeLayoutMetrics, SPACING } from '../hooks/useHomeLayoutMetrics';
import { HOME_SCENES } from '../data/worlds';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const {
    isTablet,
    cardWidth,
    cardHeight,
    snapInterval,
    paddingHorizontal,
    titleWidth,
    titleHeight,
    carouselTop,
    titleTop,
  } = useHomeLayoutMetrics(screenWidth, screenHeight);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isNavigatingToWorld, setIsNavigatingToWorld] = useState(false);
  const [isTransitionVisible, setIsTransitionVisible] = useState(false);
  const [centeredIndex, setCenteredIndex] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [layerAIndex, setLayerAIndex] = useState(0);
  const [layerBIndex, setLayerBIndex] = useState(0);
  const [activeBackgroundIndex, setActiveBackgroundIndex] = useState(0);
  const layerAOpacity = useRef(new Animated.Value(1)).current;
  const layerBOpacity = useRef(new Animated.Value(0)).current;
  const activeLayerRef = useRef<'A' | 'B'>('A');
  const activeBackgroundIndexRef = useRef(0);
  const transitionTargetIndexRef = useRef(0);
  const transitionIdRef = useRef(0);
  const logoPulse = useRef(new Animated.Value(1)).current;
  const transitionWashOpacity = useRef(new Animated.Value(0)).current;
  const hasFocusedOnceRef = useRef(false);

  const scenes = useMemo(() => HOME_SCENES, []);
  const isPhoneLandscape = screenWidth < 1024;
  const homeGearSize = isPhoneLandscape ? 44 : 52;

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      if (!hasFocusedOnceRef.current) {
        hasFocusedOnceRef.current = true;
        transitionWashOpacity.setValue(0);
        return;
      }

      setIsTransitionVisible(true);
      transitionWashOpacity.stopAnimation();
      transitionWashOpacity.setValue(1);
      Animated.timing(transitionWashOpacity, {
        toValue: 0,
        duration: 440,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) {
          return;
        }
        setIsTransitionVisible(false);
      });
    });

    return unsubscribeFocus;
  }, [navigation, transitionWashOpacity]);

  const startBackgroundTransition = useCallback((nextIndex: number) => {
    if (
      nextIndex === activeBackgroundIndexRef.current ||
      nextIndex === transitionTargetIndexRef.current
    ) {
      return;
    }

    transitionTargetIndexRef.current = nextIndex;
    transitionIdRef.current += 1;
    const transitionId = transitionIdRef.current;
    const incomingLayer = activeLayerRef.current === 'A' ? 'B' : 'A';
    const incomingOpacity = incomingLayer === 'A' ? layerAOpacity : layerBOpacity;
    const outgoingOpacity = incomingLayer === 'A' ? layerBOpacity : layerAOpacity;

    if (incomingLayer === 'A') {
      setLayerAIndex(nextIndex);
    } else {
      setLayerBIndex(nextIndex);
    }

    incomingOpacity.stopAnimation();
    outgoingOpacity.stopAnimation();
    incomingOpacity.setValue(0);
    outgoingOpacity.setValue(1);

    Animated.timing(incomingOpacity, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished || transitionId !== transitionIdRef.current) {
        return;
      }
      activeLayerRef.current = incomingLayer;
      activeBackgroundIndexRef.current = nextIndex;
      transitionTargetIndexRef.current = nextIndex;
      setActiveBackgroundIndex(nextIndex);
      outgoingOpacity.setValue(0);
      incomingOpacity.setValue(1);
    });
  }, [layerAOpacity, layerBOpacity]);

  const requestBackgroundIndex = useCallback((nextIndex: number) => {
    startBackgroundTransition(nextIndex);
  }, [startBackgroundTransition]);

  useEffect(() => {
    requestBackgroundIndex(focusedIndex);
  }, [focusedIndex, requestBackgroundIndex]);

  const handleCenteredIndexChange = useCallback((nextIndex: number) => {
    setCenteredIndex(nextIndex);
    setFocusedIndex(nextIndex);
  }, []);

  const handlePreviewIndexChange = useCallback((nextIndex: number) => {
    setFocusedIndex(nextIndex);
  }, []);

  const handleFeedback = async () => {
    const email = 'littleworldsapp@proton.me';
    const subject = 'Little World: Stickers Feedback';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: [email],
          subject,
        });
        return;
      }
    } catch {
      // Fall through to mailto fallback.
    }

    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      await Linking.openURL(mailtoUrl);
      return;
    }

    Alert.alert('Mail Unavailable', 'No mail app is configured on this device yet.');
  };

  const handleCardPress = async (_index: number, routeName: keyof RootStackParamList) => {
    if (routeName === 'Home') {
      return;
    }
    if (isNavigatingToWorld) {
      return;
    }

    const scene = scenes.find((item) => item.routeName === routeName);
    if (!scene) {
      return;
    }

    setIsNavigatingToWorld(true);
    setIsTransitionVisible(true);
    transitionWashOpacity.stopAnimation();
    transitionWashOpacity.setValue(0);

    Animated.timing(transitionWashOpacity, {
      toValue: 1,
      duration: 440,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        setIsNavigatingToWorld(false);
        setIsTransitionVisible(false);
        return;
      }

      navigation.navigate(routeName);
      setIsNavigatingToWorld(false);
    });
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
  };

  const backgroundFallbackSource = Array.isArray(scenes[activeBackgroundIndex].homeBackgroundSource)
    ? scenes[activeBackgroundIndex].homeBackgroundSource[0]
    : scenes[activeBackgroundIndex].homeBackgroundSource;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundOverlay, { opacity: layerAOpacity }]} pointerEvents="none">
        <Image
          source={scenes[layerAIndex].homeBackgroundSource}
          defaultSource={backgroundFallbackSource}
          fadeDuration={0}
          style={styles.backgroundLayer}
          resizeMode="cover"
        />
      </Animated.View>
      <Animated.View style={[styles.backgroundOverlay, { opacity: layerBOpacity }]} pointerEvents="none">
        <Image
          source={scenes[layerBIndex].homeBackgroundSource}
          defaultSource={backgroundFallbackSource}
          fadeDuration={0}
          style={styles.backgroundLayer}
          resizeMode="cover"
        />
      </Animated.View>
      <View pointerEvents="none" style={styles.backgroundPreloadStrip}>
        {scenes.map((scene) => (
          <Image
            key={`bg-preload-${scene.id}`}
            source={scene.homeBackgroundSource}
            style={styles.backgroundPreloadImage}
            resizeMode="cover"
            fadeDuration={0}
          />
        ))}
      </View>
      <Animated.View
        pointerEvents={isTransitionVisible ? 'auto' : 'none'}
        style={[
          styles.transitionWash,
          {
            opacity: transitionWashOpacity,
          },
        ]}
      />

      <View style={styles.contentLayer}>
        <TouchableOpacity
          style={[styles.header, { top: insets.top + 6 }]}
          onPress={() => {
            setSettingsVisible(true);
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.gearIcon, { width: homeGearSize, height: homeGearSize, borderRadius: homeGearSize / 2 }]}>
            <Animated.Text style={[styles.gearText, { fontSize: isPhoneLandscape ? 26 : 32 }]}>⚙️</Animated.Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={{ position: 'absolute', top: titleTop, alignSelf: 'center' }} onPress={handleLogoPress} activeOpacity={0.9}>
          <Animated.View style={{ transform: [{ scale: logoPulse }] }}>
            <Image
              source={require('../../assets/backgrounds/littleworldsstickers.png')}
              style={{ width: Math.round(titleWidth * 1.18), height: Math.round(titleHeight * 1.18) }}
              resizeMode="contain"
            />
          </Animated.View>
        </TouchableOpacity>

        <View style={{ position: 'absolute', left: 0, right: 0, top: carouselTop }}>
          <SceneCarousel
            scenes={scenes}
            centeredIndex={centeredIndex}
            onCenteredIndexChange={handleCenteredIndexChange}
            onPreviewIndexChange={handlePreviewIndexChange}
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
            titleOffsetY={isTablet ? 0 : -13}
          />
        </View>

        <SettingsModal
          visible={settingsVisible}
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
  backgroundPreloadStrip: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  backgroundPreloadImage: {
    width: 1,
    height: 1,
  },
  transitionWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 50,
    elevation: 50,
  },
  contentLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  header: {
    position: 'absolute',
    right: 20,
    zIndex: 2,
  },
  gearIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearText: {
    fontSize: 32,
  },
});
