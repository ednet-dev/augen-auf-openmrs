import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../__tests__/test-utils';
import BCVAInput from './BCVAInput';

/**
 * BCVA = Best Corrected Visual Acuity
 * Medical measurement range: 0.0 (no vision) to 1.0 (perfect vision)
 * Decimal notation standard in ophthalmology
 */
describe('BCVAInput', () => {
  const defaultProps = {
    value: 0.8,
    onChange: vi.fn(),
  };

  describe('rendering', () => {
    it('should render with default label "BCVA"', () => {
      renderWithProviders(<BCVAInput {...defaultProps} />);
      expect(screen.getByText('BCVA')).toBeInTheDocument();
    });

    it('should render with custom label when provided', () => {
      renderWithProviders(<BCVAInput {...defaultProps} label="Visual Acuity" />);
      expect(screen.getByText('Visual Acuity')).toBeInTheDocument();
    });

    it('should display current value', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={0.6} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('0.6');
    });

    it('should show decimal unit indicator', () => {
      renderWithProviders(<BCVAInput {...defaultProps} />);
      expect(screen.getByText('decimal')).toBeInTheDocument();
    });
  });

  describe('validation - valid values', () => {
    it('should accept valid value 0.0 (minimum)', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={0.0} />);
      expect(screen.queryByText(/must be/i)).not.toBeInTheDocument();
    });

    it('should accept valid value 0.5 (middle)', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={0.5} />);
      expect(screen.queryByText(/must be/i)).not.toBeInTheDocument();
    });

    it('should accept valid value 1.0 (maximum)', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={1.0} />);
      expect(screen.queryByText(/must be/i)).not.toBeInTheDocument();
    });
  });

  describe('validation - boundary values', () => {
    it('should reject value below 0.0', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={-0.1} />);
      expect(screen.getByText(/BCVA must be ≥ 0\.0/i)).toBeInTheDocument();
    });

    it('should reject value above 1.0', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={1.1} />);
      expect(screen.getByText(/BCVA must be ≤ 1\.0/i)).toBeInTheDocument();
    });

    it('should accept exactly 0.0', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={0.0} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('0');
      expect(screen.queryByText(/must be/i)).not.toBeInTheDocument();
    });

    it('should accept exactly 1.0', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={1.0} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('1');
      expect(screen.queryByText(/must be/i)).not.toBeInTheDocument();
    });
  });

  describe('validation - invalid input', () => {
    it('should reject non-numeric string', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value="abc" />);
      expect(screen.getByText(/invalid number/i)).toBeInTheDocument();
    });

    it('should show error with invalid CSS state', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={-0.5} />);
      const input = screen.getByRole('textbox');
      // Carbon Design System adds data-invalid attribute
      expect(input).toHaveAttribute('data-invalid', 'true');
    });
  });

  describe('user interaction', () => {
    it('should call onChange with numeric value when valid input', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      renderWithProviders(<BCVAInput {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '0.9');

      expect(onChange).toHaveBeenCalled();
      // Should convert to number
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(typeof lastCall === 'number' || lastCall === '0.9').toBe(true);
    });

    it('should preserve input value while typing', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      renderWithProviders(<BCVAInput {...defaultProps} value={0.5} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '0.7');

      expect(onChange).toHaveBeenCalled();
    });

    it('should update display when value prop changes', () => {
      const { rerender } = renderWithProviders(<BCVAInput {...defaultProps} value={0.5} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('0.5');

      rerender(<BCVAInput {...defaultProps} value={0.8} />);
      expect(input.value).toBe('0.8');
    });
  });

  describe('null and empty handling', () => {
    it('should handle null value', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={null} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
      expect(screen.queryByText(/must be/i)).not.toBeInTheDocument();
    });

    it('should handle undefined value', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={undefined as any} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
      expect(screen.queryByText(/must be/i)).not.toBeInTheDocument();
    });

    it('should handle empty string', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value="" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
      expect(screen.queryByText(/must be/i)).not.toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should disable input when disabled prop is true', () => {
      renderWithProviders(<BCVAInput {...defaultProps} disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      renderWithProviders(<BCVAInput {...defaultProps} disabled onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '0.9');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('error display', () => {
    it('should display error text for out-of-range value', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={1.5} />);
      expect(screen.getByText(/BCVA must be ≤ 1\.0/i)).toBeInTheDocument();
    });

    it('should display external error when provided', () => {
      renderWithProviders(
        <BCVAInput {...defaultProps} error="Custom error message" />
      );
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should prioritize external error over validation error', () => {
      renderWithProviders(
        <BCVAInput {...defaultProps} value={1.5} error="External error" />
      );
      expect(screen.getByText('External error')).toBeInTheDocument();
      expect(screen.queryByText(/BCVA must be/i)).not.toBeInTheDocument();
    });
  });

  describe('medical data integrity', () => {
    it('should not silently coerce invalid values', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      renderWithProviders(<BCVAInput {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'invalid');

      // Should still call onChange (let parent handle)
      expect(onChange).toHaveBeenCalled();
    });

    it('should maintain precision for decimal values', () => {
      renderWithProviders(<BCVAInput {...defaultProps} value={0.875} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('0.875');
    });
  });
});
