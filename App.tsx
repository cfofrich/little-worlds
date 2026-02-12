import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import PlaygroundScene from './src/screens/PlaygroundScene';
import { SoundProvider } from './src/context/SoundContext';

export type RootStackParamList = {
  Home: undefined;
  Playground: undefined;
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
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SoundProvider>
  );
}
