import React, { useState, useContext, useEffect } from 'react';
import '../css/App.css';
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
import { DataContext } from '../Contexts/DataContext';
import MeetsTab from './MeetsTab';



function Top10sTab() {
    const { handleFileDrop,
        fileName,
        meetTable,
        mainTabsValue,
        handleMainTabsChange,
        meetTableWithId,
        meetTableColumns,
        openResultsTable,
        handleClose,
        meetInfo,
        selectedMeetRows,
        resultsTableColumns,
        athletesTableWithId,
        athletesTableColumns,
        loading,
        open,
        gatherTop10Results,
        top10ResultsByEvent,
    } = useContext(DataContext);
    useEffect(() => {
        gatherTop10Results();
    }, []);
    return (
        <Paper sx={{ height: '70vh', width: '100%', overflow: 'auto', padding: '25px' }}>
            <h1>Top 10 Marks Per Event</h1>
            {Object.entries(top10ResultsByEvent).map(([eventName, rows]) => (
                <div className='Top10s' key={eventName}>
                    <h2>{eventName}</h2>
                    <ul>
                        {rows.map((row) => (
                            <li key={row.id}>
                                {`${row.SCORE} ${row.LAST}, ${row.FIRST}`}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </Paper>
    );
}

export default Top10sTab;
