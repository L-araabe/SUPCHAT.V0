import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ChatListScreen from './screens/ChatListScreen';

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('login');

  if (!user) {
    return (
      <View style={{ flex: 1 }}>
        {screen === 'login' ? (
          <LoginScreen onSignedIn={setUser} onSwitchToSignup={() => setScreen('signup')} />
        ) : (
          <SignupScreen onSignedUp={() => setScreen('login')} onSwitchToLogin={() => setScreen('login')} />
        )}
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ChatListScreen user={user} />
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
