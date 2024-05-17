import React from 'react';
import './BlankPage.css'; // Import CSS file for styling

function BlankPage({ onBack }) {
  const handleBack = () => {
    // Call the onBack function when the back button is clicked
    onBack();
  };

  return (
    <div className="blank-container">
      <h2>This is a blank page!</h2>
      <p>Feel free to add content here.</p>
      <button onClick={handleBack}>Go Back</button>
    </div>
  );
}

export default BlankPage;


