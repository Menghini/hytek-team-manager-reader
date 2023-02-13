import MDBReader from "mdb-reader";
import React, { useState } from 'react';
import './App.css';
import './MeetTable.css';
import UploadBox from './UploadBox';

import {
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material/";
import { DataGrid } from '@mui/x-data-grid';

if (typeof Buffer === 'undefined') {
    global.Buffer = require('buffer/').Buffer;
}

function MeetTable() {
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [selectedMeetRows, setSelectedMeetRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [resultsTable, setResultsTable] = useState(null);

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
        setLoading(true);
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
                    const resultTable = mdbReader.getTable("RESULT");
                    setTableData(meetTable.getData());
                    setSelectedMeetRows([]);
                    setResultsTable(resultTable);
                } else {
                    console.log("This is a database file, but it doesn't appear to be from HYTEK Track and Field Manager");
                    setTableData(["This is a database file, but it doesn't appear to be from HYTEK Track and Field Manager"]);
                }
            } catch (error) {
                setTableData([]);
                setFileName("This is not a database file, nor does it appear to be from HYTEK Track and Field Manager");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const columns = [
        { field: 'MEET', headerName: 'ID', flex: 1 },
        { field: 'MNAME', headerName: 'Meet Name', flex: 1 },
        { field: 'START', headerName: 'Date', flex: 1, valueFormatter: (params) => params.value.toDateString() },
        { field: 'LOCATION', headerName: 'Location', flex: 1 },
        { field: 'MEET_KIND', headerName: 'Meet Type', flex: 1, valueFormatter: (params) => {
            if (params.value === 'T') {
              return 'Track & Field';
            } else if (params.value === 'C') {
              return 'Cross Country';
            } else {
              return '';
            }
          }
        },
      ];
      
    const tableDataWithId = tableData.map((row, index) => {
        return {
            ...row,
            id: row.MEET,
        };
    });
    const handleClose = () => {
        setOpen(false);
    };

    const handleSelectionChange = (newSelection) => {
        const selectedMeetId = newSelection[0];
        const selectedMeetRows = resultsTable.getData()
            .filter(row => row.MEET === selectedMeetId)
            .map((row, index) => {
                const scoreInSeconds = row.SCORE / 100;
                const minutes = Math.floor(scoreInSeconds / 60);
                const seconds = Math.floor(scoreInSeconds % 60);
                const milliseconds = row.SCORE % 100;
                const showMinutes = minutes >= 1;
                const timeString = (showMinutes ? `${minutes}:` : '') +
                    `${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
                let eventName = '';
                let eventType;
                switch (row.I_R) {
                    case "I":
                        eventType = "Individual";
                        break;
                    case "R":
                        eventType = "Relay";
                        break;
                    case "N":
                        eventType = "Relay Split";
                        break;
                    default:
                        eventType = "";
                        break;
                }
                switch (row.EVENT) {
                    case 1:
                        eventName = row.DISTANCE + 'M Dash';
                        break;
                    case 2:
                        eventName = row.DISTANCE + 'M Run';
                        break;
                    case 3:
                        eventName = row.DISTANCE / 10 + ' Mile Run';
                        break;
                    case 5:
                        eventName = row.DISTANCE + 'M Hurdles';
                        break;
                    case 9:
                        eventName = 'High Jump';
                        break;
                    case 10:
                        eventName = 'Pole Vault';
                        break;
                    case 11:
                        eventName = 'Long Jump';
                        break;
                    case 12:
                        eventName = 'Triple Jump';
                        break;
                    case 13:
                        eventName = 'Shot Put';
                        break;
                    case 14:
                        eventName = 'Discus';
                        break;
                    case 15:
                        eventName = 'Hammer';
                        break;
                    case 16:
                        eventName = 'Javelin';
                        break;
                    case 17:
                        eventName = 'Weight Throw';
                        break;
                    case 19:
                        eventName = '4x' + row.DISTANCE / 4 + 'M Relay';
                        break;
                    case 31:
                        eventName = 'Super Weight';
                        break;
                    default:
                        eventName = '?UNKOWN?';
                        break;
                }
                return {
                    id: index,
                    ATHLETE: row.ATHLETE,
                    EVENTNAME: eventName,
                    MINUTES: minutes,
                    SECONDS: seconds,
                    MILLISECONDS: milliseconds,
                    SCORE: timeString,
                    RESULT: row.RESULT,
                    EVENTTYPE: eventType
                }
            });
        setSelectedMeetRows(selectedMeetRows);
        setOpen(true);
    };




    const resultsTableColumns  = [
        { field: 'ATHLETE', headerName: 'Athlete', flex: 1 },
        { field: 'EVENTTYPE', headerName: 'Event Type', flex: 1 },
        { field: 'EVENTNAME', headerName: 'Event Name', flex: 1 },
        { field: 'SCORE', headerName: 'Mark', flex: 1 },
    ];

    return (
        <div className="MeetTable" style={{ width: '80vw' }} onDrop={handleFileDrop} onDragOver={(event) => event.preventDefault()}>
            {fileName ? `Table data for ${fileName}:` : "Drop a file to display table data"}
            {tableData.length > 0 ? (
                <>
                    <Paper sx={{ height: '70vh', width: '100%' }}>
                        <DataGrid
                            rows={tableDataWithId}
                            columns={columns}
                            pageSize={100}
                            rowsPerPageOptions={[10]}
                            autoPageSize
                            sortModel={[{ field: 'START', sort: 'desc' }]}
                            onSelectionModelChange={handleSelectionChange}
                        />
                    </Paper>
                    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                        <DialogTitle>Selected Meet Results</DialogTitle>
                        <DialogContent>
                            <DialogContentText>Table showing athletes, distances, scores, and results for the selected meet.</DialogContentText>
                            <div style={{ height: 500, width: '100%' }}>
                                <DataGrid rows={selectedMeetRows} columns={resultsTableColumns} getRowId={(row) => row.id} />
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Close</Button>
                        </DialogActions>
                    </Dialog>
                </>
            ) : (
                <UploadBox loading={loading} />
            )}
        </div>
    );
}

export default MeetTable;