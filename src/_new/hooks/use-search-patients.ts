import React from "react";
import { searchPatients } from "../patient-service";
import { useAsyncData } from "./use-async-data";
import { Patient } from "@openmrs/esm-framework/src";

export const useSearchPatients = () => {
    const [query, setQuery] = React.useState<string>('');

    const fetchFunction = React.useCallback(
        () => searchPatients(query),
        [query]
    );
    
    const { data, isLoading, error, refresh } = useAsyncData<Patient[]>(
        fetchFunction
    );
    
    return { 
        setQuery,
        patients: data ?? [], 
        isLoading, 
        error, 
        refresh 
    };
}