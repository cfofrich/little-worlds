import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import PlaygroundScene from './src/screens/PlaygroundScene';
import BeachScene from './src/screens/BeachScene';
import ConstructionScene from './src/screens/ConstructionScene';
import FarmScene from './src/screens/FarmScene';
import SpaceScene from './src/screens/SpaceScene';
import ZooScene from './src/screens/ZooScene';

export type RootStackParamList = {
  Home: undefined;
  Playground: undefined;
  Beach: undefined;
  Construction: undefined;
  Farm: undefined;
  Space: undefined;
  Zoo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [showBoot, setShowBoot] = useState(true);
  const whitePhaseOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = setTimeout(() => {
      Animated.timing(whitePhaseOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) {
          return;
        }

        setShowBoot(false);
        Animated.timing(whitePhaseOpacity, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    }, 480);

    return () => {
      clearTimeout(sequence);
      whitePhaseOpacity.stopAnimation();
    };
  }, [whitePhaseOpacity]);

  return (
    <View style={styles.appRoot}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'none',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Playground" component={PlaygroundScene} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Beach" component={BeachScene} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Construction" component={ConstructionScene} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Farm" component={FarmScene} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Space" component={SpaceScene} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Zoo" component={ZooScene} options={{ gestureEnabled: false }} />
        </Stack.Navigator>
      </NavigationContainer>

      {showBoot ? (
        <View style={styles.bootOverlay} pointerEvents="none">
          <ImageBackground
            source={require('./assets/backgrounds/worlds/playground.png')}
            style={styles.bootBackground}
            resizeMode="cover"
          >
            <View style={styles.bootContent}>
              <Image source={require('./assets/logo.png')} style={styles.bootLogo} resizeMode="contain" />
              <Image
                source={require('./assets/backgrounds/littleworldsstickers.png')}
                style={styles.bootWordmark}
                resizeMode="contain"
              />
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.bootStatus}>Loading Little World: Stickers...</Text>
            </View>
          </ImageBackground>
        </View>
      ) : null}

      <Animated.View pointerEvents="none" style={[styles.whitePhaseOverlay, { opacity: whitePhaseOpacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  bootOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 90,
    elevation: 90,
  },
  bootBackground: {
    flex: 1,
  },
  bootContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  bootLogo: {
    width: 128,
    height: 128,
  },
  bootWordmark: {
    width: 320,
    height: 120,
    marginBottom: 6,
  },
  bootStatus: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 5,
    textShadowOffset: { width: 0, height: 1 },
  },
  whitePhaseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
    elevation: 100,
  },
});
