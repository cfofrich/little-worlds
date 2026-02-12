import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  useWindowDimensions,
  ImageBackground,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useRef, useState, useEffect } from 'react';

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
          <Text style={styles.sceneName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/homescreenbackground.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Gear icon top-right (visual only) */}
      <View style={styles.header}>
        <View style={styles.gearIcon}>
          <Text style={styles.gearText}>⚙️</Text>
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: (screenHeight - (CARD_HEIGHT + 60)) / 2,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearText: {
    fontSize: 28,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
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
  sceneName: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
});
