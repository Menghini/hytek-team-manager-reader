import React, { useState, useContext } from 'react';
import '../css/App.css';
import { styled } from '@mui/material/styles';
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
    Grid,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material/";
import { DataGrid } from '@mui/x-data-grid';
import { DataContext } from '../Contexts/DataContext';
import MeetsTab from './MeetsTab';
import { LocalPrintshopSharp } from '@mui/icons-material';



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
        returnPRs,
    } = useContext(DataContext);

    const Demo = styled('div')(({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
    }));

    function generate(element) {
        return [0, 1, 2].map((value) =>
            React.cloneElement(element, {
                key: value,
            }),
        );
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <TabContext value={meetResultsTabValue.toString()}>
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
                        <Paper sx={{ height: 500, width: '100%' }}>
                            <DataGrid rows={selectedMeetRows} columns={resultsTableColumns} getRowId={(row) => row.id} />
                        </Paper>
                    </DialogContent>
                </TabPanel>
                <TabPanel value="2">
                    {/*if the first tab is selected, then PR info will show up here*/}
                    <Paper sx={{ height: 564, width: '100%' }}>
                        <DialogContent>
                            <ul>
                                {selectedMeetRows.filter(row => row.IMPROVE.charAt(0) === '-').length > 0 ? (
                                    selectedMeetRows.map((row) => (
                                        (row.IMPROVE.charAt(0) === '-') &&
                                        <li key={row.id}>
                                            {`${row.FIRST} ${row.LAST} '${row.GRADYEAR} PRed in the ${row.EVENTNAME} with a PR of ${row.SCORE}`}
                                        </li>
                                    ))
                                ) : (
                                    <Typography sx={{ marginBottom: "8px" }}>No one PRed during this meet</Typography>
                                )}
                            </ul>
                        </DialogContent>
                    </Paper>
                </TabPanel>
            </TabContext>

            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog >
    );
}

export default MeetResults;