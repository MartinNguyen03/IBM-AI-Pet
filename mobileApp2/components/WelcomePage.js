//ibm-ai-pet/mobileApp2/components/WelcomePage.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';
import BlankPage from './BlankPage';

export default function WelcomePage({ navigation, route }) {
  const { userID, username } = route.params;
  const [showBlankPage, setShowBlankPage] = useState(false);
  const [location, setLocation] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventsServer, setEventsServer] = useState([]);
  const [previousEvents, setPreviousEvents] = useState([]);
  const [previousEventsServer, setPreviousEventsServer] = useState([]);

  const fetchContactsFromServer = async () => {
    try {
      const response = await fetch(`http://localhost:5001/comms/${userID}`);
      const serverContacts = await response.json();

      const { data: deviceContacts } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      const newContacts = serverContacts.filter(serverContact =>
        !deviceContacts.some(deviceContact =>
          deviceContact.name === serverContact.recipientName 
          
        )
      );

      if (newContacts.length > 0) {
        for (const contact of newContacts) {
          const contactData = {
            [Contacts.Fields.FirstName]: contact.recipientName,
            [Contacts.Fields.PhoneNumbers]: [{ number: contact.recipientPhoneNumber }],
          };

          // Add the console log here to debug
          console.log('Adding contact:', contactData);

          await Contacts.addContactAsync(contactData);
        }
        Alert.alert('New contacts have been added to your device.');
      }
    } catch (error) {
      console.error('Error fetching contacts from server:', error);
    }
  };

  useEffect(() => {
    fetchContactsFromServer();
  }, [userID]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchContactsFromServer();
    }, 3000); // 3000 milliseconds = 3 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [userID]);

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
      await fetch('http://localhost:5001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: userID,
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
      setContacts(data);
      // Send all contacts to the server
      data.forEach(async (contact) => {
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          try {
            await fetch('http://localhost:5001/comms', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userID: userID,
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
      //Alert.alert('No contacts found');
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleGetContacts();
    }, 3000); // 3000 milliseconds = 3 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  const handleGetEvents = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access calendar was denied');
      return;
    }
  
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    if (calendars.length > 0) {
      const calendarId = calendars[0].id;
      const events = await Calendar.getEventsAsync(
        [calendarId],
        new Date(),
        new Date(new Date().setDate(new Date().getDate() + 60))
      );
      setEvents(events);
  
      // Send events to the server
      events.forEach(async (event) => {
        try {
          await fetch('http://localhost:5001/calendar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userID: userID,
              eventId: event.id, // Include eventId here
              activityType: 'Other',
              activityName: event.title,
              startDate: event.startDate,
              endDate: event.endDate,
              notes: event.notes || ' ', // Include notes field here
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
  
  const fetchAndUpdateEvents = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access calendar was denied');
      return;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    if (calendars.length > 0) {
      const calendarId = calendars[0].id;
      const events = await Calendar.getEventsAsync([calendarId], new Date(), new Date(new Date().setDate(new Date().getDate() + 30)));
      
      // Compare with previous events
      const oldnewEvents = events.filter(event => !previousEvents.some(prevEvent => prevEvent.id === event.id));
      const newEvents = oldnewEvents.filter(event => event.notes !== 'S')
      const deletedEvents = previousEvents.filter(prevEvent => !events.some(event => event.id === prevEvent.id));
      const updatedEvents = events.filter(event => {
        const prevEvent = previousEvents.find(prevEvent => prevEvent.id === event.id);
        return prevEvent && (
          prevEvent.title !== event.title ||
          prevEvent.startDate !== event.startDate ||
          prevEvent.endDate !== event.endDate ||
          prevEvent.notes !== event.notes 
        );
      });

      // Update previous events state
      setPreviousEvents(events);

      // Handle new events
      for (const event of newEvents) {
        try {
          console.log('Adding event:', event.title);
          await fetch('http://localhost:5001/calendar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userID: userID,
              eventId: event.id,
              activityType: 'Other',
              activityName: event.title,
              startDate: event.startDate,
              endDate: event.endDate,
              notes: event.notes || ' ', // Include notes field here
            }),
          });
        } catch (err) {
          console.error('Error sending new event to server:', err);
        }
      }

      // Handle updated events
      for (const event of updatedEvents) {
        try {
          console.log('Updating event:', event.title);
          await fetch('http://localhost:5001/calendar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userID: userID,
              eventId: event.id,
              activityType: 'Other',
              activityName: event.title,
              startDate: event.startDate,
              endDate: event.endDate,
              notes: event.notes || ' ', // Include notes field here
            }),
          });
        } catch (err) {
          console.error('Error updating event on server:', err);
          //Alert.alert('Error updating event on server:', err.message);
        }
      }

      // Handle deleted events
      for (const event of deletedEvents) {
        try {
          console.log('Deleting event:', event.title);
          await fetch('http://localhost:5001/calendar', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userID: userID,
              eventId: event.id,
            }),
          });
        } catch (err) {
          console.error('Error deleting event on server:', err);
        }
      }

      // Update the events state for UI
      setEvents(events);
    } else {
      Alert.alert('No calendars found');
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAndUpdateEvents();
    }, 5000); // 5000 milliseconds = 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [previousEvents, userID]);

  // const handleGetEventsDB = async () => {
  //   const { status } = await Calendar.requestCalendarPermissionsAsync();
  //   if (status !== 'granted') {
  //     Alert.alert('Permission to access calendar was denied');
  //     return;
  //   }

  //   try {
  //     // Fetch events from the database
  //     const response = await fetch(`http://localhost:5001/calendar/${userID}`);
  //     const dbEvents = await response.json();

  //     // Fetch events from the device calendar
  //     const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  //     if (calendars.length > 0) {
  //       const calendarId = calendars[0].id;
  //       const deviceEvents = await Calendar.getEventsAsync(
  //         [calendarId],
  //         new Date(),
  //         new Date(new Date().setDate(new Date().getDate() + 60))
  //       );

  //       // Compare events and store the missing ones on the device
  //       const missingEvents = dbEvents.filter(dbEvent =>
  //         !deviceEvents.some(deviceEvent => deviceEvent.id === dbEvent._id)
  //       );

  //       for (const event of missingEvents) {
  //         try {
  //           await Calendar.createEventAsync(calendarId, {
  //             title: event.activityName,
  //             startDate: new Date(event.startDate),
  //             endDate: new Date(event.endDate),
  //             //notes: event.activityType,
  //           });
  //           console.log('Adding event to device:', event.activityName);
  //         } catch (err) {
  //           console.error('Error adding event to device:', err);
  //         }
  //       }

  //       // Update the events state for UI
  //       setEvents([...deviceEvents, ...missingEvents]);
  //     } else {
  //       Alert.alert('No calendars found');
  //     }
  //   } catch (err) {
  //     console.error('Error fetching events from database:', err);
  //   }
  // };

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     handleGetEventsDB();
  //   }, 5000); // 5000 milliseconds = 5 seconds

  //   return () => clearInterval(intervalId); // Cleanup interval on component unmount
  // }, [previousEvents, userID]);

  const fetchAndUpdateEventsDB = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access calendar was denied');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5001/calendar/${userID}`);
      const serverEvents = await response.json();
      //console.log('Fetched events from server:', serverEvents);
  
      // Get the default calendar ID or another appropriate calendar ID
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(calendar => calendar.allowsModifications);
      const calendarId = defaultCalendar ? defaultCalendar.id : null;
  
      if (!calendarId) {
        throw new Error('No modifiable calendar found on the device.');
      }
      // Fetch events from the device calendar
      const deviceEvents = await Calendar.getEventsAsync(
        [calendarId],
        new Date(),
        new Date(new Date().setDate(new Date().getDate() + 60))
      );

  
      // Compare with previous events
      const newEvents = serverEvents.filter(serverEvent => 
        serverEvent.eventId === '0' && // Exclude events where eventId is not 0
        !previousEventsServer.some(prevEvent => prevEvent._id === serverEvent._id)
      );
      const deletedEvents = previousEventsServer.filter(prevEvent => 
        !serverEvents.some(serverEvent => serverEvent._id === prevEvent._id)
      );
      const updatedEvents = serverEvents.filter(serverEvent => {
        const prevEvent = previousEventsServer.find(prevEvent => prevEvent._id === serverEvent._id);
        return prevEvent && (
          prevEvent.activityName !== serverEvent.activityName ||
          new Date(prevEvent.startDate).getTime() !== new Date(serverEvent.startDate).getTime() ||
          new Date(prevEvent.endDate).getTime() !== new Date(serverEvent.endDate).getTime()
        );
      });
  
  //     console.log('New events:', newEvents);
  //    console.log('Updated events:', updatedEvents);
  //    console.log('Deleted events:', deletedEvents);
  
      // Handle new events
      for (const event of newEvents) {
        const duplicateEvent = deviceEvents.find(deviceEvent =>
          deviceEvent.title === event.activityName &&
          new Date(deviceEvent.startDate).getTime() === new Date(event.startDate).getTime() &&
          new Date(deviceEvent.endDate).getTime() === new Date(event.endDate).getTime()
        );
  
        if (!duplicateEvent) {
          try {
            console.log('Adding event to device:', event.activityName);
            await Calendar.createEventAsync(calendarId, {
              title: event.activityName,
              startDate: new Date(event.startDate),
              endDate: new Date(event.endDate),
              notes: 'S', 
            });
          } catch (err) {
            console.error('Error adding event to device:', err);
          }
        } else {
          console.log('Duplicate event found, not adding to device:', event.activityName);
        }
      }
  
      // Handle updated events
      for (const event of updatedEvents) {
        try {
          console.log('Updating event on device:', event.activityName);
          const deviceEvent = previousEventsServer.find(prevEvent => prevEvent._id === event._id);
          await Calendar.updateEventAsync(deviceEvent.eventId, {
            title: event.activityName,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            notes: event.notes || '', 
          });
        } catch (err) {
          console.error('Error updating event on device:', err);
        }
      }
  
      // Handle deleted events
      for (const event of deletedEvents) {
        try {
          console.log('Deleting event from device:', event.activityName);
          await Calendar.deleteEventAsync(event.eventId);
        } catch (err) {
          console.error('Error deleting event from device:', err);
        }
      }
  
  //     // Update previous events state
       setPreviousEventsServer(serverEvents);
  
       // Update the events state for UI
       setEventsServer(serverEvents);
     } catch (error) {
       console.error('Error fetching events from server:', error);
     }
   };
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAndUpdateEventsDB();
    }, 5000); // 5000 milliseconds = 5 seconds
  
    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [previousEvents, userID]);
  
  // const deleteAllEventsFromDevice = async () => {
  //   try {
  //     // Request calendar permissions
  //     const { status } = await Calendar.requestCalendarPermissionsAsync();
  //     if (status !== 'granted') {
  //       Alert.alert('Permission to access calendar was denied');
  //       return;
  //     }
  
  //     // Get all calendars
  //     const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  //     if (calendars.length === 0) {
  //       Alert.alert('No calendars found');
  //       return;
  //     }
  
  //     let allEvents = [];
  
  //     // Loop through each calendar and fetch all events
  //     for (const calendar of calendars) {
  //       const events = await Calendar.getEventsAsync([calendar.id], new Date(2000, 0, 1), new Date(2100, 11, 31));
  //       allEvents = [...allEvents, ...events];
  //     }
  
  //     // Deduplicate events based on unique IDs
  //     const uniqueEventIds = [...new Set(allEvents.map(event => event.id))];
  
  //     // Delete each event by its unique ID
  //     for (const eventId of uniqueEventIds) {
  //       await Calendar.deleteEventAsync(eventId);
  //     }
  
  //     //Alert.alert('All calendar events deleted successfully');
  //   } catch (err) {
  //     console.error('Error deleting all events from device:', err);
  //     Alert.alert('Error deleting all events from device');
  //   }
  // };
  // // useEffect(() => {
  // //   const intervalId = setInterval(() => {
  // //     deleteAllEventsFromDevice();
  // //   }, 1); // 5000 milliseconds = 5 seconds
  
  //   return () => clearInterval(intervalId); // Cleanup interval on component unmount
  // },);
  
  
  
  // // Example usage within a React Native component
  // //<Button title="Delete All Events" onPress={deleteAllEventsFromDevice} />
  
  // const deleteAllEventsFromDB = async (userID) => {
  //   try {
  //     const response = await fetch(`http://localhost:5001/calendar/all/${userID}`, {
  //       method: 'DELETE',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });
  
  //     if (response.status === 200) {
  //       Alert.alert('All calendar events deleted successfully');
  //     } else {
  //       Alert.alert('No calendar events found to delete');
  //     }
  //   } catch (err) {
  //     console.error('Error deleting all events from database:', err);
  //     Alert.alert('Error deleting all events from database');
  //   }
  // };
  
  // // Example usage within a React Native component
  // //<Button title="Delete All Events from DB" onPress={() => deleteAllEventsFromDB(userID)} />
  const fetchAndUpdateEventIds = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access calendar was denied');
      return;
    }
  
    try {
      // Fetch events from the server
      const response = await fetch(`http://localhost:5001/calendar/${userID}`);
      const serverEvents = await response.json();
  
      // Get the default calendar ID or another appropriate calendar ID
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(calendar => calendar.allowsModifications);
      const calendarId = defaultCalendar ? defaultCalendar.id : null;
  
      if (!calendarId) {
        throw new Error('No modifiable calendar found on the device.');
      }
  
      // Fetch events from the device calendar
      const deviceEvents = await Calendar.getEventsAsync(
        [calendarId],
        new Date(),
        new Date(new Date().setDate(new Date().getDate() + 60))
      );
  
      // Find matching events
      for (const serverEvent of serverEvents) {
        if (serverEvent.eventId === '0') {
          const matchingDeviceEvent = deviceEvents.find(deviceEvent =>
            new Date(serverEvent.startDate).getTime() === new Date(deviceEvent.startDate).getTime() &&
            new Date(serverEvent.endDate).getTime() === new Date(deviceEvent.endDate).getTime() &&
            serverEvent.activityName === deviceEvent.title //&&
            //(serverEvent.notes || ' ') === (deviceEvent.notes || ' ')
          );
  
          if (matchingDeviceEvent) {
            // Update the server event with the real eventId from the device
            try {
              await fetch('http://localhost:5001/calendarEventID0', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userID: userID,
                  eventId: matchingDeviceEvent.id,
                  activityType: serverEvent.activityType,
                  activityName: serverEvent.activityName,
                  startDate: serverEvent.startDate,
                  endDate: serverEvent.endDate,
                  notes: serverEvent.notes || ' ',
                }),
              });
              console.log(`Updated eventId for event: ${serverEvent.activityName}`);
            } catch (err) {
              console.error('Error updating event on server:', err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching events from server or device:', error);
    }
  };
  
  // Call the function to fetch and update event IDs
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAndUpdateEventIds();
    }, 5000); // 5000 milliseconds = 5 seconds
  
    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [previousEvents, userID]);
  
  

  return (
    <>
      {!showBlankPage && (
        <View style={styles.container}>
          <Text style={styles.title}>Welcome, {username}!</Text>
          <Text>You are now logged in.</Text>
          <Button title="Go to Blank Page" onPress={goToBlankPage} />
          {/* <Button title="Delete All Events" onPress={deleteAllEventsFromDevice} />
          <Button title="Delete All Events from DB" onPress={() => deleteAllEventsFromDB(userID)} /> */}
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
