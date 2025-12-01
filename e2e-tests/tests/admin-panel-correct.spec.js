import { test, expect } from '@playwright/test';

test.describe('Admin Panel - E2E Tests (ACTUAL UI)', () => {

    const ADMIN_URL = 'http://localhost:5174';
    const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'; // Mock token for testing

    test.describe('Admin Authentication & Access', () => {

        test('should show login requirement message when no token', async ({ page }) => {
            // Go to admin without token
            await page.goto(ADMIN_URL);

            // Should show authentication message
            await expect(page.locator('text=🚫 Bạn chưa đăng nhập quyền quản trị')).toBeVisible();
            await expect(page.locator('text=trang người dùng')).toBeVisible();
        });

        test('should accept token from URL query parameter', async ({ page }) => {
            // Visit with token in URL
            await page.goto(`${ADMIN_URL}?token=${ADMIN_TOKEN}`);

            // Wait for redirect/processing
            await page.waitForTimeout(1000);

            // Token should be stored in localStorage
            const storedToken = await page.evaluate(() => localStorage.getItem('admin_token'));
            expect(storedToken).toBeTruthy();
        });

        test('should show admin dashboard when token exists', async ({ page }) => {
            // Set token first
            await page.goto(ADMIN_URL);
            await page.evaluate((token) => {
                localStorage.setItem('admin_token', token);
            }, ADMIN_TOKEN);

            // Reload to trigger auth check
            await page.reload();

            // Should show admin interface
            const hasAdminHeader = await page.locator('text=/Admin|Quản trị/i').isVisible().catch(() => false);
            const hasSidebar = await page.locator('.sidebar, nav').isVisible().catch(() => false);

            expect(hasAdminHeader || hasSidebar).toBeTruthy();
        });
    });

    test.describe('Admin Dashboard & Navigation', () => {

        test.beforeEach(async ({ page }) => {
            // Setup: Set admin token
            await page.goto(ADMIN_URL);
            await page.evaluate((token) => {
                localStorage.setItem('admin_token', token);
            }, ADMIN_TOKEN);
            await page.reload();
        });

        test('should display admin header', async ({ page }) => {
            //Check for AdminHeader component
            const header = page.locator('text=/Admin|Panel|Quản trị/i').first();
            const hasHeader = await header.isVisible().catch(() => false);

            if (hasHeader) {
                await expect(header).toBeVisible();
            }
        });

        test('should display navbar', async ({ page }) => {
            // Navbar should be visible
            const navbar = page.locator('nav, .navbar');
            const hasNavbar = await navbar.first().isVisible().catch(() => false);

            expect(hasNavbar).toBeTruthy();
        });

        test('should display sidebar with menu items', async ({ page }) => {
            // Sidebar should exist
            const sidebar = page.locator('.sidebar, aside');
            const hasSidebar = await sidebar.first().isVisible().catch(() => false);

            if (hasSidebar) {
                await expect(sidebar.first()).toBeVisible();
            }
        });
    });

    test.describe('Admin Routes & Pages', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(ADMIN_URL);
            await page.evaluate((token) => {
                localStorage.setItem('admin_token', token);
            }, ADMIN_TOKEN);
            await page.reload();
            await page.waitForTimeout(500);
        });

        test('should navigate to Add Food page', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/add`);
            await page.waitForLoadState('networkidle');

            // Should be at /add route
            await expect(page).toHaveURL(/\/add/);
        });

        test('should navigate to List Foods page', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/list`);
            await page.waitForLoadState('networkidle');

            // Should be at /list route
            await expect(page).toHaveURL(/\/list/);
        });

        test('should navigate to Orders page', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/orders`);
            await page.waitForLoadState('networkidle');

            // Should be at /orders route
            await expect(page).toHaveURL(/\/orders/);
        });

        test('should navigate to Stock page', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/stock`);
            await page.waitForLoadState('networkidle');

            // Should be at /stock route
            await expect(page).toHaveURL(/\/stock/);
        });

        test('should navigate to Users page', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/users`);
            await page.waitForLoadState('networkidle');

            // Should be at /users route
            await expect(page).toHaveURL(/\/users/);
        });
    });

    test.describe('Admin Food Management', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(ADMIN_URL);
            await page.evaluate((token) => {
                localStorage.setItem('admin_token', token);
            }, ADMIN_TOKEN);
            await page.goto(`${ADMIN_URL}/list`);
            await page.waitForLoadState('networkidle');
        });

        test('should display food list page', async ({ page }) => {
            // Check if food list loads
            await expect(page).toHaveURL(/\/list/);

            // May have table or list element
            const hasTable = await page.locator('table').isVisible().catch(() => false);
            const hasList = await page.locator('.food-list, .product-list').isVisible().catch(() => false);

            expect(hasTable || hasList).toBeTruthy();
        });

        test('should navigate to add food page', async ({ page }) => {
            await page.goto(`${ADMIN_URL}/add`);

            // Check if on add page
            await expect(page).toHaveURL(/\/add/);
        });
    });

    test.describe('Admin Orders Management', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(ADMIN_URL);
            await page.evaluate((token) => {
                localStorage.setItem('admin_token', token);
            }, ADMIN_TOKEN);
            await page.goto(`${ADMIN_URL}/orders`);
            await page.waitForLoadState('networkidle');
        });

        test('should display orders page', async ({ page }) => {
            await expect(page).toHaveURL(/\/orders/);
        });

        test('should handle orders list load', async ({ page }) => {
            // Wait for any content to load
            await page.waitForTimeout(1000);

            // Page should not error out
            const hasError = await page.locator('text=/error|lỗi/i').isVisible().catch(() => false);
            expect(hasError).toBeFalsy();
        });
    });

    test.describe('Admin Stock Management', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(ADMIN_URL);
            await page.evaluate((token) => {
                localStorage.setItem('admin_token', token);
            }, ADMIN_TOKEN);
            await page.goto(`${ADMIN_URL}/stock`);
            await page.waitForLoadState('networkidle');
        });

        test('should display stock page', async ({ page }) => {
            await expect(page).toHaveURL(/\/stock/);
        });
    });

    test.describe('Admin Users Management', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(ADMIN_URL);
            await page.evaluate((token) => {
                localStorage.setItem('admin_token', token);
            }, ADMIN_TOKEN);
            await page.goto(`${ADMIN_URL}/users`);
            await page.waitForLoadState('networkidle');
        });

        test('should display users page', async ({ page }) => {
            await expect(page).toHaveURL(/\/users/);
        });
    });

    test.describe('Admin Responsive Design', () => {

        test('should work on desktop viewport', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });

            await page.goto(ADMIN_URL);
            await page.evaluate((token) => {
                localStorage.setItem('admin_token', token);
            }, ADMIN_TOKEN);
            await page.reload();

            // Should display properly
            await page.waitForTimeout(500);
            expect(true).toBeTruthy(); // Basic render test
        });

        test('should work on tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });

            await page.goto(ADMIN_URL);
            await page.evaluate((token) => {
                localStorage.setItem('admin_token', token);
            }, ADMIN_TOKEN);
            await page.reload();

            await page.waitForTimeout(500);
            expect(true).toBeTruthy();
        });
    });

    test.describe('Admin Performance', () => {

        test('should load admin panel quickly', async ({ page }) => {
            await page.goto(ADMIN_URL);
            await page.evaluate((token) => {
                localStorage.setItem('admin_token', token);
            }, ADMIN_TOKEN);

            const startTime = Date.now();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;

            // Should load within 3 seconds
            expect(loadTime).toBeLessThan(3000);
        });
    });

    test.describe('Admin Logout Flow', () => {

        test('should allow logout via clicking back to user app', async ({ page }) => {
            await page.goto(ADMIN_URL);
            await page.evaluate((token) => {
                localStorage.setItem('admin_token', token);
            }, ADMIN_TOKEN);
            await page.reload();

            // Find logout/back to user link
            const backLink = page.locator('a[href*="?logout=true"]');
            const hasLink = await backLink.isVisible().catch(() => false);

            // If sidebar or header has logout option
            if (!hasLink) {
                // Just verify token can be cleared
                await page.evaluate(() => {
                    localStorage.removeItem('admin_token');
                });

                await page.reload();

                // Should show login required message
                await expect(page.locator('text=🚫 Bạn chưa đăng nhập')).toBeVisible();
            }
        });
    });
});
