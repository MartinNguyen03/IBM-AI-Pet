// components/WelcomePage.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import BlankPage from './BlankPage';

export default function WelcomePage({ navigation }) {
  const [showBlankPage, setShowBlankPage] = useState(false);
  const [location, setLocation] = useState(null);

  const handleLogout = () => {
    Alert.alert('Logout', 'You have been logged out.');
    
    navigation.navigate('Login');
  };

  const goToBlankPage = () => {
    setShowBlankPage(true);
  };

  const goBack = () => {
    setShowBlankPage(false);
  };

  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

  return (
    <>
      {!showBlankPage && (
        <View style={styles.container}>
          <Text style={styles.title}>Welcome, Ana!</Text>
          <Text>You are now logged in.</Text>
          <Button title="Go to Blank Page" onPress={goToBlankPage} />
          <Button title="Get Location" onPress={handleGetLocation} />
          {location && (
            <Text>
              Your location is {location.latitude}, {location.longitude}
            </Text>
          )}
          <Button title="Logout" onPress={handleLogout} />
        </View>
      )}
      {showBlankPage && <BlankPage onBack={goBack} />}
    </>
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
