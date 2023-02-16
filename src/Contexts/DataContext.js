import React, { useState, useEffect, useContext } from 'react';

/*export function useDataContext() {
    return useContext(DataContext);
}*/

export const DataContext = React.createContext({});

function DataContextProvider({ children }) {
    
    const foo = useState("blah");

    const IDataContext = {
        //lastNoteEvent: lastNoteEvent,
        foo: foo,
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


