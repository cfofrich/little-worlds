import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type SceneItem = {
  id: string;
  name: string;
  color: string;
  imageSource?: ImageSourcePropType;
  titleImageSource?: ImageSourcePropType;
};

type SceneCarouselProps = {
  scenes: SceneItem[];
  centeredIndex: number;
  onCenteredIndexChange: (index: number) => void;
  onPreviewIndexChange?: (index: number) => void;
  onCardPress: (index: number, sceneId: string) => void;
  cardWidth: number;
  cardHeight: number;
  snapInterval: number;
  paddingHorizontal: number;
  spacing: number;
  titleImageWidth?: number;
  titleImageHeight?: number;
  titleOffsetY?: number;
};

export default function SceneCarousel({
  scenes,
  centeredIndex,
  onCenteredIndexChange,
  onPreviewIndexChange,
  onCardPress,
  cardWidth,
  cardHeight,
  snapInterval,
  paddingHorizontal,
  spacing,
  titleImageWidth = 220,
  titleImageHeight = 66,
  titleOffsetY = 0,
}: SceneCarouselProps) {
  const flatListRef = useRef<Animated.FlatList<SceneItem> | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const lastReportedIndexRef = useRef(centeredIndex);
  const lastPreviewIndexRef = useRef(centeredIndex);

  useEffect(() => {
    pulseAnim.setValue(0);
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.03,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 360,
        useNativeDriver: true,
      }),
    ]).start();
  }, [centeredIndex, pulseAnim]);

  useEffect(() => {
    lastReportedIndexRef.current = centeredIndex;
    lastPreviewIndexRef.current = centeredIndex;
  }, [centeredIndex]);

  const reportCenteredIndexFromOffset = (offsetX: number) => {
    const maxIndex = Math.max(0, scenes.length - 1);
    const nextIndex = Math.max(0, Math.min(maxIndex, Math.round(offsetX / snapInterval)));

    if (nextIndex === lastReportedIndexRef.current) {
      return;
    }

    lastReportedIndexRef.current = nextIndex;
    onCenteredIndexChange(nextIndex);
  };

  const getNearestIndexFromOffset = (offsetX: number) => {
    const maxIndex = Math.max(0, scenes.length - 1);
    return Math.max(0, Math.min(maxIndex, Math.round(offsetX / snapInterval)));
  };

  const scrollToOffsetSafe = (offset: number, animated: boolean) => {
    const list = flatListRef.current as
      | (Animated.FlatList<SceneItem> & { scrollToOffset?: (params: { offset: number; animated: boolean }) => void; getNode?: () => { scrollToOffset: (params: { offset: number; animated: boolean }) => void } })
      | null;

    if (!list) {
      return;
    }

    if (typeof list.scrollToOffset === 'function') {
      list.scrollToOffset({ offset, animated });
      return;
    }

    if (typeof list.getNode === 'function') {
      list.getNode().scrollToOffset({ offset, animated });
    }
  };

  const snapToNearestOffset = (offsetX: number, animated: boolean) => {
    const nearestIndex = getNearestIndexFromOffset(offsetX);
    const snappedOffset = nearestIndex * snapInterval;

    reportPreviewIndexFromOffset(snappedOffset);
    reportCenteredIndexFromOffset(snappedOffset);

    if (Math.abs(offsetX - snappedOffset) > 0.5) {
      scrollToOffsetSafe(snappedOffset, animated);
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapToNearestOffset(event.nativeEvent.contentOffset.x, false);
  };

  const reportPreviewIndexFromOffset = (offsetX: number) => {
    if (!onPreviewIndexChange) {
      return;
    }

    const maxIndex = Math.max(0, scenes.length - 1);
    const nextIndex = Math.max(0, Math.min(maxIndex, Math.round(offsetX / snapInterval)));

    if (nextIndex === lastPreviewIndexRef.current) {
      return;
    }

    lastPreviewIndexRef.current = nextIndex;
    onPreviewIndexChange(nextIndex);
  };

  const handleScrollBeginDrag = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(0);
  };

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocityX = Math.abs(event.nativeEvent.velocity?.x ?? 0);
    if (velocityX < 0.15) {
      snapToNearestOffset(event.nativeEvent.contentOffset.x, true);
    }
  };

  const renderCard = ({ item, index }: { item: SceneItem; index: number }) => {
    const inputRange = [
      (index - 1) * snapInterval,
      index * snapInterval,
      (index + 1) * snapInterval,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const finalScale = index === centeredIndex ? Animated.add(scale, pulseAnim) : scale;

    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => onCardPress(index, item.id)}>
        <View style={[styles.cardContainer, { width: cardWidth }]}>
          <Animated.View
            style={[
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
                transform: [{ scale: finalScale }],
                opacity,
              },
            ]}
          >
            {item.imageSource ? (
              <ImageBackground
                source={item.imageSource}
                style={styles.cardImage}
                imageStyle={styles.cardImageInner}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.cardImage, styles.cardImageInner, { backgroundColor: item.color }]}>
                <Text style={styles.cardFallbackText}>{item.name}</Text>
              </View>
            )}
          </Animated.View>
          <View
            style={[
              styles.cardTitleContainer,
              {
                width: titleImageWidth,
                height: titleImageHeight,
                transform: [{ translateY: titleOffsetY }],
              },
            ]}
          >
            {item.titleImageSource ? (
              <Image source={item.titleImageSource} style={styles.cardTitleImage} resizeMode="contain" />
            ) : (
              <Text style={styles.cardText}>{item.name}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.FlatList
      ref={flatListRef}
      data={scenes}
      renderItem={renderCard}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.listContent, { paddingHorizontal }]}
      style={styles.list}
      removeClippedSubviews={false}
      snapToInterval={snapInterval}
      snapToAlignment="start"
      disableIntervalMomentum
      decelerationRate="fast"
      bounces={false}
      alwaysBounceHorizontal={false}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: true,
        listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          reportPreviewIndexFromOffset(event.nativeEvent.contentOffset.x);
        },
      })}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      scrollEventThrottle={16}
      ItemSeparatorComponent={() => <View style={{ width: spacing }} />}
      extraData={centeredIndex}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    overflow: 'visible',
  },
  listContent: {
    paddingHorizontal: 0,
    paddingTop: 18,
    paddingBottom: 0,
  },
  cardContainer: {
    alignItems: 'center',
    paddingTop: 0,
    overflow: 'visible',
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitleContainer: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleImage: {
    width: '100%',
    height: '100%',
  },
  cardText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#184F42',
  },
  cardFallbackText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardImageInner: {
    borderRadius: 24,
  },
});
