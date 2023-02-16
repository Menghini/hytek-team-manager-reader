import React, { useState } from 'react';
import '../css/App.css';
import MeetTable from './MeetTable';
import DataContext from './DataContext';



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
