import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import BlankWorldScene from './BlankWorldScene';

type FarmSceneProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Farm'>;
};

export default function FarmScene({ navigation }: FarmSceneProps) {
  return (
    <BlankWorldScene
      navigation={navigation}
      worldLabel="Farm Stickers"
      backgroundColor="#E6F7DA"
    />
  );
}

