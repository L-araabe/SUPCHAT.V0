import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './screens/LoginScreen';

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <View style={{ flex: 1 }}>
        <LoginScreen onSignedIn={setUser} />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Welcome {user?.user?.name || 'User'}!</Text>
      <StatusBar style="auto" />
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
});
