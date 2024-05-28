import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import BlankPage from './BlankPage';
import './WelcomePage.css'; // Import CSS file for styling

function WelcomePage() {
    const [showBlankPage, setShowBlankPage] = useState(false); // State to track whether to show the blank page
    const [location, setLocation] = useState(null); // State to store user's location

    const loggedIn = window.localStorage.getItem('loggedIn');
    if (!loggedIn) {
        return <Navigate to="/login" />;
    }

    const goToBlankPage = () => {
        // Set showBlankPage to true when button is clicked
        setShowBlankPage(true);
    };

    const goBack = () => {
        // Set showBlankPage to false when back button is clicked
        setShowBlankPage(false);
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    return (
        <>
            {!showBlankPage && (
                <div className="welcome-container">
                    <h2>Welcome, Ana!</h2>
                    <p>You are now logged in.</p>
                    <button onClick={goToBlankPage}>Go to Blank Page</button>
                    <button onClick={handleGetLocation}>Get Location</button>
                    {location && (
                        <p>Your location is {location.latitude}, {location.longitude}</p>
                    )}
                </div>
            )}
            {showBlankPage && <BlankPage onBack={goBack} />} {/* Render BlankPage conditionally */}
        </>
    );
}

export default WelcomePage;

