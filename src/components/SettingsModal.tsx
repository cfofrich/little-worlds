import { Modal, Pressable, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
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

          <Text style={styles.aboutText}>Made with love for Mason & Emma</Text>
          <Text style={styles.versionText}>Little Worlds v1.0</Text>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
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
