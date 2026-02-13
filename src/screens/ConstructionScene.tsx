import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import WorldSceneShell from '../components/world/WorldSceneShell';
import { getWorldConfig } from '../data/worlds';

type ConstructionSceneProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Construction'>;
};

export default function ConstructionScene({ navigation }: ConstructionSceneProps) {
  return <WorldSceneShell navigation={navigation} world={getWorldConfig('construction')} />;
}
