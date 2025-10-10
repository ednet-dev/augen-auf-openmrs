import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Test utilities for OpenMRS module testing
 * Provides wrapper components and helper functions for consistent test setup
 */

interface WrapperProps {
  children: ReactNode;
}

/**
 * Default wrapper component for tests
 * Add providers (Context, Theme, etc.) as needed
 */
function TestWrapper({ children }: WrapperProps) {
  return <>{children}</>;
}

/**
 * Custom render function that includes common wrappers
 * Use this instead of @testing-library/react's render
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestWrapper, ...options });
}

/**
 * Mock patient data for testing
 */
export const mockPatients = [
  {
    uuid: 'patient-001',
    display: '002 - John Doe',
    identifiers: [{ identifier: '002', identifierType: { display: 'OpenMRS ID' } }],
    person: {
      display: 'John Doe',
      age: 65,
      gender: 'M',
      birthdate: '1958-01-01',
    },
  },
  {
    uuid: 'patient-002',
    display: '003 - Jane Smith',
    identifiers: [{ identifier: '003', identifierType: { display: 'OpenMRS ID' } }],
    person: {
      display: 'Jane Smith',
      age: 72,
      gender: 'F',
      birthdate: '1951-06-15',
    },
  },
  {
    uuid: 'patient-003',
    display: '005 - Bob Johnson',
    identifiers: [{ identifier: '005', identifierType: { display: 'OpenMRS ID' } }],
    person: {
      display: 'Bob Johnson',
      age: 58,
      gender: 'M',
      birthdate: '1965-12-20',
    },
  },
];

/**
 * Mock workflow stages for testing
 */
export const mockWorkflowStages = [
  'registration',
  'refraction',
  'eye-exam',
  'therapy',
  'pre-surgery',
  'surgery',
] as const;

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
