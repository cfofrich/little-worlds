import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import WorldSceneShell from '../components/world/WorldSceneShell';
import { getWorldConfig } from '../data/worlds';

type PlaygroundSceneProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Playground'>;
};

export default function PlaygroundScene({ navigation }: PlaygroundSceneProps) {
  return <WorldSceneShell navigation={navigation} world={getWorldConfig('playground')} />;
}
