import React, { useState } from 'react';
import WelcomePage from './WelcomePage'; // Import WelcomePage component
import './LoginForm.css'; // Import CSS file for styling
import { Navigate, Router } from 'react-router-dom';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (username === 'Ana' && password === 'parrot') {
      setIsLoggedIn(true); // Set isLoggedIn to true if credentials match
    } else {
      alert('Invalid username or password');
    }
  };

    if (isLoggedIn) {
        window.localStorage.setItem('loggedIn', true)
        return <Navigate to="/" />
    }

  // Render the welcome page if isLoggedIn is true
//   if (isLoggedIn) {
//     return <WelcomePage />;
//   }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginForm;

