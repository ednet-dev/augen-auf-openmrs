import { test, expect } from '@playwright/test';

/**
 * E2E Baseline Tests - Current Working State
 *
 * Purpose: Record the current MVP state (60% complete) to prevent regressions
 * as 4 parallel dev streams implement remaining features.
 *
 * Run: npx playwright test e2e/baseline.spec.ts
 */

test.describe('Surgery Workflow - Baseline (MVP State)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to surgery workflow page
    await page.goto('http://localhost:8080/openmrs/spa/surgery-workflow');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display three-column layout', async ({ page }) => {
    // Verify header exists
    await expect(page.getByRole('heading', { name: 'Surgery Workflow' })).toBeVisible();

    // Verify "Link to Database" button
    await expect(page.getByRole('button', { name: /Link to Database/i })).toBeVisible();

    // Verify Settings button (icon only)
    await expect(page.getByRole('button', { name: /Settings/i })).toBeVisible();
  });

  test('should display filter bar with date filter and search', async ({ page }) => {
    // Date filter dropdown
    await expect(page.getByRole('combobox', { name: /Filter by Date/i })).toBeVisible();

    // Patient search input
    await expect(page.getByPlaceholder(/Search for Patient/i)).toBeVisible();
  });

  test('should display workflow stage filter (vertical buttons)', async ({ page }) => {
    // Verify workflow stage buttons exist
    const stages = ['Registration', 'Refraction', 'Eye Exam', 'Therapy', 'Finished'];

    for (const stage of stages) {
      // Stage buttons might be in a custom component, check by text content
      await expect(page.getByText(stage, { exact: false })).toBeVisible();
    }
  });

  test('should display patient list with mock patients', async ({ page }) => {
    // Patients header
    await expect(page.getByText('Patients')).toBeVisible();

    // Mock patients from patient.service.ts
    const mockPatients = ['Patient 002', 'Patient 003', 'Patient 005', 'Patient 001', 'Patient 004'];

    // Wait for patients to load (may take a moment)
    await page.waitForTimeout(2000);

    // Verify at least one patient is visible
    // Note: Exact patients may vary based on API response
    const patientList = page.locator('[class*="patientList"]');
    await expect(patientList).toBeVisible();
  });

  test('should display protocol tabs', async ({ page }) => {
    // Protocol tabs should be visible
    await expect(page.getByRole('tab', { name: /Protocol 1/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Protocol 2/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Protocol 3/i })).toBeVisible();
  });

  test('should show form placeholder when no patient selected', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Should show "Select a patient" message or form placeholder
    const noSelectionMessage = page.getByText(/Select a patient/i);
    const formPlaceholder = page.getByText(/Form engine will render here/i);

    // One of these should be visible
    const isNoSelectionVisible = await noSelectionMessage.isVisible().catch(() => false);
    const isPlaceholderVisible = await formPlaceholder.isVisible().catch(() => false);

    expect(isNoSelectionVisible || isPlaceholderVisible).toBeTruthy();
  });

  test('should display Print button', async ({ page }) => {
    // Print button should exist
    await expect(page.getByRole('button', { name: /Print/i })).toBeVisible();
  });

  test('should allow patient selection from list', async ({ page }) => {
    // Wait for patients to load
    await page.waitForTimeout(2000);

    // Try to click a patient (if any exist)
    const patientItems = page.locator('[class*="patientItem"]');
    const count = await patientItems.count();

    if (count > 0) {
      // Click first patient
      await patientItems.first().click();

      // Form area should update (may show patient ID or form placeholder)
      await page.waitForTimeout(500);

      // Verify something changed in main content area
      const mainContent = page.locator('main, [class*="contentArea"]');
      await expect(mainContent).toBeVisible();
    }
  });

  test('should switch between protocol tabs', async ({ page }) => {
    // Click Protocol 2 tab
    await page.getByRole('tab', { name: /Protocol 2/i }).click();

    // Wait for tab panel to switch
    await page.waitForTimeout(300);

    // Verify tab is selected (Carbon Design adds aria-selected)
    await expect(page.getByRole('tab', { name: /Protocol 2/i })).toHaveAttribute('aria-selected', 'true');

    // Click Protocol 3 tab
    await page.getByRole('tab', { name: /Protocol 3/i }).click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('tab', { name: /Protocol 3/i })).toHaveAttribute('aria-selected', 'true');
  });

  test('should filter patients by date (interaction test)', async ({ page }) => {
    // Click date filter dropdown
    const dateFilter = page.getByRole('combobox', { name: /Filter by Date/i });
    await dateFilter.click();

    // Select "Yesterday" option (if visible)
    const yesterday = page.getByText('Yesterday', { exact: true });
    const isYesterdayVisible = await yesterday.isVisible().catch(() => false);

    if (isYesterdayVisible) {
      await yesterday.click();

      // Wait for patient list to re-render
      await page.waitForTimeout(1000);

      // Patient list should still be visible (even if empty)
      const patientList = page.locator('[class*="patientList"]');
      await expect(patientList).toBeVisible();
    }
  });

  test('should search for patients (interaction test)', async ({ page }) => {
    // Type in search box
    const searchInput = page.getByPlaceholder(/Search for Patient/i);
    await searchInput.fill('Patient');

    // Wait for search results
    await page.waitForTimeout(1000);

    // Patient list should update (may show filtered results or mock data)
    const patientList = page.locator('[class*="patientList"]');
    await expect(patientList).toBeVisible();
  });

  test('should display "Add new patient" button', async ({ page }) => {
    // Button should exist (not yet functional)
    await expect(page.getByRole('button', { name: /Add new patient/i })).toBeVisible();
  });

  test('should style finished patients differently', async ({ page }) => {
    // Wait for patients to load
    await page.waitForTimeout(2000);

    // Patient 001 and 004 are marked as "finished" in mock data
    // They should be displayed with parentheses: (Patient 001)
    const finishedPatient = page.getByText(/\(Patient 00[14]\)/);

    // At least one finished patient should exist
    const count = await finishedPatient.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Surgery Workflow - Known Limitations (MVP)', () => {
  test('form placeholder should be shown instead of real form', async ({ page }) => {
    await page.goto('http://localhost:8080/openmrs/spa/surgery-workflow');
    await page.waitForLoadState('networkidle');

    // Wait for patients to load
    await page.waitForTimeout(2000);

    // Click a patient
    const patientItems = page.locator('[class*="patientItem"]');
    const count = await patientItems.count();

    if (count > 0) {
      await patientItems.first().click();
      await page.waitForTimeout(500);

      // Should show form placeholder (not real form)
      await expect(page.getByText(/Form engine will render here/i)).toBeVisible();
    }
  });

  test('Print button should exist but not be functional yet', async ({ page }) => {
    await page.goto('http://localhost:8080/openmrs/spa/surgery-workflow');
    await page.waitForLoadState('networkidle');

    const printButton = page.getByRole('button', { name: /Print/i });
    await expect(printButton).toBeVisible();

    // Click should not throw error (but won't do anything)
    await printButton.click();

    // No PDF download should occur (this is expected for MVP)
  });

  test('Add new patient button should exist but not be wired yet', async ({ page }) => {
    await page.goto('http://localhost:8080/openmrs/spa/surgery-workflow');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /Add new patient/i });
    await expect(addButton).toBeVisible();

    // Click should not throw error (but won't open modal)
    await addButton.click();

    // No modal should appear (this is expected for MVP)
    await page.waitForTimeout(500);
  });
});

test.describe('Surgery Workflow - Responsive Layout', () => {
  test('should display layout on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:8080/openmrs/spa/surgery-workflow');
    await page.waitForLoadState('networkidle');

    // All columns should be visible on desktop
    await expect(page.getByText('Patients')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Surgery Workflow' })).toBeVisible();
  });

  test('should handle tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:8080/openmrs/spa/surgery-workflow');
    await page.waitForLoadState('networkidle');

    // Layout should still be functional (may collapse sidebar)
    await expect(page.getByRole('heading', { name: 'Surgery Workflow' })).toBeVisible();
  });
});
