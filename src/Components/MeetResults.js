import React, { useState, useContext } from 'react';
import '../css/App.css';
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

    const [meetResultsTabValue, setMeetResultsTabValue] = React.useState(1);

    const handleMeetResultsTabsChange = (event, newValue) => {
        //This code is ran once to set the tabs to the first tab.
        setMeetResultsTabValue(newValue);
    };


    React.useEffect(() => {
        setMeetResultsTabValue("1");
    }, []);

    const { handleFileDrop,
        fileName,
        meetTable,
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
            <TabContext value={meetResultsTabValue}>
                <DialogTitle>{meetInfo !== null ? meetInfo.meetName + " Results on " + new Date(meetInfo.meetDate).toLocaleDateString('en-US', { timeZone: 'UTC' }) : "No Meet Results"}</DialogTitle>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleMeetResultsTabsChange} aria-label="lab API tabs example">
                        <Tab label="Meet Results" value="1" />
                        <Tab label="PRs" value="2" />
                    </TabList>
                </Box>
                <TabPanel value="1">
                    {/*if the first tab is selected, then the meet results will show up here*/}
                    <DialogContent>
                        <DialogContentText>Table showing athletes, distances, scores, and results for the selected meet.</DialogContentText>
                        <div style={{ height: 500, width: '100%' }}>
                            <DataGrid rows={selectedMeetRows} columns={resultsTableColumns} getRowId={(row) => row.id} />
                        </div>
                    </DialogContent>
                </TabPanel>
                <TabPanel value="2">
                    {/*if the first tab is selected, then PR info will show up here*/}
                    <DialogContentText>PRs will be listed here</DialogContentText>
                </TabPanel>
            </TabContext>

            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default MeetResults;