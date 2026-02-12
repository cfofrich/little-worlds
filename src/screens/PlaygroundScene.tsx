import { View, Text, StyleSheet } from 'react-native';

export default function PlaygroundScene() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Playground Scene</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
  },
});
