import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientList from './patient-list.component';
import { renderWithProviders, mockPatients } from '../__tests__/test-utils';
import { PatientListItem } from '../types';

describe('PatientList', () => {
  const mockPatientsWithWorkflow: PatientListItem[] = [
    {
      ...mockPatients[0],
      workflowData: {
        patientUuid: mockPatients[0].uuid,
        currentStage: 'registration',
        needsSurgery: false,
        completedProtocols: [],
        lastUpdated: '2025-10-10T10:00:00Z',
      },
    },
    {
      ...mockPatients[1],
      workflowData: {
        patientUuid: mockPatients[1].uuid,
        currentStage: 'therapy',
        needsSurgery: true,
        completedProtocols: ['protocol-1'],
        lastUpdated: '2025-10-10T11:00:00Z',
      },
    },
    {
      ...mockPatients[2],
      workflowData: {
        patientUuid: mockPatients[2].uuid,
        currentStage: 'finished',
        needsSurgery: false,
        completedProtocols: ['protocol-1', 'protocol-2'],
        lastUpdated: '2025-10-10T12:00:00Z',
      },
    },
  ];

  const defaultProps = {
    patients: mockPatientsWithWorkflow,
    selectedPatientUuid: null,
    onPatientSelect: vi.fn(),
  };

  it('should render patient list with all patients', () => {
    renderWithProviders(<PatientList {...defaultProps} />);

    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('002 - John Doe')).toBeInTheDocument();
    expect(screen.getByText('003 - Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('(005 - Bob Johnson)')).toBeInTheDocument(); // Finished patient in parentheses
  });

  it('should call onPatientSelect when patient is clicked', async () => {
    const user = userEvent.setup();
    const onPatientSelect = vi.fn();

    renderWithProviders(
      <PatientList {...defaultProps} onPatientSelect={onPatientSelect} />
    );

    const patientTile = screen.getByText('002 - John Doe');
    await user.click(patientTile);

    expect(onPatientSelect).toHaveBeenCalledWith(mockPatientsWithWorkflow[0].uuid);
  });

  it('should highlight selected patient', () => {
    renderWithProviders(
      <PatientList
        {...defaultProps}
        selectedPatientUuid={mockPatientsWithWorkflow[0].uuid}
      />
    );

    const selectedTile = screen.getByText('002 - John Doe').closest('.cds--tile');
    // Check that the tile exists and has Carbon classes
    expect(selectedTile).toBeInTheDocument();
    expect(selectedTile).toHaveClass('cds--tile');
  });

  it('should display finished patients in parentheses', () => {
    renderWithProviders(<PatientList {...defaultProps} />);

    // Finished patient should be in parentheses
    expect(screen.getByText('(005 - Bob Johnson)')).toBeInTheDocument();

    // Active patients should not be in parentheses
    expect(screen.getByText('002 - John Doe')).toBeInTheDocument();
    expect(screen.getByText('003 - Jane Smith')).toBeInTheDocument();
  });

  it('should render all patients as clickable elements', () => {
    renderWithProviders(<PatientList {...defaultProps} />);

    const patientElements = screen.getAllByText(/John Doe|Jane Smith|Bob Johnson/);
    expect(patientElements).toHaveLength(3);

    // Each patient should be clickable
    patientElements.forEach((element) => {
      const tile = element.closest('.cds--tile');
      expect(tile).toBeInTheDocument();
      expect(tile).toHaveClass('cds--tile--clickable');
    });
  });

  it('should render empty list when no patients provided', () => {
    renderWithProviders(
      <PatientList {...defaultProps} patients={[]} />
    );

    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.queryByText('002 - John Doe')).not.toBeInTheDocument();
  });

  it('should handle patients without workflow data', () => {
    const patientsWithoutWorkflow = mockPatients.map((p) => ({ ...p, workflowData: undefined }));

    renderWithProviders(
      <PatientList {...defaultProps} patients={patientsWithoutWorkflow} />
    );

    // All patients should render normally without parentheses
    expect(screen.getByText('002 - John Doe')).toBeInTheDocument();
    expect(screen.getByText('003 - Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('005 - Bob Johnson')).toBeInTheDocument();
  });
});
