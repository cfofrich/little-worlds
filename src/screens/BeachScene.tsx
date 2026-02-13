import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import WorldSceneShell from '../components/world/WorldSceneShell';
import { getWorldConfig } from '../data/worlds';

type BeachSceneProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Beach'>;
};

export default function BeachScene({ navigation }: BeachSceneProps) {
  return <WorldSceneShell navigation={navigation} world={getWorldConfig('beach')} />;
}
