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
};

export default function SettingsModal({
  visible,
  soundEnabled,
  onToggleSound,
  onClose,
  onFeedbackPress,
}: SettingsModalProps) {
  const [showCredits, setShowCredits] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalTitle}>Settings</Text>

            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Sound Effects</Text>
              <Switch
                value={soundEnabled}
                onValueChange={onToggleSound}
                trackColor={{ false: '#D1D5DB', true: '#95D5A0' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D5DB"
              />
            </View>

            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={onFeedbackPress}
              activeOpacity={0.8}
            >
              <Text style={styles.feedbackButtonText}>Send Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.creditsButton}
              onPress={() => setShowCredits((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text style={styles.creditsButtonText}>
                {showCredits ? 'Hide Credits' : 'Credits'}
              </Text>
            </TouchableOpacity>

            {showCredits ? (
              <View style={styles.creditsSection}>
                <Text style={styles.creditsTitle}>Credits</Text>
                <Text style={styles.creditsText}>Sound Effects:</Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://freesound.org/s/543183/')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.creditsLink}>
                    plop sound effect by Garuda1982
                  </Text>
                </TouchableOpacity>
                <Text style={styles.creditsText}>
                  https://freesound.org/s/543183/
                </Text>
                <Text style={styles.creditsText}>
                  License: Attribution 4.0
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://freesound.org/s/609335/')}
                  activeOpacity={0.8}
                  style={styles.creditItemSpacing}
                >
                  <Text style={styles.creditsLink}>
                    LevelUp.wav by Kenneth_Cooney
                  </Text>
                </TouchableOpacity>
                <Text style={styles.creditsText}>
                  https://freesound.org/s/609335/
                </Text>
                <Text style={styles.creditsText}>
                  License: Creative Commons 0
                </Text>
              </View>
            ) : null}

            <Text style={styles.aboutText}>Made with love for Mason & Emma</Text>
            <Text style={styles.versionText}>Little Worlds v1.0</Text>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
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
    padding: 24,
    width: '80%',
    maxWidth: 420,
    minWidth: 300,
    alignItems: 'stretch',
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
    alignItems: 'center',
    paddingBottom: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 8,
  },
  settingsLabel: {
    fontSize: 18,
    color: '#333',
  },
  feedbackButton: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6BBFFF',
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6BBFFF',
  },
  creditsButton: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A78BFA',
  },
  creditsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  creditsSection: {
    width: '100%',
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  creditsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  creditsText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  creditsLink: {
    fontSize: 13,
    color: '#2563EB',
    textDecorationLine: 'underline',
    marginBottom: 2,
  },
  creditItemSpacing: {
    marginTop: 8,
  },
  doneButton: {
    backgroundColor: '#95D5A0',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 18,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  aboutText: {
    fontSize: 15,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  versionText: {
    fontSize: 13,
    color: '#BBB',
    marginTop: 4,
  },
});
