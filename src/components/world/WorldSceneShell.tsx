import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export default function WorldSceneShell({ navigation, world }: WorldSceneShellProps) {
  const insets = useSafeAreaInsets();
  const boardRef = useRef<WorldStickerBoardHandle>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { soundEnabled, toggleSound } = useSound();

  const topOffset = insets.top + 26;

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
    navigation.popToTop();
  };

  const handleCleanupPress = () => {
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
        trayAssetSource={require('../../../assets/backgrounds/stickertray.png')}
        trayHeight={220}
        trayContentOffsetY={0}
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
            <Image
              source={require('../../../assets/enhanceduibuttons/homebutton.png')}
              style={styles.homeButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cleanupButton}
            activeOpacity={0.85}
            onPress={handleCleanupPress}
          >
            <Image
              source={require('../../../assets/enhanceduibuttons/cleanup.png')}
              style={styles.cleanupButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
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
    height: 124,
    overflow: 'visible',
  },
  homeButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 206,
    height: 104,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  cleanupButton: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -145,
    width: 290,
    height: 104,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  settingsButton: {
    position: 'absolute',
    right: 0,
    top: 36,
    width: 74,
    height: 74,
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
    width: 74,
    height: 74,
    borderRadius: 37,
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
    fontSize: 38,
    marginTop: -2,
  },
});
