import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

type StickerVisualProps = {
  size: number;
  name: string;
  color: string;
  imageSource?: ImageSourcePropType;
};

export default function StickerVisual({
  size,
  name,
  color,
  imageSource,
}: StickerVisualProps) {
  if (imageSource) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size * 0.3,
        },
      ]}
    >
      <Text style={styles.text}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});
