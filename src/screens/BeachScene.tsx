import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import BlankWorldScene from './BlankWorldScene';

type BeachSceneProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Beach'>;
};

export default function BeachScene({ navigation }: BeachSceneProps) {
  return (
    <BlankWorldScene
      navigation={navigation}
      worldLabel="Beach Stickers"
      backgroundColor="#D9F3FF"
    />
  );
}

