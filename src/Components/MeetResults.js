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
                        <div style={{ height: 500, width: '100%' }}>
                            <DataGrid rows={selectedMeetRows} columns={resultsTableColumns} getRowId={(row) => row.id} />
                        </div>
                    </DialogContent>
                </TabPanel>
                <TabPanel value="2">
                    {/*if the first tab is selected, then PR info will show up here*/}
                    <DialogContent>
                        <Grid container spacing={0}>
                            <Grid item xs={12} md={6}>
                                <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                                    The following people PRed:
                                </Typography>
                                <Demo>
                                    {/*console.log(selectedMeetRows)*/}
                                    <List dense={true}>
                                        {selectedMeetRows.filter(row => row.IMPROVE.charAt(0) === '-').length > 0 ? (
                                            selectedMeetRows.map((row) => (
                                                (row.IMPROVE.charAt(0) === '-') &&
                                                <ListItem key={row.id}>
                                                    <ListItemText primary={`${row.FIRST} ${row.LAST} PRed in the ${row.EVENTNAME} with a PR of ${row.SCORE}`} />
                                                </ListItem>
                                            ))
                                        ) : (
                                            <ListItem>
                                                <ListItemText primary="No one PRed during this meet" />
                                            </ListItem>
                                        )}
                                    </List>

                                </Demo>
                            </Grid>

                        </Grid>
                    </DialogContent>
                </TabPanel>
            </TabContext>

            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog >
    );
}

export default MeetResults;