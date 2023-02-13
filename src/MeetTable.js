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
        { field: 'MNAME', headerName: 'MEET', flex: 1 },
        { field: 'START', headerName: 'DATE', flex: 1, valueFormatter: (params) => params.value.toDateString() },
        { field: 'LOCATION', headerName: 'LOCATION', flex: 1 },
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
                const timeString = (showMinutes ? `${minutes}:` : '') + `${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
                return {
                    id: index,
                    ATHLETE: row.ATHLETE,
                    DISTANCE: row.DISTANCE,
                    MINUTES: minutes,
                    SECONDS: seconds,
                    MILLISECONDS: milliseconds,
                    SCORE: timeString,
                    RESULT: row.RESULT
                }
            });
        setSelectedMeetRows(selectedMeetRows);
        setOpen(true);
    };



    const resultsTableColumns = [
        { field: 'ATHLETE', headerName: 'ATHLETE', flex: 1 },
        { field: 'DISTANCE', headerName: 'DISTANCE', flex: 1 },
        { field: 'SCORE', headerName: 'SCORE', flex: 1 },
        { field: 'RESULT', headerName: 'RESULT', flex: 1 },
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