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

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = Buffer.from(event.target.result);
      const mdbReader = new MDBReader(buffer);
      const table = mdbReader.getTable("Athlete");
      setTableData(table.getData());
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
