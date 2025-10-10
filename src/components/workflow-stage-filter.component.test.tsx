import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkflowStageFilter from './workflow-stage-filter.component';
import { renderWithProviders, mockWorkflowStages } from '../__tests__/test-utils';
import { WorkflowStage } from '../types';

describe('WorkflowStageFilter', () => {
  const mockStages: WorkflowStage[] = [
    { id: 'registration', label: 'Registration', color: '#0f62fe' },
    { id: 'refraction', label: 'Refraction', color: '#24a148' },
    { id: 'eye-exam', label: 'Eye Exam', color: '#8a3ffc' },
    { id: 'therapy', label: 'Therapy', color: '#ff832b' },
    { id: 'finished', label: 'Finished', color: '#6f6f6f' },
  ];

  const defaultProps = {
    stages: mockStages,
    selectedStage: 'all' as const,
    onStageSelect: vi.fn(),
  };

  it('should render "Show All" button', () => {
    renderWithProviders(<WorkflowStageFilter {...defaultProps} />);

    expect(screen.getByText('Show All')).toBeInTheDocument();
  });

  it('should render all workflow stages', () => {
    renderWithProviders(<WorkflowStageFilter {...defaultProps} />);

    expect(screen.getByText(/Registration/)).toBeInTheDocument();
    expect(screen.getByText(/Refraction/)).toBeInTheDocument();
    expect(screen.getByText(/Eye Exam/)).toBeInTheDocument();
    expect(screen.getByText(/Therapy/)).toBeInTheDocument();
    expect(screen.getByText(/Finished/)).toBeInTheDocument();
  });

  it('should render "Needs surgery" button', () => {
    renderWithProviders(<WorkflowStageFilter {...defaultProps} />);

    expect(screen.getByText(/Needs surgery/)).toBeInTheDocument();
  });

  it('should call onStageSelect when "Show All" is clicked', async () => {
    const user = userEvent.setup();
    const onStageSelect = vi.fn();

    renderWithProviders(
      <WorkflowStageFilter {...defaultProps} onStageSelect={onStageSelect} />
    );

    await user.click(screen.getByText('Show All'));

    expect(onStageSelect).toHaveBeenCalledWith('all');
  });

  it('should call onStageSelect when a workflow stage is clicked', async () => {
    const user = userEvent.setup();
    const onStageSelect = vi.fn();

    renderWithProviders(
      <WorkflowStageFilter {...defaultProps} onStageSelect={onStageSelect} />
    );

    await user.click(screen.getByText(/Registration/));

    expect(onStageSelect).toHaveBeenCalledWith('registration');
  });

  it('should call onStageSelect when "Needs surgery" is clicked', async () => {
    const user = userEvent.setup();
    const onStageSelect = vi.fn();

    renderWithProviders(
      <WorkflowStageFilter {...defaultProps} onStageSelect={onStageSelect} />
    );

    await user.click(screen.getByText(/Needs surgery/));

    expect(onStageSelect).toHaveBeenCalledWith('needs-surgery');
  });

  it('should highlight the selected stage', () => {
    renderWithProviders(
      <WorkflowStageFilter {...defaultProps} selectedStage="registration" />
    );

    const registrationTile = screen.getByText(/Registration/).closest('.cds--tile');
    expect(registrationTile).toBeInTheDocument();
    expect(registrationTile).toHaveClass('cds--tile');
  });

  it('should highlight "Show All" when it is selected', () => {
    renderWithProviders(
      <WorkflowStageFilter {...defaultProps} selectedStage="all" />
    );

    const showAllTile = screen.getByText('Show All').closest('.cds--tile');
    expect(showAllTile).toBeInTheDocument();
    expect(showAllTile).toHaveClass('cds--tile');
  });

  it('should highlight "Needs surgery" when it is selected', () => {
    renderWithProviders(
      <WorkflowStageFilter {...defaultProps} selectedStage="needs-surgery" />
    );

    const needsSurgeryTile = screen.getByText(/Needs surgery/).closest('.cds--tile');
    expect(needsSurgeryTile).toBeInTheDocument();
    expect(needsSurgeryTile).toHaveClass('cds--tile');
  });

  it('should apply border color style to stage tiles', () => {
    renderWithProviders(<WorkflowStageFilter {...defaultProps} />);

    const registrationTile = screen.getByText(/Registration/).closest('.cds--tile');
    expect(registrationTile).toHaveStyle({ borderLeftColor: '#0f62fe' });
  });
});
