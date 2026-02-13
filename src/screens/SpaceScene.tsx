import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import WorldSceneShell from '../components/world/WorldSceneShell';
import { getWorldConfig } from '../data/worlds';

type SpaceSceneProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Space'>;
};

export default function SpaceScene({ navigation }: SpaceSceneProps) {
  return <WorldSceneShell navigation={navigation} world={getWorldConfig('space')} />;
}
