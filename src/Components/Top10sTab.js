import React, { useState, useContext } from 'react';
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
    } = useContext(DataContext);
    return (

        <Paper sx={{ height: '70vh', width: '100%' }}>
            <h1>Top 10 Marks Per Event</h1>
            <div className='Top10s'>
                <h1>EventName</h1>
                <ul>
                    <li>SCORE LAST, FIRST</li>
                    <li>SCORE LAST, FIRST</li>
                    <li>SCORE LAST, FIRST</li>
                    <li>SCORE LAST, FIRST</li>
                    <li>SCORE LAST, FIRST</li>
                    <li>SCORE LAST, FIRST</li>
                    <li>SCORE LAST, FIRST</li>
                    <li>SCORE LAST, FIRST</li>
                    <li>SCORE LAST, FIRST</li>
                    <li>SCORE LAST, FIRST</li>
                    <li>SCORE LAST, FIRST</li>
                </ul>
            </div>
        </Paper>

    );
}

export default Top10sTab;
