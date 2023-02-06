import React, { useState } from 'react';
import logo from './logo.svg';
import MDBReader from "mdb-reader";
import './App.css';

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer/').Buffer;
}


function App() {
  const [tableData, setTableData] = useState([]);
  const [fileName, setFileName] = useState('');

  const requiredTables = [
    "AGEGROUPS",
    "AthInfo",
    "Athlete",
    "ATHRECR",
    "ATHREG",
    "BRACKET",
    "COACHES",
    "CODE",
    "CustomLayout",
    "CustomLayoutFields",
    "CustomLayoutValues",
    "CUSTOMRPTS",
    "ENTRY",
    "ESPLITS",
    "FAVORITES",
    "JOURNAL",
    "MEET",
    "MTEVENT",
    "MTEVENTE",
    "OPTIONS",
    "RECNAME",
    "RECORDS",
    "RELAY",
    "REPORTORDER",
    "RESULT",
    "SPLITS",
    "STDNAME",
    "TEAM",
    "TMREG"
  ];

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {

      try {
        const buffer = Buffer.from(event.target.result);
        const mdbReader = new MDBReader(buffer);
        let tables = mdbReader.getTableNames();

        let containsAllTables = true;
        for (let i = 0; i < requiredTables.length; i++) {
          if (!tables.includes(requiredTables[i])) {
            containsAllTables = false;
            break;
          }
        }

        if (containsAllTables) {
          const table = mdbReader.getTable("Athlete");
          setTableData(table.getData());
        } else {
          console.log("This file doesn't appear to be from HYTEK Track and Field Manager");
          setTableData(["This file doesn't appear to be from HYTEK Track and Field Manager"]);
        }
      } catch (error) {
        //console.error(error);
        setTableData([]);
        setFileName("This file doesn't appear to be from HYTEK Track and Field Manager");
      }
    };
    reader.readAsArrayBuffer(file);
  };
  return (
    <div
      className="App"
      onDrop={handleFileDrop}
      onDragOver={(event) => event.preventDefault()}
    >
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {fileName ? `Table data for ${fileName}:` : 'Drop a file to display table data'}
        </p>
        {tableData.map((row) => (
          <div key={row.id}>{JSON.stringify(row)}</div>
        ))}
      </header>
    </div>
  );
}

export default App;
