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



function MeetResults() {
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
    } = useContext(DataContext);
    return (
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
    );
}

export default MeetResults;