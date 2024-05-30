import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function BlankPage({ onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is a blank page!</Text>
      <Text>Feel free to add content here.</Text>
      <Button title="Go Back" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

