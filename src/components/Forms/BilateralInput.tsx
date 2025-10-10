import React from 'react';
import { TextInput, Button } from '@carbon/react';
import { ArrowRight, ArrowLeft } from '@carbon/icons-react';

export interface BilateralInputProps {
  label: string;
  leftValue: number | string;
  rightValue: number | string;
  onLeftChange: (value: number | string) => void;
  onRightChange: (value: number | string) => void;
  onCopyLeftToRight?: () => void;
  onCopyRightToLeft?: () => void;
  unit?: string;
  validation?: (value: number | string) => string | null;
  disabled?: boolean;
}

const BilateralInput: React.FC<BilateralInputProps> = ({
  label,
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
  onCopyLeftToRight,
  onCopyRightToLeft,
  unit,
  validation,
  disabled = false,
}) => {
  // Handle null/undefined values
  const normalizeValue = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  // Get validation error for a value
  const getError = (value: number | string): string | undefined => {
    if (!validation) return undefined;
    const error = validation(value);
    return error || undefined;
  };

  const leftError = getError(leftValue);
  const rightError = getError(rightValue);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'start' }}>
        {/* Left eye input */}
        <div>
          <TextInput
            id={`${label}-left`}
            labelText="Left"
            value={normalizeValue(leftValue)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              // Try to convert to number, otherwise keep as string
              const numValue = parseFloat(value);
              onLeftChange(isNaN(numValue) ? value : numValue);
            }}
            disabled={disabled}
            invalid={!!leftError}
            invalidText={leftError}
          />
          {unit && !leftError && (
            <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#525252' }}>
              {unit}
            </div>
          )}
        </div>

        {/* Copy buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '1.5rem' }}>
          {onCopyLeftToRight && (
            <Button
              kind="ghost"
              size="sm"
              hasIconOnly
              iconDescription="Copy left to right"
              tooltipPosition="top"
              onClick={onCopyLeftToRight}
              disabled={disabled}
              aria-label="Copy left to right"
            >
              <ArrowRight />
            </Button>
          )}
          {onCopyRightToLeft && (
            <Button
              kind="ghost"
              size="sm"
              hasIconOnly
              iconDescription="Copy right to left"
              tooltipPosition="top"
              onClick={onCopyRightToLeft}
              disabled={disabled}
              aria-label="Copy right to left"
            >
              <ArrowLeft />
            </Button>
          )}
        </div>

        {/* Right eye input */}
        <div>
          <TextInput
            id={`${label}-right`}
            labelText="Right"
            value={normalizeValue(rightValue)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              const numValue = parseFloat(value);
              onRightChange(isNaN(numValue) ? value : numValue);
            }}
            disabled={disabled}
            invalid={!!rightError}
            invalidText={rightError}
          />
          {unit && !rightError && (
            <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#525252' }}>
              {unit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BilateralInput;
