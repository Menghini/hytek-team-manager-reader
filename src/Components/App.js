import React, { useState } from 'react';
import '../css/App.css';
import MainTabs from './MainTabs';
import DataContext from '../Contexts/DataContext';



function App() {

  return (
    <header className="App-header">
      <h1>HYTEK Track & Field Database Display</h1>
      <DataContext>
        <MainTabs />
      </DataContext>
    </header>
  );
}

export default App;
