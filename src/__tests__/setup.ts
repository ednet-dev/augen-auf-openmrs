import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock SCSS imports
vi.mock('*.scss', () => ({
  default: {},
}));

// Mock OpenMRS ESM Framework
vi.mock('@openmrs/esm-framework', () => ({
  openmrsFetch: vi.fn(),
  useConfig: vi.fn(() => ({})),
  createErrorHandler: vi.fn(),
  showNotification: vi.fn(),
  showToast: vi.fn(),
  useSession: vi.fn(() => ({
    authenticated: true,
    sessionId: 'test-session-id',
    currentProvider: { uuid: 'provider-uuid', display: 'Test Provider' },
    sessionLocation: { uuid: 'location-uuid', display: 'Test Location' },
    user: { uuid: 'user-uuid', display: 'Test User' },
  })),
  usePatient: vi.fn(),
  navigate: vi.fn(),
  interpolateUrl: vi.fn((url: string) => url),
  formatDate: vi.fn((date: Date) => date.toLocaleDateString()),
  parseDate: vi.fn((dateString: string) => new Date(dateString)),
}));

// Mock Carbon React components that might cause issues in tests
vi.mock('@carbon/react', async () => {
  const actual = await vi.importActual('@carbon/react');
  return {
    ...actual,
    // Override specific components if needed
  };
});
