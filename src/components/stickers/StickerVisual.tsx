import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

type StickerVisualProps = {
  size: number;
  name: string;
  color: string;
  imageSource?: ImageSourcePropType;
  imageScale?: number;
  imageOffsetY?: number;
};

export default function StickerVisual({
  size,
  name,
  color,
  imageSource,
  imageScale = 1,
  imageOffsetY = 0,
}: StickerVisualProps) {
  if (imageSource) {
    const defaultImageSource = Array.isArray(imageSource) ? imageSource[0] : imageSource;

    return (
      <View style={[styles.imageShell, { width: size, height: size }]}>
        <Image
          source={imageSource}
          defaultSource={defaultImageSource}
          fadeDuration={0}
          style={[
            styles.image,
            {
              transform: [{ scale: imageScale }, { translateY: imageOffsetY }],
            },
          ]}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fallbackShell,
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
  imageShell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'visible',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackShell: {
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
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});
