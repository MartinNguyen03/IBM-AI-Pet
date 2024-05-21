import React from 'react';
import './App.css';
import UserList from './components/UserList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <UserList />
      </header>
    </div>
  );
}

export default App;

//how to run
// cd ibm-ai-pet-client
// npm start