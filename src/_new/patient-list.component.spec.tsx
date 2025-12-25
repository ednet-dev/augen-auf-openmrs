import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PatientList } from './patient-list.component';
import { Patient } from '@openmrs/esm-framework';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

describe('PatientList', () => {
  const mockPatient1: Patient = {
    uuid: 'patient-1',
    display: 'John Doe',
    identifiers: [],
    person: {
      uuid: 'person-1',
      display: 'John Doe',
      gender: 'M',
      age: 30,
      birthdate: '1994-01-01',
      birthdateEstimated: false,
      dead: false,
      deathDate: null,
      causeOfDeath: null,
      preferredName: {
        uuid: 'name-1',
        display: 'John Doe',
        givenName: 'John',
        familyName: 'Doe',
      },
      preferredAddress: null,
      attributes: [],
      voided: false,
      deathdateEstimated: false,
      birthtime: null,
    },
  };

  const mockPatient2: Patient = {
    uuid: 'patient-2',
    display: 'Jane Smith',
    identifiers: [],
    person: {
      uuid: 'person-2',
      display: 'Jane Smith',
      gender: 'F',
      age: 25,
      birthdate: '1999-01-01',
      birthdateEstimated: false,
      dead: false,
      deathDate: null,
      causeOfDeath: null,
      preferredName: {
        uuid: 'name-2',
        display: 'Jane Smith',
        givenName: 'Jane',
        familyName: 'Smith',
      },
      preferredAddress: null,
      attributes: [],
      voided: false,
      deathdateEstimated: false,
      birthtime: null,
    },
  };

  it('should render loading state when isLoading is true', () => {
    render(
      <PatientList 
        patients={[]} 
        selectedPatient={null} 
        isLoading={true} 
      />
    );

    expect(screen.getByText('Loading patients...')).toBeInTheDocument();
  });

  it('should render error state when error is provided', () => {
    const testError = new Error('Network connection failed');
    
    render(
      <PatientList 
        patients={[]} 
        selectedPatient={null} 
        error={testError}
      />
    );

    expect(screen.getByText('Failed to load patients')).toBeInTheDocument();
    expect(screen.getByText('Network connection failed')).toBeInTheDocument();
  });

  it('should render default error message when error has no message', () => {
    const testError = new Error();
    
    render(
      <PatientList 
        patients={[]} 
        selectedPatient={null} 
        error={testError}
      />
    );

    expect(screen.getByText('Failed to load patients')).toBeInTheDocument();
    expect(screen.getByText('An error occurred while loading the patient queue')).toBeInTheDocument();
  });

  it('should render empty state when no patients are provided', () => {
    render(
      <PatientList 
        patients={[]} 
        selectedPatient={null} 
      />
    );

    expect(screen.getByText('No patients in queue')).toBeInTheDocument();
    expect(screen.getByText('There are currently no patients waiting in this stage')).toBeInTheDocument();
  });

  it('should render list of patients when patients are provided', () => {
    render(
      <PatientList 
        patients={[mockPatient1, mockPatient2]} 
        selectedPatient={null} 
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should render Patients header', () => {
    render(
      <PatientList 
        patients={[]} 
        selectedPatient={null} 
      />
    );

    expect(screen.getByText('Patients')).toBeInTheDocument();
  });

  it('should call onPatientSelect when a patient is clicked', async () => {
    const user = userEvent.setup();
    const onPatientSelect = jest.fn();

    render(
      <PatientList 
        patients={[mockPatient1, mockPatient2]} 
        selectedPatient={null} 
        onPatientSelect={onPatientSelect}
      />
    );

    await user.click(screen.getByText('John Doe'));

    expect(onPatientSelect).toHaveBeenCalledTimes(1);
    expect(onPatientSelect).toHaveBeenCalledWith(mockPatient1);
  });

  it('should call onPatientSelect with correct patient when different patients are clicked', async () => {
    const user = userEvent.setup();
    const onPatientSelect = jest.fn();

    render(
      <PatientList 
        patients={[mockPatient1, mockPatient2]} 
        selectedPatient={null} 
        onPatientSelect={onPatientSelect}
      />
    );

    await user.click(screen.getByText('Jane Smith'));

    expect(onPatientSelect).toHaveBeenCalledTimes(1);
    expect(onPatientSelect).toHaveBeenCalledWith(mockPatient2);
  });

  it('should not call onPatientSelect when it is not provided', async () => {
    const user = userEvent.setup();

    render(
      <PatientList 
        patients={[mockPatient1]} 
        selectedPatient={null} 
      />
    );

    // Should not throw error when clicking
    await user.click(screen.getByText('John Doe'));
  });

  it('should prioritize loading state over error state', () => {
    const testError = new Error('Some error');
    
    render(
      <PatientList 
        patients={[]} 
        selectedPatient={null} 
        isLoading={true}
        error={testError}
      />
    );

    expect(screen.getByText('Loading patients...')).toBeInTheDocument();
    expect(screen.queryByText('Failed to load patients')).not.toBeInTheDocument();
  });

  it('should prioritize error state over empty state', () => {
    const testError = new Error('Some error');
    
    render(
      <PatientList 
        patients={[]} 
        selectedPatient={null} 
        error={testError}
      />
    );

    expect(screen.getByText('Failed to load patients')).toBeInTheDocument();
    expect(screen.queryByText('No patients in queue')).not.toBeInTheDocument();
  });

  it('should show patients when not loading and no error', () => {
    render(
      <PatientList 
        patients={[mockPatient1]} 
        selectedPatient={null} 
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Loading patients...')).not.toBeInTheDocument();
    expect(screen.queryByText('Failed to load patients')).not.toBeInTheDocument();
  });

  it('should render multiple patients correctly', () => {
    const mockPatient3: Patient = {
      uuid: 'patient-3',
      display: 'Bob Johnson',
      identifiers: [],
      person: {
        uuid: 'person-3',
        display: 'Bob Johnson',
        gender: 'M',
        age: 45,
        birthdate: '1979-01-01',
        birthdateEstimated: false,
        dead: false,
        deathDate: null,
        causeOfDeath: null,
        preferredName: {
          uuid: 'name-3',
          display: 'Bob Johnson',
          givenName: 'Bob',
          familyName: 'Johnson',
        },
        preferredAddress: null,
        attributes: [],
        voided: false,
        deathdateEstimated: false,
        birthtime: null,
      },
    };

    render(
      <PatientList 
        patients={[mockPatient1, mockPatient2, mockPatient3]} 
        selectedPatient={null} 
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should handle selectedPatient prop', () => {
    render(
      <PatientList 
        patients={[mockPatient1, mockPatient2]} 
        selectedPatient={mockPatient1} 
      />
    );

    // Both patients should be rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should allow selecting multiple patients in sequence', async () => {
    const user = userEvent.setup();
    const onPatientSelect = jest.fn();

    render(
      <PatientList 
        patients={[mockPatient1, mockPatient2]} 
        selectedPatient={null} 
        onPatientSelect={onPatientSelect}
      />
    );

    await user.click(screen.getByText('John Doe'));
    await user.click(screen.getByText('Jane Smith'));

    expect(onPatientSelect).toHaveBeenCalledTimes(2);
    expect(onPatientSelect).toHaveBeenNthCalledWith(1, mockPatient1);
    expect(onPatientSelect).toHaveBeenNthCalledWith(2, mockPatient2);
  });
});
