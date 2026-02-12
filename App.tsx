import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import PlaygroundScene from './src/screens/PlaygroundScene';

export type RootStackParamList = {
  Home: undefined;
  Playground: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Playground"
          component={PlaygroundScene}
          options={{ title: 'Playground' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
