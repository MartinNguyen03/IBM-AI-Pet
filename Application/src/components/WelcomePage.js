import React, { useState } from 'react';
import { Navigate, Router } from 'react-router-dom';
import BlankPage from './BlankPage';
import './WelcomePage.css'; // Import CSS file for styling

function WelcomePage() {
    const [showBlankPage, setShowBlankPage] = useState(false); // State to track whether to show the blank page
    
    const loggedIn = window.localStorage['loggedIn']
    if (!loggedIn) {
        return <Navigate to="/login" />
    }

  const goToBlankPage = () => {
    // Set showBlankPage to true when button is clicked
    setShowBlankPage(true);
  };

  const goBack = () => {
    // Set showBlankPage to false when back button is clicked
    setShowBlankPage(false);
  };

  return (
    <>
      {!showBlankPage && (
        <div className="welcome-container">
          <h2>Welcome, Ana!</h2>
            <p>You are now logged in.</p>
            <button onClick={goToBlankPage}>Go to Blank Page</button>
        </div>
      )}
    {showBlankPage && <BlankPage onBack={goBack} />} {/* Render BlankPage conditionally */}
    </>
  );
}

export default WelcomePage;








