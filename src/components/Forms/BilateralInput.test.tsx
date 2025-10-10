import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../__tests__/test-utils';
import BilateralInput from './BilateralInput';

describe('BilateralInput', () => {
  const defaultProps = {
    label: 'Visual Acuity',
    leftValue: 0.8,
    rightValue: 0.6,
    onLeftChange: vi.fn(),
    onRightChange: vi.fn(),
    unit: 'decimal',
  };

  describe('rendering', () => {
    it('should render label', () => {
      renderWithProviders(<BilateralInput {...defaultProps} />);
      expect(screen.getByText('Visual Acuity')).toBeInTheDocument();
    });

    it('should render left eye input with label', () => {
      renderWithProviders(<BilateralInput {...defaultProps} />);
      expect(screen.getByLabelText(/left/i)).toBeInTheDocument();
    });

    it('should render right eye input with label', () => {
      renderWithProviders(<BilateralInput {...defaultProps} />);
      expect(screen.getByLabelText(/right/i)).toBeInTheDocument();
    });

    it('should display left value', () => {
      renderWithProviders(<BilateralInput {...defaultProps} />);
      const leftInput = screen.getByLabelText(/left/i) as HTMLInputElement;
      expect(leftInput.value).toBe('0.8');
    });

    it('should display right value', () => {
      renderWithProviders(<BilateralInput {...defaultProps} />);
      const rightInput = screen.getByLabelText(/right/i) as HTMLInputElement;
      expect(rightInput.value).toBe('0.6');
    });

    it('should display unit when provided', () => {
      renderWithProviders(<BilateralInput {...defaultProps} unit="dpt" />);
      expect(screen.getAllByText('dpt')).toHaveLength(2);
    });
  });

  describe('user interaction', () => {
    it('should call onLeftChange when left input changes', async () => {
      const user = userEvent.setup();
      const onLeftChange = vi.fn();

      renderWithProviders(
        <BilateralInput {...defaultProps} onLeftChange={onLeftChange} />
      );

      const leftInput = screen.getByLabelText(/left/i);
      await user.clear(leftInput);
      await user.type(leftInput, '0.9');

      expect(onLeftChange).toHaveBeenCalled();
    });

    it('should call onRightChange when right input changes', async () => {
      const user = userEvent.setup();
      const onRightChange = vi.fn();

      renderWithProviders(
        <BilateralInput {...defaultProps} onRightChange={onRightChange} />
      );

      const rightInput = screen.getByLabelText(/right/i);
      await user.clear(rightInput);
      await user.type(rightInput, '0.7');

      expect(onRightChange).toHaveBeenCalled();
    });
  });

  describe('copy functionality', () => {
    it('should render copy left to right button when onCopyLeftToRight provided', () => {
      renderWithProviders(
        <BilateralInput {...defaultProps} onCopyLeftToRight={vi.fn()} />
      );
      expect(screen.getByLabelText(/copy left to right/i)).toBeInTheDocument();
    });

    it('should render copy right to left button when onCopyRightToLeft provided', () => {
      renderWithProviders(
        <BilateralInput {...defaultProps} onCopyRightToLeft={vi.fn()} />
      );
      expect(screen.getByLabelText(/copy right to left/i)).toBeInTheDocument();
    });

    it('should call onCopyLeftToRight when copy button clicked', async () => {
      const user = userEvent.setup();
      const onCopyLeftToRight = vi.fn();

      renderWithProviders(
        <BilateralInput {...defaultProps} onCopyLeftToRight={onCopyLeftToRight} />
      );

      const copyButton = screen.getByLabelText(/copy left to right/i);
      await user.click(copyButton);

      expect(onCopyLeftToRight).toHaveBeenCalled();
    });

    it('should call onCopyRightToLeft when copy button clicked', async () => {
      const user = userEvent.setup();
      const onCopyRightToLeft = vi.fn();

      renderWithProviders(
        <BilateralInput {...defaultProps} onCopyRightToLeft={onCopyRightToLeft} />
      );

      const copyButton = screen.getByLabelText(/copy right to left/i);
      await user.click(copyButton);

      expect(onCopyRightToLeft).toHaveBeenCalled();
    });

    it('should not render copy buttons when handlers not provided', () => {
      renderWithProviders(<BilateralInput {...defaultProps} />);
      expect(screen.queryByLabelText(/copy/i)).not.toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should display validation error for left input', () => {
      renderWithProviders(
        <BilateralInput
          {...defaultProps}
          validation={(value) => (value > 1 ? 'Value must be ≤ 1.0' : null)}
          leftValue={1.5}
        />
      );
      expect(screen.getByText(/value must be ≤ 1.0/i)).toBeInTheDocument();
    });

    it('should display validation error for right input', () => {
      renderWithProviders(
        <BilateralInput
          {...defaultProps}
          validation={(value) => (value < 0 ? 'Value must be ≥ 0.0' : null)}
          rightValue={-0.1}
        />
      );
      expect(screen.getByText(/value must be ≥ 0.0/i)).toBeInTheDocument();
    });

    it('should not display error when validation passes', () => {
      renderWithProviders(
        <BilateralInput
          {...defaultProps}
          validation={(value) => (value > 1 ? 'Error' : null)}
        />
      );
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should disable both inputs when disabled prop is true', () => {
      renderWithProviders(<BilateralInput {...defaultProps} disabled />);

      const leftInput = screen.getByLabelText(/left/i) as HTMLInputElement;
      const rightInput = screen.getByLabelText(/right/i) as HTMLInputElement;

      expect(leftInput).toBeDisabled();
      expect(rightInput).toBeDisabled();
    });

    it('should disable copy buttons when disabled', () => {
      renderWithProviders(
        <BilateralInput
          {...defaultProps}
          disabled
          onCopyLeftToRight={vi.fn()}
          onCopyRightToLeft={vi.fn()}
        />
      );

      const copyButtons = screen.getAllByRole('button');
      copyButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('medical data handling', () => {
    it('should handle string values and convert to number', async () => {
      const user = userEvent.setup();
      const onLeftChange = vi.fn();

      renderWithProviders(
        <BilateralInput {...defaultProps} leftValue="0.8" onLeftChange={onLeftChange} />
      );

      const leftInput = screen.getByLabelText(/left/i) as HTMLInputElement;
      expect(leftInput.value).toBe('0.8');
    });

    it('should handle empty values', () => {
      renderWithProviders(
        <BilateralInput {...defaultProps} leftValue="" rightValue="" />
      );

      const leftInput = screen.getByLabelText(/left/i) as HTMLInputElement;
      const rightInput = screen.getByLabelText(/right/i) as HTMLInputElement;

      expect(leftInput.value).toBe('');
      expect(rightInput.value).toBe('');
    });

    it('should handle null values gracefully', () => {
      renderWithProviders(
        <BilateralInput
          {...defaultProps}
          leftValue={null as any}
          rightValue={null as any}
        />
      );

      const leftInput = screen.getByLabelText(/left/i) as HTMLInputElement;
      const rightInput = screen.getByLabelText(/right/i) as HTMLInputElement;

      expect(leftInput.value).toBe('');
      expect(rightInput.value).toBe('');
    });
  });
});
