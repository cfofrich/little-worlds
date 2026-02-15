import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import WorldSceneShell from '../components/world/WorldSceneShell';
import { getWorldConfig } from '../data/worlds';

type ZooSceneProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Zoo'>;
};

export default function ZooScene({ navigation }: ZooSceneProps) {
  return <WorldSceneShell navigation={navigation} world={getWorldConfig('zoo')} />;
}

