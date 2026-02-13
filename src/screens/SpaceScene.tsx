import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import BlankWorldScene from './BlankWorldScene';

type SpaceSceneProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Space'>;
};

export default function SpaceScene({ navigation }: SpaceSceneProps) {
  return (
    <BlankWorldScene
      navigation={navigation}
      worldLabel="Space Stickers"
      backgroundColor="#E7E5FF"
    />
  );
}

