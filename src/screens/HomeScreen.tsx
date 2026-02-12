import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Animated,
  useWindowDimensions,
  ImageBackground,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useRef, useState, useEffect } from 'react';
import * as MailComposer from 'expo-mail-composer';

type Scene = {
  id: string;
  name: string;
  color: string;
};

const SCENES: Scene[] = [
  { id: '1', name: 'Playground', color: '#FFB84D' },
  { id: '2', name: 'Beach', color: '#6BBFFF' },
  { id: '3', name: 'Construction', color: '#FFD93D' },
  { id: '4', name: 'Farm', color: '#95D5A0' },
  { id: '5', name: 'Space', color: '#A78BFA' },
];

const SPACING = 24;

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { width: rawWidth, height: rawHeight } = useWindowDimensions();

  // Force landscape: width should always be the larger dimension
  const screenWidth = Math.max(rawWidth, rawHeight);
  const screenHeight = Math.min(rawWidth, rawHeight);

  // Responsive card sizing: smaller percentage on tablets to avoid oversized cards
  const isTablet = screenWidth >= 1024;
  const CARD_WIDTH = Math.round(screenWidth * (isTablet ? 0.35 : 0.45));
  const snapInterval = CARD_WIDTH + SPACING;
  const paddingHorizontal = (screenWidth - CARD_WIDTH) / 2;

  // Card height: landscape aspect ratio (16:10)
  const CARD_HEIGHT = Math.round(CARD_WIDTH * 0.625);

  // Title logo sizing — scales with screen, smaller on phones
  const TITLE_HEIGHT = Math.round(screenHeight * 0.35);
  const TITLE_WIDTH = Math.round(screenWidth * (isTablet ? 0.6 : 0.7));

  // Cards stay where they are; title sits above them with its own positioning
  const carouselTop = (screenHeight - CARD_HEIGHT) / 2;
  const titleTop = carouselTop - TITLE_HEIGHT + Math.round(screenHeight * 0.05);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const toggleSound = () => setSoundEnabled((prev) => !prev);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const handleFeedback = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      await MailComposer.composeAsync({
        recipients: ['littleworldsapp@proton.me'],
        subject: 'Little Worlds Feedback',
      });
    }
  };

  const scrollX = useRef(new Animated.Value(0)).current;
  const [centeredIndex, setCenteredIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation when centeredIndex changes
  // Triggers: 0 -> 0.03 -> 0 over ~800ms (subtle pulse to avoid clipping)
  useEffect(() => {
    pulseAnim.setValue(0);
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.03,
        duration: 400,
        useNativeDriver: false, // Must match scrollX driver setting
      }),
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, [centeredIndex]);

  const handleMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    // centeredIndex = clamp(round(offsetX / snapInterval), 0, 4)
    const newIndex = Math.max(0, Math.min(4, Math.round(offsetX / snapInterval)));
    setCenteredIndex(newIndex);
  };

  const handleCardPress = (index: number, sceneName: string) => {
    // Only navigate if it's the centered Playground card
    if (index === centeredIndex && sceneName === 'Playground') {
      navigation.navigate('Playground');
    }
  };

  const renderCard = ({ item, index }: { item: Scene; index: number }) => {
    // Continuous interpolation for scale and opacity based on scroll position
    const inputRange = [
      (index - 1) * snapInterval,
      index * snapInterval,
      (index + 1) * snapInterval,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    // Apply pulse only to centered card by adding pulse value to base scale
    const finalScale =
      index === centeredIndex ? Animated.add(scale, pulseAnim) : scale;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleCardPress(index, item.name)}
      >
        <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: item.color,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                transform: [{ scale: finalScale }],
                opacity,
              },
            ]}
          >
            <Text style={styles.cardText}>{item.name}</Text>
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/homescreenbackgroundtwo.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Gear icon top-right */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setSettingsVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.gearIcon}>
          <Text style={styles.gearText}>⚙️</Text>
        </View>
      </TouchableOpacity>

      {/* Title logo */}
      <Image
        source={require('../../assets/backgrounds/littleworldstitle.png')}
        style={{
          position: 'absolute',
          top: titleTop,
          alignSelf: 'center',
          width: TITLE_WIDTH,
          height: TITLE_HEIGHT,
        }}
        resizeMode="contain"
      />

      {/* Card carousel */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: carouselTop,
        }}
      >
        <Animated.FlatList
          data={SCENES}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal,
          }}
          snapToInterval={snapInterval}
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          // Add spacing between cards
          ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
          // Force re-render when centeredIndex changes (fixes pulse animation)
          extraData={centeredIndex}
        />
      </View>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSettingsVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Settings</Text>

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={toggleSound}
              activeOpacity={0.7}
            >
              <Text style={styles.settingsLabel}>Sound Effects</Text>
              <View style={[
                styles.toggleTrack,
                { backgroundColor: soundEnabled ? '#95D5A0' : '#ccc' },
              ]}>
                <View style={[
                  styles.toggleThumb,
                  { alignSelf: soundEnabled ? 'flex-end' : 'flex-start' },
                ]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={handleFeedback}
              activeOpacity={0.8}
            >
              <Text style={styles.feedbackButtonText}>Send Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSettingsVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light gray background
  },
  header: {
    position: 'absolute',
    top: 40,
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
  cardContainer: {
    alignItems: 'center',
  },
  card: {
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingsLabel: {
    fontSize: 18,
    color: '#333',
  },
  feedbackButton: {
    backgroundColor: '#6BBFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  feedbackButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  toggleTrack: {
    width: 52,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
});
