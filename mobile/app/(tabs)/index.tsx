import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function HomeScreen() {
  const [count, setCount] = useState(0);

  return (
      <View style={styles.container}>
        <Text style={styles.title}>React Native スタート！</Text>
        <Text style={styles.counter}>{count}</Text>

        <TouchableOpacity
            style={styles.button}
            onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>カウントアップ</Text>
        </TouchableOpacity>

        <TouchableOpacity
            onPress={() => Alert.alert('お疲れ様です！', '順調ですね。')}
        >
          <Text style={styles.link}>ここをタップ</Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  counter: {
    fontSize: 60,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    color: '#007AFF',
    marginTop: 10,
  },
});