import { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import PlaygroundScene from './src/screens/PlaygroundScene';
import BeachScene from './src/screens/BeachScene';
import ConstructionScene from './src/screens/ConstructionScene';
import FarmScene from './src/screens/FarmScene';
import SpaceScene from './src/screens/SpaceScene';
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

const PRELOAD_IMAGE_CONCURRENCY = 4;

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
}: {
  loadedCount: number;
  totalCount: number;
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
    </View>
  );
}

function AppBootstrap() {
  const [imagesReady, setImagesReady] = useState(false);
  const [loadedAssetCount, setLoadedAssetCount] = useState(0);

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
      console.info(`[bootstrap] starting preload of ${preloadAssets.length} unique images`);
    }

    const preloadAll = async () => {
      try {
        const preloadImagesTask = async () => {
          if (!preloadAssets.length) {
            if (active) {
              setLoadedAssetCount(0);
              setImagesReady(true);
            }
            return;
          }

          const queue = [...preloadAssets];
          let completed = 0;
          const workerCount = Math.max(1, Math.min(PRELOAD_IMAGE_CONCURRENCY, queue.length));

          const worker = async () => {
            while (active) {
              const asset = queue.shift();
              if (!asset) {
                return;
              }

              await preloadImageSource(asset.source);
              completed += 1;

              if (active) {
                setLoadedAssetCount(completed);
                if (__DEV__ && (completed === preloadAssets.length || completed % 10 === 0)) {
                  console.info(`[bootstrap] image assets loaded ${completed}/${preloadAssets.length}`);
                }
              }
            }
          };

          await Promise.all(Array.from({ length: workerCount }, () => worker()));
          if (active) {
            setImagesReady(true);
          }
        };

        await preloadImagesTask();
      } catch {
        if (active) {
          setImagesReady(true);
        }
      }
    };

    void preloadAll();

    return () => {
      active = false;
    };
  }, [preloadAssets]);

  const isReady = imagesReady;

  if (!isReady) {
    return (
      <View style={styles.bootstrapRoot}>
        <LoadingScreen
          loadedCount={loadedAssetCount}
          totalCount={preloadAssets.length}
        />
      </View>
    );
  }

  return (
    <View style={styles.bootstrapRoot}>
      <AppNavigator />
    </View>
  );
}

export default function App() {
  return <AppBootstrap />;
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
});
