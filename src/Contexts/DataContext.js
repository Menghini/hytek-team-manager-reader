import React, { useState, useEffect, useContext } from 'react';
import MDBReader from "mdb-reader";
/*export function useDataContext() {
    return useContext(DataContext);
}*/

export const DataContext = React.createContext({});

if (typeof Buffer === 'undefined') {
    global.Buffer = require('buffer/').Buffer;
}

function DataContextProvider({ children }) {

    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [selectedMeetRows, setSelectedMeetRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [meetTable, setMeetTable] = useState([]);
    const [resultsTable, setResultsTable] = useState([]);
    const [athletesTable, setAthletesTable] = useState([]);
    const [meetInfo, setMeetInfo] = useState(null);
    const [mainTabsValue, setMainTabsValue] = React.useState(1);

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
    const compareRawScores = (currentScore, currentScore_YD, comparedScore, comparedScore_YD) => {
        //currentScore would be at the current meet
        //currentScore_YD carries the imperial or metric from currentScore
        //comparedScore should be from a previous meet
        //comparedScore_YD carries the imperial or metric from comparedScore
        //Will return true if currentScore is better (less than)
        let currentScoreMetric, comparedScoreMetric, currentTime, comparedTime, deltaMilliseconds, deltaTime;
        if (currentScore < 0 && comparedScore < 0) {
            //This is a field event
            currentScoreMetric = convertRawScoreToMark(currentScore, currentScore_YD).rawMetric;
            comparedScoreMetric = convertRawScoreToMark(comparedScore, comparedScore_YD).rawMetric;
        } else {
            //This is a track event and is measured with time
            currentTime = convertRawScoreToMark(currentScore, currentScore_YD);
            comparedTime = convertRawScoreToMark(comparedScore, comparedScore_YD);
            deltaMilliseconds = (
                (currentTime.minutes - comparedTime.minutes) * 60000 +
                (currentTime.seconds - comparedTime.seconds) * 1000 +
                (currentTime.milliseconds - comparedTime.milliseconds)
            );
            deltaTime = convertRawScoreToMark(deltaMilliseconds, "milliseconds");
        }


        return {
            better: currentScoreMetric < comparedScoreMetric, //Used to denote the result in which it was measured in
            deltaMilliseconds: deltaMilliseconds,
            deltaTime: deltaTime,
        };

    }
    const findBestImprov = (baseResultRow) => {
        let diff = null;
        let bestTime = null;
        let bestRow = null;
        resultsTable.getData().forEach(selectedRow => {
            if (selectedRow.ATHLETE === baseResultRow.ATHLETE && selectedRow.DISTANCE === baseResultRow.DISTANCE) {
                if (!bestTime || selectedRow.SCORE < bestTime) {
                    bestTime = selectedRow.SCORE;
                    diff = compareRawScores(baseResultRow.SCORE, "M", selectedRow.SCORE, "M");
                    bestRow = selectedRow;
                }
            }
        });
        //console.log(convertRawScoreToMark(bestDiff.deltaMilliseconds));
        return { diff, bestRow };
    }
    const convertRawScoreToMark = (score, MARK_YD) => {
        //Score is the raw score from the database.
        //MARK_YD is either E for imperial or M for metric.
        let mark, convert, rawMetric;
        let minutes, seconds, milliseconds;
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

        }else if(MARK_YD==="milliseconds"){
            //This is a timed event which was scored in milliseconds.
            //Typically ran because the score was converted to milliseconds before this method
            let negative = score<0;
            if(negative){
                score*=-1; //We have to do calculations as postive.
            }
            minutes = Math.floor(score / 60000);
            seconds = Math.floor((score % 60000) / 1000);
            milliseconds = score % 1000;
            const showMinutes = minutes >= 1;
            mark = `${showMinutes ? `${minutes}:` : ''}${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
            if(negative){
                mark = "-"+mark;
            }
        }else {
            //Timed event
            const scoreInSeconds = score / 100;
            minutes = Math.floor(scoreInSeconds / 60);
            seconds = Math.floor(scoreInSeconds % 60);
            milliseconds = score % 100;
            const showMinutes = minutes >= 1;
            mark = `${showMinutes ? `${minutes}:` : ''}${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
        }
        return {
            mark: mark, //Used to denote the result in which it was measured in
            convert: convert, //Used to denote the result in which it was converted to
            rawMetric: rawMetric, //Use to help with calculating improvement
            minutes: minutes,
            seconds: seconds,
            milliseconds: milliseconds,
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
                let improve = findBestImprov(row).diff.deltaTime.mark;
                //console.log(improve);
                let eventName = '';
                let eventType = null;
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
                    IMPROVE: improve,
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
        { field: 'IMPROVE', headerName: 'Improvement', flex: 1 },
    ];

    //This is the data that I am willing to make public
    const IDataContext = {
        //lastNoteEvent: lastNoteEvent,
        handleFileDrop: handleFileDrop,
        fileName: fileName,
        meetTable: meetTable,
        mainTabsValue: mainTabsValue,
        handleMainTabsChange: handleMainTabsChange,
        meetTableWithId: meetTableWithId,
        meetTableColumns: meetTableColumns,
        openResultsTable: openResultsTable,
        handleClose: handleClose,
        meetInfo: meetInfo,
        selectedMeetRows: selectedMeetRows,
        resultsTableColumns: resultsTableColumns,
        athletesTableWithId: athletesTableWithId,
        athletesTableColumns: athletesTableColumns,
        loading: loading,
        open: open,
        //Whatever fields
    }
    const [state, setState] = useState(IDataContext);

    useEffect(() => {
        // Your data context initialization logic goes here
    }, []);

    return (
        <DataContext.Provider value={IDataContext}>
            {children}
        </DataContext.Provider>
    );
}

export default DataContextProvider;


