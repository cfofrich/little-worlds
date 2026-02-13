import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import BlankWorldScene from './BlankWorldScene';

type ConstructionSceneProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Construction'>;
};

export default function ConstructionScene({ navigation }: ConstructionSceneProps) {
  return (
    <BlankWorldScene
      navigation={navigation}
      worldLabel="Construction Stickers"
      backgroundColor="#FFF3D0"
    />
  );
}

