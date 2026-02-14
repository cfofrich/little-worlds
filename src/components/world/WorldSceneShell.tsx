import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const { soundEnabled, toggleSound, playCleanup } = useSound();
  const leavingHomeRef = useRef(false);
  const leaveFade = useRef(new Animated.Value(0)).current;

  const topOffset = insets.top + 20;

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      leavingHomeRef.current = false;
      leaveFade.setValue(0);
    });

    return unsubscribeFocus;
  }, [leaveFade, navigation]);

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

  const handleHomePress = () => {
    if (leavingHomeRef.current) {
      return;
    }

    leavingHomeRef.current = true;
    leaveFade.setValue(0);
    Animated.timing(leaveFade, {
      toValue: 1,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      navigation.popToTop();
    });
  };

  const handleCleanupPress = () => {
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
            disabled={leavingHomeRef.current}
            onPress={handleHomePress}
          >
            <Image
              source={HOME_BUTTON_SOURCE}
              defaultSource={HOME_BUTTON_SOURCE}
              style={styles.homeButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cleanupButton}
            activeOpacity={0.85}
            disabled={leavingHomeRef.current}
            onPress={handleCleanupPress}
          >
            <Image
              source={CLEANUP_BUTTON_SOURCE}
              defaultSource={CLEANUP_BUTTON_SOURCE}
              style={styles.cleanupButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            disabled={leavingHomeRef.current}
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
      <Animated.View pointerEvents="none" style={[styles.leaveOverlay, { opacity: leaveFade }]} />
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
  leaveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F2FBFF',
    zIndex: 999,
    elevation: 999,
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
});
