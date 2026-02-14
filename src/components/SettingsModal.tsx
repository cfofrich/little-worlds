import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  onFeedbackPress: () => void;
  onButtonPress?: () => void;
};

const BUILD_SUMMARY_LINES = [
  'Little Worlds current build:',
  '- 5 themed worlds wired (Playground, Beach, Construction, Farm, Space).',
  '- Drag stickers from tray onto scene and drag back anytime to clean up.',
  '- Pinch placed stickers to resize (smaller or larger) while building a scene.',
  '- You can drag stickers back to the tray to remove them without using Clean Up.',
  '- Top utility bar with Home, Clean Up, and Settings.',
  '- Dynamic home background transitions tied to selected world card.',
];

const PRIVACY_POLICY_LINES = [
  'Effective date: February 14, 2026',
  '',
  'Little Worlds is designed for local, private play.',
  '',
  'What we collect right now:',
  '- No account or sign in.',
  '- No analytics or tracking.',
  '- No ads or third-party ad SDKs.',
  '- No location, contacts, photos, camera, or microphone data collection.',
  '',
  'How the app works:',
  '- Stickers, settings, and play interactions run on-device.',
  '- Send Feedback opens your own mail app. If you email us, we only receive what you choose to send.',
  '',
  'Future updates:',
  '- If diagnostics, analytics, or other logging are added in the future, this policy will be updated before release.',
  '- Where required, new data collection features will be clearly disclosed and consented.',
  '',
  'Contact:',
  '- littleworldsapp@proton.me',
];

export default function SettingsModal({
  visible,
  onClose,
  onFeedbackPress,
  onButtonPress,
}: SettingsModalProps) {
  const [showBuildSummary, setShowBuildSummary] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const playButtonSound = () => {
    onButtonPress?.();
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

            <TouchableOpacity style={styles.feedbackButton} onPress={handleFeedbackPress} activeOpacity={0.85}>
              <Text style={styles.feedbackButtonText}>Send Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sectionButton}
              onPress={() => {
                playButtonSound();
                setShowPrivacyPolicy((prev) => !prev);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.sectionButtonText}>{showPrivacyPolicy ? 'Hide Privacy Policy' : 'Privacy Policy'}</Text>
            </TouchableOpacity>

            {showPrivacyPolicy ? (
              <View style={styles.panel}>
                <ScrollView style={styles.summaryScroll} nestedScrollEnabled>
                  {PRIVACY_POLICY_LINES.map((line, index) => (
                    <Text key={`${line}-${index}`} style={styles.panelText}>
                      {line}
                    </Text>
                  ))}
                </ScrollView>
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
