import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import MeetTable from './MeetTable';
import DataContext from './Contexts/DataContext';



function App() {

  return (
    <header className="App-header">
      <h1>HYTEK Track & Field Database Display</h1>
      <DataContext>
        <MeetTable />
      </DataContext>
    </header>
  );
}

export default App;
