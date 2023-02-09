import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import MeetTable from './MeetTable';



function App() {

  return (
      <header className="App-header">
        <h1>HYTEK Track & Field Database Display</h1>
        <MeetTable />
      </header>
  );
}

export default App;
