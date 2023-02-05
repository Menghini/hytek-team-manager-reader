import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { readFileSync } from "fs";
import MDBReader from "mdb-reader";

//Example
const buffer = readFileSync("database.mdb");
const reader = new MDBReader(buffer);

reader.getTableNames(); // ['Cats', 'Dogs', 'Cars']

const table = reader.getTable("Cats");
table.getColumnNames(); // ['id', 'name', 'color']
table.getData(); // [{id: 5, name: 'Ashley', color: 'black'}, ...]

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
