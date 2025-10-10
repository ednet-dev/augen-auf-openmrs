import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, fireEvent } from '../../../__tests__/test-utils';
import VisitTypeSelector from '../VisitTypeSelector';

describe('VisitTypeSelector', () => {
  const defaultProps = {
    value: null,
    onChange: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render dropdown with label', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} />);

      expect(screen.getByText('Visit Type')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} label="Select Visit Type" />);

      expect(screen.getByText('Select Visit Type')).toBeInTheDocument();
    });

    it('should show placeholder text when no selection', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} />);

      expect(screen.getByText('Choose visit type')).toBeInTheDocument();
    });

    it('should display all visit type options', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} />);

      const dropdown = screen.getByRole('combobox');
      fireEvent.click(dropdown);

      expect(screen.getByText('Facility Visit')).toBeInTheDocument();
      expect(screen.getByText('Home Visit')).toBeInTheDocument();
      expect(screen.getByText('OPD')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should call onChange when option selected', () => {
      const onChange = vi.fn();
      renderWithProviders(<VisitTypeSelector {...defaultProps} onChange={onChange} />);

      const dropdown = screen.getByRole('combobox');
      fireEvent.click(dropdown);

      const facilityOption = screen.getByText('Facility Visit');
      fireEvent.click(facilityOption);

      expect(onChange).toHaveBeenCalledWith('Facility Visit');
    });

    it('should display selected value', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} value="Home Visit" />);

      expect(screen.getByDisplayValue('Home Visit')).toBeInTheDocument();
    });

    it('should handle OPD selection', () => {
      const onChange = vi.fn();
      renderWithProviders(<VisitTypeSelector {...defaultProps} onChange={onChange} />);

      const dropdown = screen.getByRole('combobox');
      fireEvent.click(dropdown);

      const opdOption = screen.getByText('OPD');
      fireEvent.click(opdOption);

      expect(onChange).toHaveBeenCalledWith('OPD');
    });

    it('should clear selection when placeholder chosen', () => {
      const onChange = vi.fn();
      renderWithProviders(<VisitTypeSelector {...defaultProps} value="Facility Visit" onChange={onChange} />);

      const dropdown = screen.getByRole('combobox');
      fireEvent.click(dropdown);

      const placeholderOption = screen.getByText('Choose visit type');
      fireEvent.click(placeholderOption);

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Disabled State', () => {
    it('should render disabled dropdown', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} disabled />);

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeDisabled();
    });

    it('should not call onChange when disabled', () => {
      const onChange = vi.fn();
      renderWithProviders(<VisitTypeSelector {...defaultProps} onChange={onChange} disabled />);

      const dropdown = screen.getByRole('combobox');
      fireEvent.click(dropdown);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should display error state when error provided', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} error="Visit type is required" />);

      expect(screen.getByText('Visit type is required')).toBeInTheDocument();
    });

    it('should show invalid styling when error exists', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} error="Required field" />);

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not show error when value is valid', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} value="Facility Visit" />);

      expect(screen.queryByText('Visit type is required')).not.toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('should display helper text when provided', () => {
      renderWithProviders(
        <VisitTypeSelector {...defaultProps} helperText="Select the type of visit to start" />
      );

      expect(screen.getByText('Select the type of visit to start')).toBeInTheDocument();
    });

    it('should hide helper text when error shown', () => {
      renderWithProviders(
        <VisitTypeSelector
          {...defaultProps}
          helperText="Helper text"
          error="Error message"
        />
      );

      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} />);

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toHaveAccessibleName('Visit Type');
    });

    it('should support keyboard navigation', () => {
      const onChange = vi.fn();
      renderWithProviders(<VisitTypeSelector {...defaultProps} onChange={onChange} />);

      const dropdown = screen.getByRole('combobox');

      // Open with keyboard
      fireEvent.keyDown(dropdown, { key: 'Enter' });
      expect(screen.getByText('Facility Visit')).toBeVisible();

      // Navigate with arrow keys
      fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
      fireEvent.keyDown(dropdown, { key: 'Enter' });

      expect(onChange).toHaveBeenCalled();
    });

    it('should have aria-required when required prop set', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} required />);

      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('OpenMRS Integration', () => {
    it('should map visit types to OpenMRS concept values', () => {
      const onChange = vi.fn();
      renderWithProviders(<VisitTypeSelector {...defaultProps} onChange={onChange} />);

      const dropdown = screen.getByRole('combobox');
      fireEvent.click(dropdown);

      const facilityOption = screen.getByText('Facility Visit');
      fireEvent.click(facilityOption);

      // Should return human-readable string, not UUID
      expect(onChange).toHaveBeenCalledWith('Facility Visit');
      expect(onChange).not.toHaveBeenCalledWith(expect.stringContaining('-')); // Not a UUID
    });

    it('should accept OpenMRS visit type from props', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} value="Facility Visit" />);

      expect(screen.getByDisplayValue('Facility Visit')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null value gracefully', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} value={null} />);

      expect(screen.getByText('Choose visit type')).toBeInTheDocument();
    });

    it('should handle undefined value gracefully', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} value={undefined as any} />);

      expect(screen.getByText('Choose visit type')).toBeInTheDocument();
    });

    it('should handle empty string value', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} value="" />);

      expect(screen.getByText('Choose visit type')).toBeInTheDocument();
    });

    it('should not crash with invalid visit type', () => {
      renderWithProviders(<VisitTypeSelector {...defaultProps} value="Invalid Type" as any />);

      // Should still render, maybe showing invalid value or placeholder
      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeInTheDocument();
    });
  });
});
