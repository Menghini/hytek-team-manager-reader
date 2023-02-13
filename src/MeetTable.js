import MDBReader from "mdb-reader";
import React, { useState } from 'react';
import './App.css';
import './MeetTable.css';
import UploadBox from './UploadBox';

import {
    Paper,
} from "@mui/material/";
import { DataGrid } from '@mui/x-data-grid';

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

    return (
        <div className="MeetTable" style={{ width: '80vw' }} onDrop={handleFileDrop} onDragOver={(event) => event.preventDefault()}>
            {fileName ? `Table data for ${fileName}:` : "Drop a file to display table data"}
            {tableData.length > 0 ? (
                <Paper sx={{ height: '70vh', width: '100%' }}>
                    <DataGrid
                        rows={tableDataWithId}
                        columns={columns}
                        pageSize={100}
                        rowsPerPageOptions={[10]}
                        autoPageSize
                        sortModel={[{ field: 'START', sort: 'desc' }]}
                        onSelectionModelChange={(newSelection) => {
                            console.log("Selected row index:", newSelection[0]);
                        }}
                    />
                </Paper>
            ) : (
                <UploadBox loading={loading} />
            )}
        </div>
    );
}

export default MeetTable;

