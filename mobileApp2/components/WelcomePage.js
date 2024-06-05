//ibm-ai-pet/mobileApp2/components/WelcomePage.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';
import BlankPage from './BlankPage';

export default function WelcomePage({ navigation, route }) {
  const { userID } = route.params;
  const [showBlankPage, setShowBlankPage] = useState(false);
  const [location, setLocation] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);

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
  
    try {
      await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: userID, // Use userID from route params
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }),
      });
    } catch (err) {
      console.error('Error sending location to server:', err);
    }
  };

  const handleGetContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access contacts was denied');
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    if (data.length > 0) {
      setContacts(data.slice(0, 2));
      // Send contacts to server
      data.slice(0, 2).forEach(async (contact) => {
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          try {
            await fetch('http://localhost:5000/comms', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userID: userID, // Use userID from route params
                recipientName: contact.name,
                recipientPhoneNumber: contact.phoneNumbers[0].number,
              }),
            });
          } catch (err) {
            console.error('Error sending contact to server:', err);
          }
        }
      });
    } else {
      Alert.alert('No contacts found');
    }
  };

  const handleGetEvents = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access calendar was denied');
      return;
    }
  
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    if (calendars.length > 0) {
      const calendarId = calendars[0].id;
      const events = await Calendar.getEventsAsync([calendarId], new Date(), new Date(new Date().setDate(new Date().getDate() + 30)));
      setEvents(events.slice(0, 2));
      
      // Send events to the server
      events.slice(0, 2).forEach(async (event) => {
        try {
          await fetch('http://localhost:5000/calendar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userID: userID, // Use userID from route params
              activityType: 'Other', // Assuming 'Event' is a valid type, adjust as needed
              activityName: event.title,
              startDate: event.startDate,
              endDate: event.endDate,
            }),
          });
        } catch (err) {
          console.error('Error sending event to server:', err);
        }
      });
    } else {
      Alert.alert('No calendars found');
    }
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
          <Button title="Get Contacts" onPress={handleGetContacts} />
          {contacts.map((contact, index) => (
            <View key={index}>
              <Text>{contact.name}</Text>
              {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
                <Text>{contact.phoneNumbers[0].number}</Text>
              )}
            </View>
          ))}
          <Button title="Get Calendar Events" onPress={handleGetEvents} />
          {events.map((event, index) => (
            <View key={index}>
              <Text>{event.title}</Text>
              <Text>{new Date(event.startDate).toLocaleString()}</Text>
              <Text>{new Date(event.endDate).toLocaleString()}</Text>
            </View>
          ))}
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