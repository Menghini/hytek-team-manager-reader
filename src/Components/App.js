import React, { useState } from 'react';
import '../css/App.css';
import MainTabs from './MainTabs';
import DataContext from '../Contexts/DataContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';



function App() {

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#d100ff',
      },
      secondary: {
        main: '#f50057',
      },
    },
  });

  return (
    <header className="App-header">
      <ThemeProvider theme={theme}>
        <h1>HYTEK Track & Field Database Display</h1>
        <DataContext>
          <MainTabs />
        </DataContext>
      </ThemeProvider>
    </header>
  );
}

export default App;
