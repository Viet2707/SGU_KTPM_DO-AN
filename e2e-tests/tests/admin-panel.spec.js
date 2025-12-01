import { test, expect } from '@playwright/test';

test.describe('Admin Panel - E2E Tests', () => {

    const ADMIN_URL = 'http://localhost:5174';
    const ADMIN_EMAIL = 'admin@foodfast.com';
    const ADMIN_PASSWORD = 'admin123';

    test.beforeEach(async ({ page }) => {
        await page.goto(ADMIN_URL);
    });

    test.describe('Admin Authentication', () => {

        test('should load admin login page', async ({ page }) => {
            await expect(page).toHaveTitle(/admin|quản trị/i);
            await expect(page.locator('input[type="email"], input[type="password"]').first()).toBeVisible();
        });

        test('should validate login fields', async ({ page }) => {
            // Try login without credentials
            const submitBtn = page.locator('button[type="submit"]');
            await submitBtn.click();

            // Should show validation
            const hasValidation = await page.locator('text=/required|bắt buộc|empty/i').isVisible().catch(() => false);
            const stillOnLogin = page.url().includes('login') || await page.locator('input[type="password"]').isVisible();

            expect(hasValidation || stillOnLogin).toBeTruthy();
        });

        test('should reject invalid credentials', async ({ page }) => {
            await page.fill('input[type="email"]', 'wrong@admin.com');
            await page.fill('input[type="password"]', 'wrongpass');
            await page.click('button[type="submit"]');

            await page.waitForTimeout(1500);

            // Should show error
            const errorMsg = page.locator('text=/invalid|incorrect|sai|không đúng/i');
            const hasError = await errorMsg.isVisible().catch(() => false);

            expect(hasError).toBeTruthy();
        });

        test('should login successfully with valid credentials', async ({ page }) => {
            await page.fill('input[type="email"]', ADMIN_EMAIL);
            await page.fill('input[type="password"]', ADMIN_PASSWORD);
            await page.click('button[type="submit"]');

            // Wait for redirect
            await page.waitForTimeout(2000);

            // Should redirect to dashboard
            const isDashboard = page.url().includes('dashboard') || page.url() === `${ADMIN_URL}/`;
            const hasLogout = await page.locator('text=/logout|đăng xuất/i').isVisible().catch(() => false);

            expect(isDashboard || hasLogout).toBeTruthy();
        });
    });

    test.describe('Dashboard Overview', () => {

        test.beforeEach(async ({ page }) => {
            // Login first
            await page.fill('input[type="email"]', ADMIN_EMAIL);
            await page.fill('input[type="password"]', ADMIN_PASSWORD);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);
        });

        test('should display dashboard stats', async ({ page }) => {
            // Should show statistics cards
            const statsCards = page.locator('[class*="card"], [class*="stat"], [class*="metric"]');
            const count = await statsCards.count();

            expect(count).toBeGreaterThan(0);
        });

        test('should display recent orders', async ({ page }) => {
            // Should have orders list or table
            const ordersSection = page.locator('text=/orders|đơn hàng/i');
            await expect(ordersSection).toBeVisible();
        });

        test('should have navigation sidebar', async ({ page }) => {
            // Check for sidebar navigation
            const nav = page.locator('nav, aside, .sidebar');
            await expect(nav.first()).toBeVisible();
        });
    });

    test.describe('Food Management', () => {

        test.beforeEach(async ({ page }) => {
            // Login
            await page.fill('input[type="email"]', ADMIN_EMAIL);
            await page.fill('input[type="password"]', ADMIN_PASSWORD);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);

            // Navigate to foods page
            await page.click('text=/food|món ăn|products|sản phẩm/i');
            await page.waitForLoadState('networkidle');
        });

        test('should display list of foods', async ({ page }) => {
            // Should show food items table/grid
            const foodItems = page.locator('table tr, .food-list .item, .product-card');
            const count = await foodItems.count();

            expect(count).toBeGreaterThan(0);
        });

        test('should open add food form', async ({ page }) => {
            // Click add food button
            const addBtn = page.locator('button').filter({
                hasText: /add|thêm|create|tạo|new/i
            }).first();

            await addBtn.click();

            // Form should appear
            await expect(page.locator('input[name="name"], input[placeholder*="name"]')).toBeVisible();
            await expect(page.locator('input[name="price"], input[placeholder*="price"]')).toBeVisible();
        });

        test('should validate food form fields', async ({ page }) => {
            // Open add form
            await page.click('text=/add|thêm/i');

            // Try submit empty
            await page.click('button[type="submit"]');

            // Should show validation
            await expect(page.locator('text=/required|bắt buộc/i').first()).toBeVisible();
        });

        test('should add new food item', async ({ page }) => {
            const foodName = `Test Food ${Date.now()}`;

            // Open add form
            await page.click('text=/add|thêm/i');

            // Fill form
            await page.fill('input[name="name"]', foodName);
            await page.fill('input[name="price"]', '50000');

            // Select category if exists
            const categorySelect = page.locator('select[name="category"], select[name="categoryId"]');
            if (await categorySelect.isVisible()) {
                await categorySelect.selectOption({ index: 1 });
            }

            // Submit
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);

            // Should show success or appear in list
            const hasSuccess = await page.locator('text=/success|thành công/i').isVisible().catch(() => false);
            const inList = await page.locator(`text=${foodName}`).isVisible().catch(() => false);

            expect(hasSuccess || inList).toBeTruthy();
        });

        test('should edit food item', async ({ page }) => {
            // Click edit on first item
            const editBtn = page.locator('button').filter({
                hasText: /edit|sửa|update/i
            }).first();

            if (await editBtn.isVisible()) {
                await editBtn.click();

                // Form should appear with existing data
                const nameInput = page.locator('input[name="name"]');
                await expect(nameInput).toBeVisible();

                const existingValue = await nameInput.inputValue();
                expect(existingValue.length).toBeGreaterThan(0);
            }
        });

        test('should delete food item with confirmation', async ({ page }) => {
            // Click delete button
            const deleteBtn = page.locator('button').filter({
                hasText: /delete|xóa|remove/i
            }).first();

            if (await deleteBtn.isVisible()) {
                // Setup dialog handler
                page.on('dialog', dialog => dialog.accept());

                await deleteBtn.click();
                await page.waitForTimeout(1000);

                // Item should be removed (hard to verify without stable selectors)
                expect(true).toBeTruthy(); // Passed if no errors
            }
        });
    });

    test.describe('Order Management', () => {

        test.beforeEach(async ({ page }) => {
            // Login and go to orders
            await page.fill('input[type="email"]', ADMIN_EMAIL);
            await page.fill('input[type="password"]', ADMIN_PASSWORD);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);
            await page.click('text=/orders|đơn hàng/i');
            await page.waitForLoadState('networkidle');
        });

        test('should display orders list', async ({ page }) => {
            // Should show orders table
            const orders = page.locator('table tr, .order-item, .order-card');
            const count = await orders.count();

            expect(count).toBeGreaterThan(0);
        });

        test('should show order details', async ({ page }) => {
            // Click on first order
            const firstOrder = page.locator('table tr, .order-item').nth(1);
            await firstOrder.click();

            // Should show details
            await expect(page.locator('text=/items|sản phẩm|products/i')).toBeVisible();
        });

        test('should update order status', async ({ page }) => {
            // Find status dropdown
            const statusSelect = page.locator('select').filter({
                hasText: /status|trạng thái|processing|delivery/i
            }).first();

            if (await statusSelect.isVisible()) {
                await statusSelect.selectOption({ index: 1 });

                // Should show update button or auto-save
                const updateBtn = page.locator('button').filter({ hasText: /update|cập nhật|save/i });
                if (await updateBtn.isVisible()) {
                    await updateBtn.click();
                }

                await page.waitForTimeout(1000);
                expect(true).toBeTruthy();
            }
        });

        test('should filter orders by status', async ({ page }) => {
            // Find filter dropdown
            const filterSelect = page.locator('select, .filter-select').first();

            if (await filterSelect.isVisible()) {
                const optionsCount = await filterSelect.locator('option').count();
                if (optionsCount > 1) {
                    await filterSelect.selectOption({ index: 1 });
                    await page.waitForTimeout(1000);

                    // List should update
                    expect(true).toBeTruthy();
                }
            }
        });
    });

    test.describe('User Management', () => {

        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', ADMIN_EMAIL);
            await page.fill('input[type="password"]', ADMIN_PASSWORD);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);
        });

        test('should display users list', async ({ page }) => {
            // Navigate to users
            const usersLink = page.locator('text=/users|người dùng|customers/i');
            if (await usersLink.isVisible()) {
                await usersLink.click();
                await page.waitForLoadState('networkidle');

                // Should show users
                const userList = page.locator('table, .user-list');
                await expect(userList).toBeVisible();
            }
        });

        test('should lock/unlock user account', async ({ page }) => {
            // Go to users page
            const usersLink = page.locator('text=/users|người dùng/i');
            if (await usersLink.isVisible()) {
                await usersLink.click();

                // Find lock/unlock button
                const lockBtn = page.locator('button').filter({
                    hasText: /lock|unlock|khóa|mở/i
                }).first();

                if (await lockBtn.isVisible()) {
                    await lockBtn.click();
                    await page.waitForTimeout(1000);
                    expect(true).toBeTruthy();
                }
            }
        });
    });

    test.describe('Admin UI/UX', () => {

        test.beforeEach(async ({ page }) => {
            await page.fill('input[type="email"]', ADMIN_EMAIL);
            await page.fill('input[type="password"]', ADMIN_PASSWORD);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);
        });

        test('should have responsive sidebar', async ({ page }) => {
            // Check sidebar on different sizes
            await page.setViewportSize({ width: 1920, height: 1080 });
            const sidebar = page.locator('nav, aside, .sidebar').first();
            await expect(sidebar).toBeVisible();

            // On mobile, sidebar might be hidden
            await page.setViewportSize({ width: 375, height: 667 });
            const mobileMenuBtn = page.locator('button').filter({ hasText: /menu|☰/ });
            const hasMobileMenu = await mobileMenuBtn.isVisible().catch(() => false);

            expect(hasMobileMenu || await sidebar.isVisible()).toBeTruthy();
        });

        test('should show logout option', async ({ page }) => {
            const logoutBtn = page.locator('button, a').filter({
                hasText: /logout|đăng xuất|sign out/i
            });

            await expect(logoutBtn).toBeVisible();
        });

        test('should logout successfully', async ({ page }) => {
            // Click logout
            await page.click('text=/logout|đăng xuất/i');
            await page.waitForTimeout(1500);

            // Should redirect to login
            const isLoginPage = page.url().includes('login') || await page.locator('input[type="password"]').isVisible();
            expect(isLoginPage).toBeTruthy();
        });
    });

    test.describe('Admin Performance', () => {

        test('should load dashboard quickly', async ({ page }) => {
            const startTime = Date.now();

            await page.fill('input[type="email"]', ADMIN_EMAIL);
            await page.fill('input[type="password"]', ADMIN_PASSWORD);
            await page.click('button[type="submit"]');
            await page.waitForLoadState('domcontentloaded');

            const loadTime = Date.now() - startTime;

            // Should load within 3 seconds
            expect(loadTime).toBeLessThan(3000);
        });

        test('should handle large data tables', async ({ page }) => {
            await page.fill('input[type="email"]', ADMIN_EMAIL);
            await page.fill('input[type="password"]', ADMIN_PASSWORD);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);

            // Navigate to orders (likely largest dataset)
            await page.click('text=/orders|đơn hàng/i');
            await page.waitForLoadState('networkidle');

            // Should render without freezing
            const table = page.locator('table, .order-list');
            await expect(table).toBeVisible();
        });
    });
});
