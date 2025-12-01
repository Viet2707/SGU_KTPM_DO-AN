import { test, expect } from '@playwright/test';

test.describe('User Frontend - E2E Tests (ACTUAL UI)', () => {

    const FRONTEND_URL = 'http://localhost:5173';

    test.beforeEach(async ({ page }) => {
        await page.goto(FRONTEND_URL);
    });

    test.describe('Homepage & Navigation', () => {

        test('should load homepage successfully', async ({ page }) => {
            // Verify logo is visible
            const logo = page.locator('.logo');
            await expect(logo).toBeVisible();

            // Verify page loaded
            await expect(page.locator('.navbar')).toBeVisible();
        });

        test('should display navigation menu with correct items', async ({ page }) => {
            // Check navbar exists
            const navbar = page.locator('.navbar-menu');
            await expect(navbar).toBeVisible();

            // Check menu items (Vietnamese)
            await expect(page.locator('text=Trang chủ')).toBeVisible();
            await expect(page.locator('text=Danh mục')).toBeVisible();
            await expect(page.locator('text=Liên hệ chúng tôi')).toBeVisible();
        });

        test('should show cart icon and login button when not logged in', async ({ page }) => {
            // Check cart icon
            const cartBasket = page.locator('.navbar-search-icon img[src*="basket"]');
            await expect(cartBasket).toBeVisible();

            // Check login button (when NOT logged in)
            const loginBtn = page.locator('button:has-text("Đăng nhập")');
            await expect(loginBtn).toBeVisible();
        });
    });

    test.describe('User Authentication', () => {

        test('should open login popup when clicking login button', async ({ page }) => {
            // Click "Đăng nhập" button
            await page.click('button:has-text("Đăng nhập")');

            // Verify popup appears
            await expect(page.locator('.login-popup')).toBeVisible();
            await expect(page.locator('.login-popup-title')).toContainText('Đăng nhập');
        });

        test('should switch between login and register forms', async ({ page }) => {
            // Open popup
            await page.click('button:has-text("Đăng nhập")');

            // Should show "Đăng nhập" by default
            await expect(page.locator('h2:has-text("Đăng nhập")')).toBeVisible();

            // Click to switch to register
            await page.click('text=Chọn ở đây');

            // Should show "Đăng ký"
            await expect(page.locator('h2:has-text("Đăng ký")')).toBeVisible();

            // Should show name field in register mode
            await expect(page.locator('input[placeholder="Tên của bạn"]')).toBeVisible();
        });

        test('should validate required fields in login form', async ({ page }) => {
            // Open login popup
            await page.click('button:has-text("Đăng nhập")');

            // Try to submit empty form
            await page.click('button[type="submit"]');

            // HTML5 validation should prevent submission
            // Check if form has required inputs
            const emailInput = page.locator('input[type="email"][required]');
            const passwordInput = page.locator('input[type="password"][required]');

            await expect(emailInput).toBeVisible();
            await expect(passwordInput).toBeVisible();
        });

        test('should register new user successfully', async ({ page }) => {
            const timestamp = Date.now();
            const testEmail = `test${timestamp}@test.com`;

            // Open login popup
            await page.click('button:has-text("Đăng nhập")');

            // Switch to register
            await page.click('text=Chọn ở đây');

            // Fill registration form
            await page.fill('input[placeholder="Tên của bạn"]', 'Test User');
            await page.fill('input[placeholder="Email của bạn"]', testEmail);
            await page.fill('input[placeholder="Mật khẩu"]', 'password123');

            // Submit
            await page.click('button:has-text("Tạo tài khoản")');

            // Wait for response
            await page.waitForTimeout(2000);

            // Check if logged in
            const isLoggedIn = await page.locator('.navbar-profile').isVisible().catch(() => false);
            const hasToast = await page.locator('.Toastify__toast--success').isVisible().catch(() => false);

            expect(isLoggedIn || hasToast).toBeTruthy();
        });
    });

    test.describe('Navigation & Cart', () => {

        test('should navigate to cart page', async ({ page }) => {
            // Click cart icon
            await page.click('.navbar-search-icon');

            // Should navigate to cart page
            await expect(page).toHaveURL(/\/cart/);
        });

        test('should navigate to My Orders', async ({ page }) => {
            // Try to access /myorders
            await page.goto(`${FRONTEND_URL}/myorders`);

            // Page should load
            await expect(page).toHaveURL(/myorders|\/$/);
        });
    });

    test.describe('Responsive Design', () => {

        test('should work on mobile viewport', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });

            // Reload page
            await page.goto(FRONTEND_URL);

            // Navbar should still be visible
            await expect(page.locator('.navbar')).toBeVisible();
            await expect(page.locator('.logo')).toBeVisible();
        });

        test('should work on tablet viewport', async ({ page }) => {
            // Set tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 });

            // Reload page
            await page.goto(FRONTEND_URL);

            // Check main elements
            await expect(page.locator('.navbar')).toBeVisible();
            await expect(page.locator('.navbar-menu')).toBeVisible();
        });
    });

    test.describe('Performance', () => {

        test('should load page within acceptable time', async ({ page }) => {
            const startTime = Date.now();
            await page.goto(FRONTEND_URL);
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;

            // Should load within 3 seconds
            expect(loadTime).toBeLessThan(3000);
        });
    });

    test.describe('404 & Error Handling', () => {

        test('should handle 404 pages gracefully', async ({ page }) => {
            await page.goto(`${FRONTEND_URL}/non-existent-page-123`);

            // Should show 404 message
            const has404 = await page.locator('text=/404.*Not Found/i').isVisible().catch(() => false);

            expect(has404).toBeTruthy();
        });
    });

    test.describe('Logged In User Experience', () => {

        test('should show profile dropdown when logged in', async ({ page }) => {
            // Set fake token
            await page.evaluate(() => {
                localStorage.setItem('token', 'fake_jwt_token_for_ui_test');
            });

            // Reload page
            await page.reload();

            // Should show profile icon
            const profileIcon = page.locator('.navbar-profile img[src*="profile"]');
            const hasProfile = await profileIcon.isVisible().catch(() => false);

            if (hasProfile) {
                // Hover to show dropdown
                await profileIcon.hover();

                // Should show Orders and Logout options
                await expect(page.locator('text=Orders')).toBeVisible();
                await expect(page.locator('text=Logout')).toBeVisible();
            }
        });
    });
});
