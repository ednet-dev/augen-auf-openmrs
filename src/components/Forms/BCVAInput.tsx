import React from 'react';
import { TextInput } from '@carbon/react';

/**
 * BCVA = Best Corrected Visual Acuity
 * Medical measurement in ophthalmology
 * Range: 0.0 (no vision) to 1.0 (perfect vision)
 * Standard: Decimal notation
 */

export interface BCVAInputProps {
  value: number | string | null | undefined;
  onChange: (value: number | string) => void;
  label?: string;
  disabled?: boolean;
  error?: string; // External error override
}

/**
 * Validates BCVA value against medical range (0.0-1.0)
 * @param value - The value to validate
 * @returns Error message if invalid, null if valid
 */
const validateBCVA = (value: number | string | null | undefined): string | null => {
  // Empty values are valid (not required by default)
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Convert to number if string
  const num = typeof value === 'string' ? parseFloat(value) : value;

  // Check if valid number
  if (isNaN(num)) {
    return 'Invalid number';
  }

  // Check range
  if (num < 0.0) {
    return 'BCVA must be ≥ 0.0';
  }

  if (num > 1.0) {
    return 'BCVA must be ≤ 1.0';
  }

  return null;
};

const BCVAInput: React.FC<BCVAInputProps> = ({
  value,
  onChange,
  label = 'BCVA',
  disabled = false,
  error: externalError,
}) => {
  // Normalize value for display
  const normalizeValue = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined) return '';
    return String(val);
  };

  // Get validation error (external error takes priority)
  const validationError = validateBCVA(value);
  const error = externalError || validationError;

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Try to convert to number, otherwise pass as string
    const numValue = parseFloat(inputValue);
    onChange(isNaN(numValue) ? inputValue : numValue);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <TextInput
        id="bcva-input"
        labelText={label}
        value={normalizeValue(value)}
        onChange={handleChange}
        disabled={disabled}
        invalid={!!error}
        invalidText={error || undefined}
      />
      {!error && (
        <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#525252' }}>
          decimal
        </div>
      )}
    </div>
  );
};

export default BCVAInput;
