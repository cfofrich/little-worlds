import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import { RootStackParamList } from '../../../App';
import WorldStickerBoard, { WorldStickerBoardHandle } from '../stickers/WorldStickerBoard';
import { StickerTrayTheme } from '../stickers/types';
import { WorldConfig } from '../../data/worlds';
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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const boardRef = useRef<WorldStickerBoardHandle>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isLeavingHome, setIsLeavingHome] = useState(false);
  const [isTransitionVisible, setIsTransitionVisible] = useState(true);
  const transitionWashOpacity = useRef(new Animated.Value(1)).current;
  const homePulseScale = useRef(new Animated.Value(1)).current;
  const cleanupPulseScale = useRef(new Animated.Value(1)).current;

  const isPhoneLandscape = screenWidth < 1024;
  const buttonScale = isPhoneLandscape ? 0.56 : 1;
  const homeButtonWidth = Math.round(309 * buttonScale);
  const homeButtonHeight = Math.round(156 * buttonScale);
  const cleanupButtonWidth = Math.round(435 * buttonScale);
  const cleanupButtonHeight = Math.round(156 * buttonScale);
  const settingsButtonSize = isPhoneLandscape ? 30 : 37;
  const topBarHeight = isPhoneLandscape ? 108 : 176;

  const trayHeight = Math.round(
    Math.min(220, Math.max(isPhoneLandscape ? 118 : 180, screenHeight * 0.26))
  );
  const trayContentOffsetY = isPhoneLandscape ? 10 : 20;
  const placedStickerSize = isPhoneLandscape ? 78 : 92;

  const topOffset = insets.top + (isPhoneLandscape ? 7 : 11);

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
        trayHeight={trayHeight}
        trayContentOffsetY={trayContentOffsetY}
        placedStickerSize={placedStickerSize}
        stickers={world.stickers}
        worldLabel={world.worldLabel}
        trayTheme={DEFAULT_TRAY_THEME}
      />

      <View pointerEvents="box-none" style={styles.overlay}>
        <View style={[styles.topBar, { top: topOffset, height: topBarHeight }]}>
          <TouchableOpacity
            style={[
              styles.homeButton,
              {
                width: homeButtonWidth,
                height: homeButtonHeight,
                left: isPhoneLandscape ? -14 : -40,
              },
            ]}
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
            style={[
              styles.cleanupButton,
              {
                width: cleanupButtonWidth,
                height: cleanupButtonHeight,
                marginLeft: -Math.round(cleanupButtonWidth / 2),
              },
            ]}
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
            style={[
              styles.settingsButton,
              {
                width: settingsButtonSize,
                height: settingsButtonSize,
                top: isPhoneLandscape ? 15 : 34,
                right: isPhoneLandscape ? 10 : 12,
              },
            ]}
            disabled={isLeavingHome}
            onPress={handleSettingsOpen}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.settingsIcon,
                {
                  width: settingsButtonSize,
                  height: settingsButtonSize,
                  borderRadius: settingsButtonSize / 2,
                },
              ]}
            >
              <Text style={[styles.settingsText, { fontSize: isPhoneLandscape ? 16 : 19 }]}>⚙️</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <SettingsModal
        visible={settingsVisible}
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
    left: -40,
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
    top: 34,
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
