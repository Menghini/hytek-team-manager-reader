import MDBReader from "mdb-reader";
import React, { useState } from 'react';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LoopIcon from '@mui/icons-material/Loop';
import './App.css';
import './MeetTable.css';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material/";

if (typeof Buffer === 'undefined') {
    global.Buffer = require('buffer/').Buffer;
}
function MeetTable() {
    const [loading, setLoading] = useState(false);
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
        console.log("test");
        setLoading(true); //If this is true, the ternary statement will change the icon to the loading one and will spin.
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            setLoading(false);
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
                    const athleteTable = mdbReader.getTable("Athlete");
                    const meetTable = mdbReader.getTable("MEET");
                    const resultsTable = mdbReader.getTable("RESULT");
                    setTableData(meetTable.getData());
                } else {
                    console.log("This is a database file, but it doesn't appear to be from HYTEK Track and Field Manager");
                    setTableData(["This is a database file, but it doesn't appear to be from HYTEK Track and Field Manager"]);
                }
            } catch (error) {
                //console.error(error);
                setTableData([]);
                setFileName("This is not a database file, nor does it appear to be from HYTEK Track and Field Manager");
            }
        };
        reader.readAsArrayBuffer(file);
    };
    return (
        <div className="MeetTable" onDrop={handleFileDrop} onDragOver={(event) => event.preventDefault()}>
            {fileName ? `Table data for ${fileName}:` : "Drop a file to display table data"}
            {tableData.length > 0 ? (
                <Paper>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>MEET</TableCell>
                                <TableCell>DATE</TableCell>
                                <TableCell>LOCATION</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableData.map((row, index) => (
                                <TableRow key={row.MEET || index}>
                                    <TableCell>{row.MEET}</TableCell>
                                    <TableCell>{row.MNAME}</TableCell>
                                    <TableCell>{row.START.toDateString()}</TableCell>
                                    <TableCell>{row.LOCATION}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            ) : (
                <div class="box">
                    <div class={"UploadContainer" + (loading ? "" : " done")}>
                        {loading ? (
                                <LoopIcon fontSize="large" />
                        ) : (
                            <> {/* This is here because a ternary operator has to return a single tag */}
                                <UploadFileIcon fontSize="large" />
                                <p>Drag File Here</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


export default MeetTable;