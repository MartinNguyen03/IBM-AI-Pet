import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LoginForm from './components/LoginForm';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <LoginForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
