import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as MailComposer from 'expo-mail-composer';
import { RootStackParamList } from '../../../App';
import WorldStickerBoard, { WorldStickerBoardHandle } from '../stickers/WorldStickerBoard';
import { StickerTrayTheme } from '../stickers/types';
import { WorldConfig } from '../../data/worlds';
import { useSound } from '../../context/SoundContext';
import SettingsModal from '../SettingsModal';

type WorldSceneShellProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, Exclude<keyof RootStackParamList, 'Home'>>;
  world: WorldConfig;
};

const DEFAULT_TRAY_THEME: StickerTrayTheme = {
  trayBackground: 'rgba(255, 255, 255, 0.88)',
  traySurface: 'rgba(255, 255, 255, 0.92)',
  trayBorder: 'rgba(28, 105, 67, 0.3)',
  trayLabelBackground: 'rgba(255, 255, 255, 0.75)',
  trayLabelText: '#7A4A22',
  cleanupSlotBackground: 'rgba(255, 255, 255, 0.88)',
};

const HOME_BUTTON_SOURCE = require('../../../assets/enhanceduibuttons/homebutton.png');
const CLEANUP_BUTTON_SOURCE = require('../../../assets/enhanceduibuttons/cleanup.png');
const TRAY_SOURCE = require('../../../assets/backgrounds/stickertray.png');

export default function WorldSceneShell({ navigation, world }: WorldSceneShellProps) {
  const insets = useSafeAreaInsets();
  const boardRef = useRef<WorldStickerBoardHandle>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isLeavingHome, setIsLeavingHome] = useState(false);
  const [isTransitionVisible, setIsTransitionVisible] = useState(true);
  const { soundEnabled, toggleSound, playCleanup } = useSound();
  const transitionWashOpacity = useRef(new Animated.Value(1)).current;
  const homePulseScale = useRef(new Animated.Value(1)).current;
  const cleanupPulseScale = useRef(new Animated.Value(1)).current;

  const topOffset = insets.top + 20;

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setIsLeavingHome(false);
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

  useEffect(() => {
    const sources = [
      world.worldBackgroundSource,
      HOME_BUTTON_SOURCE,
      CLEANUP_BUTTON_SOURCE,
      TRAY_SOURCE,
      ...world.stickers.map((sticker) => sticker.imageSource).filter(Boolean),
    ];
    sources.forEach((source) => {
      const resolved = Image.resolveAssetSource(source);
      if (resolved?.uri) {
        void Image.prefetch(resolved.uri).catch(() => {});
      }
    });
  }, [world.worldBackgroundSource, world.stickers]);

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

  const playButtonPulse = useCallback((scale: Animated.Value) => {
    scale.stopAnimation();
    scale.setValue(1);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleHomePress = () => {
    if (isLeavingHome) {
      return;
    }

    playButtonPulse(homePulseScale);
    setIsLeavingHome(true);
    setIsTransitionVisible(true);
    transitionWashOpacity.stopAnimation();
    transitionWashOpacity.setValue(0);
    Animated.timing(transitionWashOpacity, {
      toValue: 1,
      duration: 440,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      navigation.popToTop();
    });
  };

  const handleCleanupPress = () => {
    playButtonPulse(cleanupPulseScale);
    boardRef.current?.cleanupAll();
    void playCleanup();
  };

  const handleSettingsOpen = () => {
    setSettingsVisible(true);
  };

  return (
    <View style={styles.screen}>
      <WorldStickerBoard
        ref={boardRef}
        backgroundSource={world.worldBackgroundSource}
        trayAssetSource={TRAY_SOURCE}
        trayHeight={220}
        trayContentOffsetY={20}
        stickers={world.stickers}
        worldLabel={world.worldLabel}
        trayTheme={DEFAULT_TRAY_THEME}
      />

      <View pointerEvents="box-none" style={styles.overlay}>
        <View style={[styles.topBar, { top: topOffset }]}>
          <TouchableOpacity
            style={styles.homeButton}
            activeOpacity={0.85}
            disabled={isLeavingHome}
            onPress={handleHomePress}
          >
            <Animated.View style={[styles.buttonPulseWrap, { transform: [{ scale: homePulseScale }] }]}>
              <Image
                source={HOME_BUTTON_SOURCE}
                defaultSource={HOME_BUTTON_SOURCE}
                style={styles.homeButtonImage}
                resizeMode="contain"
              />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cleanupButton}
            activeOpacity={0.85}
            disabled={isLeavingHome}
            onPress={handleCleanupPress}
          >
            <Animated.View
              style={[styles.buttonPulseWrap, { transform: [{ scale: cleanupPulseScale }] }]}
            >
              <Image
                source={CLEANUP_BUTTON_SOURCE}
                defaultSource={CLEANUP_BUTTON_SOURCE}
                style={styles.cleanupButtonImage}
                resizeMode="contain"
              />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            disabled={isLeavingHome}
            onPress={handleSettingsOpen}
            activeOpacity={0.85}
          >
            <View style={styles.settingsIcon}>
              <Text style={styles.settingsText}>⚙️</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <SettingsModal
        visible={settingsVisible}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onClose={() => setSettingsVisible(false)}
        onFeedbackPress={handleFeedback}
      />
      <Animated.View
        pointerEvents={isTransitionVisible ? 'auto' : 'none'}
        style={[styles.transitionWash, { opacity: transitionWashOpacity }]}
      />
      <View pointerEvents="none" style={styles.stickerPreloadStrip}>
        {world.stickers.map((sticker) => (
          <Image
            key={`preload-${world.id}-${sticker.id}`}
            source={sticker.imageSource}
            style={styles.stickerPreloadImage}
            resizeMode="contain"
            fadeDuration={0}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
  },
  topBar: {
    position: 'absolute',
    left: 15,
    right: 20,
    height: 176,
    overflow: 'visible',
  },
  homeButton: {
    position: 'absolute',
    left: -10,
    top: 0,
    width: 309,
    height: 156,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  cleanupButton: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -218,
    width: 435,
    height: 156,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  settingsButton: {
    position: 'absolute',
    right: 12,
    top: 51,
    width: 37,
    height: 37,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonImage: {
    width: '100%',
    height: '100%',
  },
  cleanupButtonImage: {
    width: '100%',
    height: '100%',
  },
  buttonPulseWrap: {
    width: '100%',
    height: '100%',
  },
  settingsIcon: {
    width: 37,
    height: 37,
    borderRadius: 18.5,
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 4,
  },
  settingsText: {
    fontSize: 19,
    marginTop: -2,
  },
  stickerPreloadStrip: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  stickerPreloadImage: {
    width: 1,
    height: 1,
  },
  transitionWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 999,
    elevation: 999,
  },
});
