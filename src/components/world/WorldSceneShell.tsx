import { useRef, useState } from 'react';
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

function usePressPulse() {
  const scale = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    scale.setValue(1);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.93,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.08,
        duration: 130,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { scale, pulse };
}

export default function WorldSceneShell({ navigation, world }: WorldSceneShellProps) {
  const insets = useSafeAreaInsets();
  const boardRef = useRef<WorldStickerBoardHandle>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { playPlop, soundEnabled, toggleSound } = useSound();

  const homePulse = usePressPulse();
  const cleanupPulse = usePressPulse();
  const settingsPulse = usePressPulse();

  const topOffset = insets.top + 20;

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
    homePulse.pulse();
    void playPlop();
    navigation.navigate('Home');
  };

  const handleCleanupPress = () => {
    cleanupPulse.pulse();
    void playPlop();
    boardRef.current?.cleanupAll();
  };

  const handleSettingsOpen = () => {
    settingsPulse.pulse();
    void playPlop();
    setSettingsVisible(true);
  };

  return (
    <View style={styles.screen}>
      <WorldStickerBoard
        ref={boardRef}
        backgroundSource={world.worldBackgroundSource}
        trayAssetSource={require('../../../assets/backgrounds/stickertray.png')}
        trayHeight={196}
        trayContentOffsetY={-12}
        stickers={world.stickers}
        worldLabel={world.worldLabel}
        trayTheme={DEFAULT_TRAY_THEME}
      />

      <View pointerEvents="box-none" style={styles.overlay}>
        <View style={[styles.topBar, { top: topOffset }]}>
          <TouchableOpacity
            style={styles.homeButton}
            activeOpacity={0.85}
            onPress={handleHomePress}
          >
            <Animated.View style={[styles.imageButtonInner, { transform: [{ scale: homePulse.scale }] }]}>
              <Image
                source={require('../../../assets/enhanceduibuttons/homebutton.png')}
                style={styles.homeButtonImage}
                resizeMode="contain"
              />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cleanupButton}
            activeOpacity={0.85}
            onPress={handleCleanupPress}
          >
            <Animated.View style={[styles.imageButtonInner, { transform: [{ scale: cleanupPulse.scale }] }]}>
              <Image
                source={require('../../../assets/enhanceduibuttons/cleanup.png')}
                style={styles.cleanupButtonImage}
                resizeMode="contain"
              />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsOpen}
            activeOpacity={0.85}
          >
            <Animated.View style={[styles.settingsIcon, { transform: [{ scale: settingsPulse.scale }] }]}>
              <Text style={styles.settingsText}>⚙️</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
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
    left: 20,
    right: 20,
    height: 100,
  },
  homeButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 176,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleanupButton: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -115,
    width: 230,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 88,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtonInner: {
    width: '100%',
    height: '100%',
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
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    borderWidth: 2,
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
    fontSize: 50,
    marginTop: -2,
  },
});
