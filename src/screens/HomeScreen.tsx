import {
  Alert,
  Image,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
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
};

const SCENES: Scene[] = [
  {
    id: 'playground',
    name: 'Playground',
    color: '#FFB84D',
    imageSource: require('../../assets/backgrounds/playground.png'),
  },
  { id: 'beach', name: 'Beach', color: '#6BBFFF' },
  { id: 'construction', name: 'Construction', color: '#FFD93D' },
  { id: 'farm', name: 'Farm', color: '#95D5A0' },
  { id: 'space', name: 'Space', color: '#A78BFA' },
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

  const { soundEnabled, toggleSound } = useSound();

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [centeredIndex, setCenteredIndex] = useState(0);

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

    if (sceneId === 'playground') {
      navigation.navigate('Playground');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/homescreen.png')}
      style={styles.container}
      resizeMode="cover"
    >
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
        />
      </View>

      <SettingsModal
        visible={settingsVisible}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onClose={() => setSettingsVisible(false)}
        onFeedbackPress={handleFeedback}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    position: 'absolute',
    right: 20,
    zIndex: 1,
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
