import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';

type SettingsModalProps = {
  visible: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClose: () => void;
  onFeedbackPress: () => void;
  onButtonPress?: () => void;
};

const BUILD_SUMMARY_LINES = [
  'Little Worlds current build:',
  '- 5 themed worlds wired (Playground, Beach, Construction, Farm, Space).',
  '- Drag stickers from tray onto scene and drag back anytime to clean up.',
  '- Manual cleanup plays a dedicated sound effect.',
  '- Top utility bar with Home, Clean Up, and Settings.',
  '- Dynamic home background transitions tied to selected world card.',
  '- Credits section for sound attributions.',
];

export default function SettingsModal({
  visible,
  soundEnabled,
  onToggleSound,
  onClose,
  onFeedbackPress,
  onButtonPress,
}: SettingsModalProps) {
  const [showCredits, setShowCredits] = useState(false);
  const [showBuildSummary, setShowBuildSummary] = useState(false);

  const playButtonSound = () => {
    onButtonPress?.();
  };

  const handleLinkPress = (url: string) => {
    playButtonSound();
    void Linking.openURL(url);
  };

  const handleClose = () => {
    playButtonSound();
    onClose();
  };

  const handleFeedbackPress = () => {
    playButtonSound();
    onFeedbackPress();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.modalTitle}>Settings</Text>

            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Sound Effects</Text>
              <Switch
                value={soundEnabled}
                onValueChange={() => {
                  playButtonSound();
                  onToggleSound();
                }}
                trackColor={{ false: '#D1D5DB', true: '#95D5A0' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D5DB"
              />
            </View>

            <TouchableOpacity style={styles.feedbackButton} onPress={handleFeedbackPress} activeOpacity={0.85}>
              <Text style={styles.feedbackButtonText}>Send Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sectionButton}
              onPress={() => {
                playButtonSound();
                setShowCredits((prev) => !prev);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.sectionButtonText}>{showCredits ? 'Hide Credits' : 'Credits'}</Text>
            </TouchableOpacity>

            {showCredits ? (
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Sound Effects:</Text>
                <Text style={styles.panelText}>
                  plop sound effect by Garuda1982 -- https://freesound.org/s/543183/ -- License: Attribution 4.0
                </Text>
                <Text style={styles.panelText}>
                  LevelUp.wav by Kenneth_Cooney -- https://freesound.org/s/609335/ -- License: Creative Commons 0
                </Text>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => handleLinkPress('https://freesound.org/s/543183/')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.linkButtonText}>Open plop source</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => handleLinkPress('https://freesound.org/s/609335/')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.linkButtonText}>Open cleanup source</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.sectionButton}
              onPress={() => {
                playButtonSound();
                setShowBuildSummary((prev) => !prev);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.sectionButtonText}>
                {showBuildSummary ? 'Hide Current Build Summary' : 'Current Build Summary'}
              </Text>
            </TouchableOpacity>

            {showBuildSummary ? (
              <View style={styles.panel}>
                <ScrollView style={styles.summaryScroll} nestedScrollEnabled>
                  {BUILD_SUMMARY_LINES.map((line) => (
                    <Text key={line} style={styles.panelText}>
                      {line}
                    </Text>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <Text style={styles.aboutText}>Made with love for Mason & Emma</Text>
            <Text style={styles.versionText}>Little Worlds v1.0</Text>

            <TouchableOpacity style={styles.doneButton} onPress={handleClose} activeOpacity={0.85}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '82%',
    maxWidth: 560,
    maxHeight: '84%',
    minWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'stretch',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 10,
  },
  settingsLabel: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  feedbackButton: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6BBFFF',
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0284c7',
  },
  sectionButton: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#94a3b8',
    backgroundColor: '#f8fafc',
  },
  sectionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  panel: {
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  panelText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 4,
  },
  summaryScroll: {
    maxHeight: 150,
  },
  linkButton: {
    marginTop: 6,
  },
  linkButtonText: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  doneButton: {
    backgroundColor: '#95D5A0',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  aboutText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
});
