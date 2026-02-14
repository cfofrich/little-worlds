import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import PlaygroundScene from './src/screens/PlaygroundScene';
import BeachScene from './src/screens/BeachScene';
import ConstructionScene from './src/screens/ConstructionScene';
import FarmScene from './src/screens/FarmScene';
import SpaceScene from './src/screens/SpaceScene';
import { SoundProvider, useSound } from './src/context/SoundContext';
import { getWorldConfig, WORLD_ORDER } from './src/data/worlds';

export type RootStackParamList = {
  Home: undefined;
  Playground: undefined;
  Beach: undefined;
  Construction: undefined;
  Farm: undefined;
  Space: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const STATIC_IMAGE_ASSETS: ImageSourcePropType[] = [
  require('./assets/icon.png'),
  require('./assets/splash-icon.png'),
  require('./assets/adaptive-icon.png'),
  require('./assets/favicon.png'),
  require('./assets/backgrounds/littleworldstitle.png'),
  require('./assets/backgrounds/stickertray.png'),
  require('./assets/enhanceduibuttons/homebutton.png'),
  require('./assets/enhanceduibuttons/cleanup.png'),
];

type PreloadAsset = {
  key: string;
  source: ImageSourcePropType;
};

function buildPreloadAssetList(sources: ImageSourcePropType[]): PreloadAsset[] {
  const unique = new Map<string, ImageSourcePropType>();

  const addSource = (source: ImageSourcePropType | undefined) => {
    if (!source) {
      return;
    }

    if (Array.isArray(source)) {
      source.forEach((item) => addSource(item));
      return;
    }

    const resolved = Image.resolveAssetSource(source);
    const key =
      resolved?.uri ??
      (typeof source === 'number' ? `module:${source}` : `source:${JSON.stringify(source)}`);

    if (!unique.has(key)) {
      unique.set(key, source);
    }
  };

  sources.forEach(addSource);
  return Array.from(unique.entries()).map(([key, source]) => ({ key, source }));
}

async function preloadImageSource(source: ImageSourcePropType) {
  if (Array.isArray(source)) {
    await Promise.all(source.map((item) => preloadImageSource(item)));
    return;
  }

  const resolved = Image.resolveAssetSource(source);
  if (!resolved?.uri) {
    return;
  }

  await Image.prefetch(resolved.uri).catch(() => {});
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="Playground"
          component={PlaygroundScene}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Beach"
          component={BeachScene}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Construction"
          component={ConstructionScene}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Farm"
          component={FarmScene}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Space"
          component={SpaceScene}
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function LoadingScreen({
  loadedCount,
  totalCount,
  soundsReady,
}: {
  loadedCount: number;
  totalCount: number;
  soundsReady: boolean;
}) {
  const pct = totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 100;

  return (
    <View style={styles.loadingScreen}>
      <Image source={require('./assets/icon.png')} style={styles.loadingIcon} resizeMode="cover" />
      <Image
        source={require('./assets/backgrounds/littleworldstitle.png')}
        style={styles.loadingTitle}
        resizeMode="contain"
      />
      <Text style={styles.loadingText}>Loading Little Worlds...</Text>
      <Text style={styles.loadingSubtext}>{`Assets ${loadedCount}/${totalCount} (${pct}%)`}</Text>
      <Text style={styles.loadingSubtext}>{soundsReady ? 'Sounds ready' : 'Loading sounds...'}</Text>
    </View>
  );
}

function AppBootstrap() {
  const { preloadSounds } = useSound();
  const [isReady, setIsReady] = useState(false);
  const [soundsReady, setSoundsReady] = useState(false);
  const [loadedAssetCount, setLoadedAssetCount] = useState(0);
  const loadedKeysRef = useRef<Set<string>>(new Set());

  const preloadAssets = useMemo(() => {
    const worldSources = WORLD_ORDER.flatMap((worldId) => {
      const world = getWorldConfig(worldId);
      return [
        world.worldBackgroundSource,
        world.homeBackgroundSource,
        world.titleImageSource,
        ...world.stickers
          .map((sticker) => sticker.imageSource)
          .filter((source): source is ImageSourcePropType => Boolean(source)),
      ];
    });

    return buildPreloadAssetList([...STATIC_IMAGE_ASSETS, ...worldSources]);
  }, []);

  useEffect(() => {
    let active = true;

    if (__DEV__) {
      console.info(`[bootstrap] starting preload of ${preloadAssets.length} unique images + sounds`);
    }

    const preload = async () => {
      try {
        await preloadSounds();
        if (active) {
          setSoundsReady(true);
          if (__DEV__) {
            console.info('[bootstrap] sounds loaded');
          }
        }
      } catch {
        if (active) {
          setSoundsReady(true);
        }
      }
    };

    void preload();

    // Start a parallel prefetch pass to warm source caches before decode-keeping layer completes.
    void Promise.all(preloadAssets.map((asset) => preloadImageSource(asset.source))).catch(() => {});

    return () => {
      active = false;
    };
  }, [preloadAssets, preloadSounds]);

  const markAssetLoaded = useCallback(
    (key: string) => {
      if (loadedKeysRef.current.has(key)) {
        return;
      }

      loadedKeysRef.current.add(key);
      const next = loadedKeysRef.current.size;
      setLoadedAssetCount(next);

      if (__DEV__ && (next === preloadAssets.length || next % 10 === 0)) {
        console.info(`[bootstrap] image assets loaded ${next}/${preloadAssets.length}`);
      }
    },
    [preloadAssets.length]
  );

  useEffect(() => {
    if (isReady) {
      return;
    }

    if (!soundsReady || loadedAssetCount < preloadAssets.length) {
      return;
    }

    if (__DEV__) {
      console.info('[bootstrap] all assets ready, mounting app');
    }
    setIsReady(true);
  }, [isReady, loadedAssetCount, preloadAssets.length, soundsReady]);

  const imageCacheLayer = (
    <View pointerEvents="none" style={styles.assetCacheLayer}>
      {preloadAssets.map((asset) => (
        <Image
          key={`cache-${asset.key}`}
          source={asset.source}
          style={styles.assetCacheImage}
          resizeMode="cover"
          fadeDuration={0}
          onLoadEnd={() => markAssetLoaded(asset.key)}
          onError={() => markAssetLoaded(asset.key)}
        />
      ))}
    </View>
  );

  if (!isReady) {
    return (
      <View style={styles.bootstrapRoot}>
        {imageCacheLayer}
        <LoadingScreen
          loadedCount={loadedAssetCount}
          totalCount={preloadAssets.length}
          soundsReady={soundsReady}
        />
      </View>
    );
  }

  return (
    <View style={styles.bootstrapRoot}>
      {imageCacheLayer}
      <AppNavigator />
    </View>
  );
}

export default function App() {
  return (
    <SoundProvider>
      <AppBootstrap />
    </SoundProvider>
  );
}

const styles = StyleSheet.create({
  bootstrapRoot: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#EAF7FF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 24,
  },
  loadingIcon: {
    width: 180,
    height: 180,
    borderRadius: 36,
  },
  loadingTitle: {
    width: 320,
    height: 130,
  },
  loadingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E6A7A',
  },
  loadingSubtext: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B6F7E',
  },
  assetCacheLayer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  assetCacheImage: {
    width: 1,
    height: 1,
  },
});
