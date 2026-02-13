import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import WorldSceneShell from '../components/world/WorldSceneShell';
import { getWorldConfig } from '../data/worlds';

type FarmSceneProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Farm'>;
};

export default function FarmScene({ navigation }: FarmSceneProps) {
  return <WorldSceneShell navigation={navigation} world={getWorldConfig('farm')} />;
}
