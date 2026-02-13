import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import PlaygroundScene from './src/screens/PlaygroundScene';
import BeachScene from './src/screens/BeachScene';
import ConstructionScene from './src/screens/ConstructionScene';
import FarmScene from './src/screens/FarmScene';
import SpaceScene from './src/screens/SpaceScene';
import { SoundProvider } from './src/context/SoundContext';

export type RootStackParamList = {
  Home: undefined;
  Playground: undefined;
  Beach: undefined;
  Construction: undefined;
  Farm: undefined;
  Space: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SoundProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 220,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            name="Playground"
            component={PlaygroundScene}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Beach"
            component={BeachScene}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Construction"
            component={ConstructionScene}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Farm"
            component={FarmScene}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Space"
            component={SpaceScene}
            options={{
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SoundProvider>
  );
}
