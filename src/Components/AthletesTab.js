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



function AthletesTab() {
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
    );
}

export default AthletesTab;