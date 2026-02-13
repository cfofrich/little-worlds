import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { InteractionManager } from 'react-native';

type SoundContextType = {
  soundEnabled: boolean;
  toggleSound: () => void;
  playIfEnabled: (playFn: () => void | Promise<void>) => Promise<void>;
  playPlop: () => Promise<void>;
  playCleanup: () => Promise<void>;
};

const SoundContext = createContext<SoundContextType>({
  soundEnabled: true,
  toggleSound: () => {},
  playIfEnabled: async () => {},
  playPlop: async () => {},
  playCleanup: async () => {},
});

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const plopSoundRef = useRef<any>(null);
  const cleanupSoundRef = useRef<any>(null);
  const loadingPromiseRef = useRef<Promise<void> | null>(null);
  const loadedRef = useRef(false);

  const ensureSoundsLoaded = async () => {
    if (loadedRef.current) {
      return;
    }
    if (loadingPromiseRef.current) {
      await loadingPromiseRef.current;
      return;
    }

    loadingPromiseRef.current = (async () => {
      try {
        const expoAv = require('expo-av');
        if (!expoAv?.Audio?.Sound) {
          return;
        }

        // Configure audio mode once for reliable effects playback.
        await expoAv.Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const plopSound = new expoAv.Audio.Sound();
        await plopSound.loadAsync(
          require('../../assets/sounds/stickerplacement.wav'),
          { shouldPlay: false },
          true
        );

        const cleanupSound = new expoAv.Audio.Sound();
        await cleanupSound.loadAsync(
          require('../../assets/sounds/stickercleanup.wav'),
          { shouldPlay: false },
          true
        );

        plopSoundRef.current = plopSound;
        cleanupSoundRef.current = cleanupSound;
        loadedRef.current = true;
      } catch {
        // Non-blocking fallback when audio module is unavailable.
      } finally {
        loadingPromiseRef.current = null;
      }
    })();

    await loadingPromiseRef.current;
  };

  useEffect(() => {
    return () => {
      const plopSound = plopSoundRef.current;
      const cleanupSound = cleanupSoundRef.current;
      plopSoundRef.current = null;
      cleanupSoundRef.current = null;
      if (plopSound?.unloadAsync) {
        void plopSound.unloadAsync().catch(() => {});
      }
      if (cleanupSound?.unloadAsync) {
        void cleanupSound.unloadAsync().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!soundEnabled || loadedRef.current) {
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      void ensureSoundsLoaded();
    });

    return () => {
      task.cancel();
    };
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

  const playPlop = async () => {
    if (!loadedRef.current) {
      void ensureSoundsLoaded();
      return;
    }
    const sound = plopSoundRef.current;
    if (!sound?.playFromPositionAsync) {
      return;
    }

    await playIfEnabled(() => sound.playFromPositionAsync(0));
  };

  const playCleanup = async () => {
    if (!loadedRef.current) {
      void ensureSoundsLoaded();
      return;
    }
    const sound = cleanupSoundRef.current;
    if (!sound?.playFromPositionAsync) {
      return;
    }

    await playIfEnabled(() => sound.playFromPositionAsync(0));
  };

  useEffect(() => {
    if (soundEnabled) {
      return;
    }

    [plopSoundRef.current, cleanupSoundRef.current].forEach((sound) => {
      if (!sound?.stopAsync || !sound?.setPositionAsync) {
        return;
      }
      void sound.stopAsync().catch(() => {});
      void sound.setPositionAsync(0).catch(() => {});
    });
  }, [soundEnabled]);

  return (
    <SoundContext.Provider
      value={{ soundEnabled, toggleSound, playIfEnabled, playPlop, playCleanup }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);
