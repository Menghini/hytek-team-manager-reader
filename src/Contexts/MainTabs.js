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
import { DataContext } from './DataContext';



function MainTabs() {
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

export default MainTabs;