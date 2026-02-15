import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
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
  '- 6 themed worlds wired (Playground, Beach, Construction, Farm, Space, Zoo).',
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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [showBuildSummary, setShowBuildSummary] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const isPhoneLandscape = screenWidth < 1024;

  const modalCardDynamicStyle = isPhoneLandscape
    ? {
        width: Math.min(screenWidth - 22, 460),
        maxHeight: Math.round(screenHeight * 0.74),
        borderRadius: 20,
      }
    : null;

  const scrollContentDynamicStyle = isPhoneLandscape
    ? {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
      }
    : null;

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

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.modalOverlay, isPhoneLandscape && styles.modalOverlayPhone]}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={[styles.modalCard, modalCardDynamicStyle]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, scrollContentDynamicStyle]}>
          <Text style={[styles.modalTitle, isPhoneLandscape && styles.modalTitlePhone]}>Settings</Text>

          <TouchableOpacity
            style={[styles.feedbackButton, isPhoneLandscape && styles.feedbackButtonPhone]}
            onPress={handleFeedbackPress}
            activeOpacity={0.85}
          >
            <Text style={[styles.feedbackButtonText, isPhoneLandscape && styles.feedbackButtonTextPhone]}>Send Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sectionButton, isPhoneLandscape && styles.sectionButtonPhone]}
            onPress={() => {
              playButtonSound();
              setShowPrivacyPolicy((prev) => !prev);
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.sectionButtonText, isPhoneLandscape && styles.sectionButtonTextPhone]}>
              {showPrivacyPolicy ? 'Hide Privacy Policy' : 'Privacy Policy'}
            </Text>
          </TouchableOpacity>

          {showPrivacyPolicy ? (
            <View style={styles.panel}>
              {PRIVACY_POLICY_LINES.map((line, index) => (
                <Text key={`${line}-${index}`} style={[styles.panelText, isPhoneLandscape && styles.panelTextPhone]}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.sectionButton, isPhoneLandscape && styles.sectionButtonPhone]}
            onPress={() => {
              playButtonSound();
              setShowBuildSummary((prev) => !prev);
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.sectionButtonText, isPhoneLandscape && styles.sectionButtonTextPhone]}>
              {showBuildSummary ? 'Hide Current Build Summary' : 'Current Build Summary'}
            </Text>
          </TouchableOpacity>

          {showBuildSummary ? (
            <View style={styles.panel}>
              {BUILD_SUMMARY_LINES.map((line) => (
                <Text key={line} style={[styles.panelText, isPhoneLandscape && styles.panelTextPhone]}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null}

          <Text style={[styles.aboutText, isPhoneLandscape && styles.aboutTextPhone]}>Made with love for Mason & Emma</Text>
          <Text style={[styles.versionText, isPhoneLandscape && styles.versionTextPhone]}>Little Worlds v1.0</Text>

          <TouchableOpacity style={[styles.doneButton, isPhoneLandscape && styles.doneButtonPhone]} onPress={handleClose} activeOpacity={0.85}>
            <Text style={[styles.doneButtonText, isPhoneLandscape && styles.doneButtonTextPhone]}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalOverlayPhone: {
    paddingHorizontal: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '90%',
    maxWidth: 560,
    maxHeight: '86%',
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
  modalTitlePhone: {
    fontSize: 20,
    marginBottom: 12,
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
  feedbackButtonPhone: {
    paddingVertical: 10,
    marginTop: 4,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0284c7',
  },
  feedbackButtonTextPhone: {
    fontSize: 14,
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
  sectionButtonPhone: {
    paddingVertical: 10,
    marginTop: 8,
  },
  sectionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  sectionButtonTextPhone: {
    fontSize: 13,
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
  panelTextPhone: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 3,
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
  doneButtonPhone: {
    marginTop: 12,
    paddingVertical: 11,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  doneButtonTextPhone: {
    fontSize: 16,
  },
  aboutText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
  aboutTextPhone: {
    marginTop: 12,
    fontSize: 13,
  },
  versionText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  versionTextPhone: {
    fontSize: 11,
  },
});
