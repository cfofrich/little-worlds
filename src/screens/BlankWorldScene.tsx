import { Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as MailComposer from 'expo-mail-composer';
import { RootStackParamList } from '../../App';
import WorldStickerBoard from '../components/stickers/WorldStickerBoard';
import { StickerTrayTheme } from '../components/stickers/types';
import { useSound } from '../context/SoundContext';
import SettingsModal from '../components/SettingsModal';

type BlankWorldSceneProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'Beach' | 'Construction' | 'Farm' | 'Space'
  >;
  worldLabel: string;
  backgroundColor: string;
};

const TRAY_THEME: StickerTrayTheme = {
  trayBackground: 'rgba(255, 255, 255, 0.88)',
  traySurface: 'rgba(255, 255, 255, 0.92)',
  trayBorder: 'rgba(28, 105, 67, 0.3)',
  trayLabelBackground: 'rgba(255, 255, 255, 0.75)',
  trayLabelText: '#7A4A22',
  cleanupSlotBackground: 'rgba(255, 255, 255, 0.88)',
};

export default function BlankWorldScene({
  navigation,
  worldLabel,
  backgroundColor,
}: BlankWorldSceneProps) {
  const insets = useSafeAreaInsets();
  const homeButtonScale = useRef(new Animated.Value(1)).current;
  const { playPlop, soundEnabled, toggleSound } = useSound();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const handleHomePressIn = () => {
    homeButtonScale.setValue(1);
    Animated.sequence([
      Animated.timing(homeButtonScale, {
        toValue: 0.92,
        duration: 70,
        useNativeDriver: false,
      }),
      Animated.timing(homeButtonScale, {
        toValue: 1.08,
        duration: 120,
        useNativeDriver: false,
      }),
      Animated.timing(homeButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleHomePress = () => {
    void playPlop();
    navigation.navigate('Home');
  };

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

  return (
    <View style={styles.screen}>
      <WorldStickerBoard
        backgroundColor={backgroundColor}
        trayAssetSource={require('../../assets/backgrounds/stickertray.png')}
        trayHeight={188}
        stickers={[]}
        worldLabel={worldLabel}
        trayTheme={TRAY_THEME}
      />
      <View pointerEvents="box-none" style={styles.overlay}>
        <TouchableOpacity
          style={[styles.homeButton, { top: insets.top + 24 }]}
          onPress={handleHomePress}
          onPressIn={handleHomePressIn}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.homeButtonInner, { transform: [{ scale: homeButtonScale }] }]}>
            <Image
              source={require('../../assets/enhanceduibuttons/homebutton.png')}
              style={styles.homeButtonImage}
              resizeMode="contain"
            />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.settingsButton, { top: insets.top + 8 }]}
          onPress={() => setSettingsVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.gearIcon}>
            <Text style={styles.gearText}>⚙️</Text>
          </View>
        </TouchableOpacity>
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
    zIndex: 40,
    elevation: 40,
  },
  homeButton: {
    position: 'absolute',
    left: 24,
    zIndex: 50,
    elevation: 50,
    width: 100,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  homeButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonImage: {
    width: '205%',
    height: '205%',
    transform: [{ translateY: 8 }],
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
    zIndex: 60,
    elevation: 60,
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
