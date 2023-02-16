import MDBReader from "mdb-reader";
import React, { useState, useContext } from 'react';
import './App.css';
import './MeetTable.css';
import UploadBox from './UploadBox';
import {
    TabContext,
    TabPanel,
    TabList
} from '@mui/lab/';
import {
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Tabs,
    Tab,
    TablePaginationBaseProps,
    Box,
} from "@mui/material/";
import { DataGrid } from '@mui/x-data-grid';
import { DataContext } from './Contexts/DataContext';

if (typeof Buffer === 'undefined') {
    global.Buffer = require('buffer/').Buffer;
}

function MeetTable() {
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [selectedMeetRows, setSelectedMeetRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [meetTable, setMeetTable] = useState([]);
    const [resultsTable, setResultsTable] = useState([]);
    const [athletesTable, setAthletesTable] = useState([]);
    const [meetInfo, setMeetInfo] = useState(null);
    const [mainTabsValue, setMainTabsValue] = React.useState(1);
    const dataContext = useContext(DataContext);
    console.log(dataContext.foo);  // Prints the foo value to the console
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

    const handleMainTabsChange = (event, newValue) => {
        //This code is ran once to set the tabs to the first tab.
        setMainTabsValue(newValue);
    };


    React.useEffect(() => {
        setMainTabsValue("1");
    }, []);


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
                    setMeetTable(meetTable.getData());
                    setSelectedMeetRows([]);
                    setResultsTable(resultTable);
                    setAthletesTable(athleteTable.getData());
                } else {
                    console.log("This is a database file, but it doesn't appear to be from HYTEK Track and Field Manager");
                    setMeetTable(["This is a database file, but it doesn't appear to be from HYTEK Track and Field Manager"]);
                }
            } catch (error) {
                setMeetTable([]);
                setAthletesTable([]);
                setResultsTable([]);
                setFileName("This is not a database file, nor does it appear to be from HYTEK Track and Field Manager");
            }
        };
        reader.readAsArrayBuffer(file);
    };
    //The columns to display in the meets table
    const meetTableColumns = [
        { field: 'MEET', headerName: 'ID', flex: 0.25 },
        { field: 'MNAME', headerName: 'Meet Name', flex: 1 },
        {
            field: 'START', headerName: 'Date', flex: .5, valueFormatter: (params) => {
                const date = new Date(params.value);
                const options = {
                    timeZone: 'UTC',
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                };
                const formattedDate = date.toLocaleString('en-US', options);
                return formattedDate;
            }
        },
        { field: 'LOCATION', headerName: 'Location', flex: 1 },
        {
            field: 'MEET_KIND', headerName: 'Meet Type', flex: .5, valueFormatter: (params) => {
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
    //The columns to display in the athletes table
    const athletesTableColumns = [
        { field: 'Athlete', headerName: 'ID', flex: 1 },
        { field: 'Last', headerName: 'Last Name', flex: 1 },
        { field: 'First', headerName: 'First Name', flex: 1 },
    ];

    const meetTableWithId = meetTable.map((row, index) => {
        return {
            ...row,
            id: row.MEET, //This is telling which column has the unique ID, otherwise you cannot display the data grid
        };
    });
    const athletesTableWithId = athletesTable.map((row, index) => {
        return {
            ...row,
            id: row.Athlete, //This is telling which column has the unique ID, otherwise you cannot display the data grid
        };
    });
    const handleClose = () => {
        setOpen(false);
    };

    const convertRawScoreToMark = (score, MARK_YD) => {
        //Score is the raw score from the database.
        //MARK_YD is either E for imperial or M for metric.
        let mark, convert, rawMetric;
        if (score === 0) {
            mark = "F";
        }
        else if (score < 0 && MARK_YD === "E") {
            //Imperial Scored Field Event
            const feet = Math.floor(score * -1 / 100) / 12;
            const inches = (score * -1 / 100) % 12;
            convert = ((feet * 12 + inches) * 0.0254).toFixed(2) + "m";
            rawMetric = ((feet * 12 + inches) * 0.0254);
            let inchString = inches.toFixed(2);
            if (inchString.length === 4) {
                inchString = "0" + inchString;
            }
            mark = `${feet.toFixed(0)}-${inchString}`;
        } else if (score < 0 && MARK_YD === "M") {
            //Metric Scored Field Event
            const meters = score * -1 / 100;
            rawMetric = meters;
            mark = `${meters.toFixed(2)}m`;
            let feet = meters * 3.28084;
            let inches = (feet - Math.floor(feet)) * 12;
            if (inches === 12.00) {
                feet += 1;
                inches = 0;
            } else {
                inches = Math.round(inches / 0.25) * 0.25; // round to nearest quarter inch
            }
            convert = `${Math.floor(feet).toFixed(0)}-${inches.toFixed(2)}`;

        } else {
            //Timed event
            const scoreInSeconds = score / 100;
            const minutes = Math.floor(scoreInSeconds / 60);
            const seconds = Math.floor(scoreInSeconds % 60);
            const milliseconds = score % 100;
            const showMinutes = minutes >= 1;
            mark = `${showMinutes ? `${minutes}:` : ''}${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
        }
        return {
            mark: mark, //Used to denote the result in which it was measured in
            convert: convert, //Used to denote the result in which it was converted to
            rawMetric: rawMetric //Use to help with calculating improvement
        };
    }

    const openResultsTable = (newSelection) => {
        //This is called to set the results table
        const selectedMeetId = newSelection[0];
        const meet = meetTable && meetTable.find(meetTable => meetTable.MEET === selectedMeetId);
        const meetInfoToBePassedIn = { meetName: meet?.MNAME, meetDate: meet?.START };
        setMeetInfo(meetInfoToBePassedIn);
        const selectedMeetRows = resultsTable.getData()
            .filter(row => row.MEET === selectedMeetId)
            .map((row, index) => {
                const { mark, convert } = convertRawScoreToMark(row.SCORE, row.MARK_YD);
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
                    //Below concatenates the last name and first name with a comma
                    //ATHLETE: athletesTable && athletesTable.find(athlete => athlete.Athlete === row.ATHLETE)?.Last + ', ' + athletesTable.find(athlete => athlete.Athlete === row.ATHLETE)?.First,
                    FIRST: athletesTable && athletesTable.find(athlete => athlete.Athlete === row.ATHLETE)?.First,
                    LAST: athletesTable && athletesTable.find(athlete => athlete.Athlete === row.ATHLETE)?.Last,
                    ATHLETEID: row.ATHLETE,
                    EVENTNAME: eventName,
                    SCORE: mark,
                    CONVERT: convert,
                    RESULT: row.RESULT,
                    EVENTTYPE: eventType,
                }
            });
        setSelectedMeetRows(selectedMeetRows);
        setOpen(true);
    };




    const resultsTableColumns = [
        { field: 'LAST', headerName: 'Last Name', flex: 1 },
        { field: 'FIRST', headerName: 'First Name', flex: 1 },
        { field: 'ATHLETEID', headerName: 'Athlete ID', flex: 1 },
        { field: 'EVENTTYPE', headerName: 'Event Type', flex: 1 },
        { field: 'EVENTNAME', headerName: 'Event Name', flex: 1 },
        { field: 'SCORE', headerName: 'Mark', flex: 1 },
        { field: 'CONVERT', headerName: 'Convert', flex: 1 },
    ];

    return (
        <div className="MeetTable" style={{ width: '80vw' }} onDrop={handleFileDrop} onDragOver={(event) => event.preventDefault()}>
            {fileName ? `Table data for ${fileName}:` : "Drop a file to display table data"}
            {meetTable.length > 0 ? (
                <>
                    <Box sx={{ width: '100%', typography: 'body1' }}>
                        <TabContext value={mainTabsValue}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList onChange={handleMainTabsChange} aria-label="lab API tabs example">
                                    <Tab label="Meets" value="1" />
                                    <Tab label="Athletes" value="2" />
                                    <Tab label="Item Three" value="3" />
                                </TabList>
                            </Box>
                            <TabPanel value="1">
                                {/*if the first tab is selected, then the meets will show up here*/}
                                <Paper sx={{ height: '70vh', width: '100%' }}>
                                    <DataGrid
                                        rows={meetTableWithId}
                                        columns={meetTableColumns}
                                        pageSize={100}
                                        rowsPerPageOptions={[10]}
                                        autoPageSize
                                        sortModel={[{ field: 'START', sort: 'desc' }]}
                                        onSelectionModelChange={openResultsTable}
                                    />
                                </Paper>
                                <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                                    <DialogTitle>{meetInfo !== null ? meetInfo.meetName + " Results on " + new Date(meetInfo.meetDate).toLocaleDateString('en-US', { timeZone: 'UTC' }) : "No Meet Results"}</DialogTitle>
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
                            </TabPanel>
                            <TabPanel value="2">
                                {/*if the first tab is selected, then athlete info will show up here*/}
                                <Paper sx={{ height: '70vh', width: '100%' }}>
                                    <DataGrid
                                        rows={athletesTableWithId}
                                        columns={athletesTableColumns}
                                        pageSize={100}
                                        rowsPerPageOptions={[10]}
                                        autoPageSize
                                        sortModel={[{ field: 'Last', sort: 'asc' }]}
                                    //onSelectionModelChange={openResultsTable}
                                    />
                                </Paper>
                            </TabPanel>
                            <TabPanel value="3">Item Three</TabPanel>
                        </TabContext>
                    </Box>

                </>
            ) : (
                <UploadBox loading={loading} />
            )}
        </div>
    );
}

export default MeetTable;