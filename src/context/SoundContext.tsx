import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { InteractionManager } from 'react-native';

type SoundContextType = {
  soundEnabled: boolean;
  toggleSound: () => void;
  preloadSounds: () => Promise<void>;
  playIfEnabled: (playFn: () => void | Promise<void>) => Promise<void>;
  playPlop: () => Promise<void>;
  playCleanup: () => Promise<void>;
};

const SoundContext = createContext<SoundContextType>({
  soundEnabled: true,
  toggleSound: () => {},
  preloadSounds: async () => {},
  playIfEnabled: async () => {},
  playPlop: async () => {},
  playCleanup: async () => {},
});

type LoadedAudio = {
  Audio: any;
  plopSound: any;
  cleanupSound: any;
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const loadedAudioRef = useRef<LoadedAudio | null>(null);
  const loadingPromiseRef = useRef<Promise<void> | null>(null);

  const ensureSoundsLoaded = async () => {
    if (loadedAudioRef.current) {
      return;
    }

    if (loadingPromiseRef.current) {
      await loadingPromiseRef.current;
      return;
    }

    loadingPromiseRef.current = (async () => {
      try {
        const expoAv = require('expo-av');
        const Audio = expoAv?.Audio;
        if (!Audio?.Sound) {
          return;
        }

        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const plopSound = new Audio.Sound();
        await plopSound.loadAsync(
          require('../../assets/sounds/stickerplacement.wav'),
          { shouldPlay: false },
          true
        );

        const cleanupSound = new Audio.Sound();
        await cleanupSound.loadAsync(
          require('../../assets/sounds/stickercleanup.wav'),
          { shouldPlay: false },
          true
        );

        loadedAudioRef.current = {
          Audio,
          plopSound,
          cleanupSound,
        };
      } catch {
        // Non-blocking fallback when audio cannot initialize.
      } finally {
        loadingPromiseRef.current = null;
      }
    })();

    await loadingPromiseRef.current;
  };

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      void ensureSoundsLoaded();
    });
    const timer = setTimeout(() => {
      void ensureSoundsLoaded();
    }, 900);

    return () => {
      task.cancel();
      clearTimeout(timer);
      const loadedAudio = loadedAudioRef.current;
      loadedAudioRef.current = null;
      if (!loadedAudio) {
        return;
      }

      if (loadedAudio.plopSound?.unloadAsync) {
        void loadedAudio.plopSound.unloadAsync().catch(() => {});
      }

      if (loadedAudio.cleanupSound?.unloadAsync) {
        void loadedAudio.cleanupSound.unloadAsync().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (soundEnabled) {
      return;
    }

    const loadedAudio = loadedAudioRef.current;
    if (!loadedAudio) {
      return;
    }

    [loadedAudio.plopSound, loadedAudio.cleanupSound].forEach((sound) => {
      if (!sound?.stopAsync || !sound?.setPositionAsync) {
        return;
      }
      void sound.stopAsync().catch(() => {});
      void sound.setPositionAsync(0).catch(() => {});
    });
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const playIfEnabled = async (playFn: () => void | Promise<void>) => {
    if (!soundEnabled) {
      return;
    }

    await playFn();
  };

  const playSound = async (type: 'plop' | 'cleanup') => {
    if (!soundEnabled) {
      return;
    }

    if (!loadedAudioRef.current) {
      void ensureSoundsLoaded();
      return;
    }

    const loadedAudio = loadedAudioRef.current;
    const sound = type === 'plop' ? loadedAudio?.plopSound : loadedAudio?.cleanupSound;

    if (!sound) {
      return;
    }

    if (sound.replayAsync) {
      void sound.replayAsync().catch(() => {});
      return;
    }

    if (sound.playFromPositionAsync) {
      void sound.playFromPositionAsync(0).catch(() => {});
    }
  };

  const playPlop = async () => {
    await playSound('plop');
  };

  const playCleanup = async () => {
    await playSound('cleanup');
  };

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        preloadSounds: ensureSoundsLoaded,
        playIfEnabled,
        playPlop,
        playCleanup,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);
