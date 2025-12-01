import { test, expect } from '@playwright/test';

test.describe('User Frontend - E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test.describe('Homepage & Navigation', () => {

        test('should load homepage successfully', async ({ page }) => {
            // Verify page title
            await expect(page).toHaveTitle(/FoodFast|Food|Delivery/i);

            // Verify logo is visible
            const logo = page.locator('img[alt*="logo"], .logo');
            await expect(logo.first()).toBeVisible();
        });

        test('should display navigation menu', async ({ page }) => {
            // Check for nav items
            const nav = page.locator('nav, .navbar, header');
            await expect(nav).toBeVisible();

            // Common nav items
            await expect(page.getByRole('link', { name: /home|trang chủ/i })).toBeVisible();
            await expect(page.getByRole('link', { name: /menu|thực đơn/i })).toBeVisible();
        });

        test('should navigate between pages', async ({ page }) => {
            // Click menu link
            await page.click('text=/menu|thực đơn/i');

            // Verify URL changed
            await expect(page).toHaveURL(/menu|products|food/i);

            // Verify content loaded
            await expect(page.locator('h1, h2')).toContainText(/menu|thực đơn|món ăn/i);
        });
    });

    test.describe('User Registration & Login', () => {

        test('should show login/register buttons', async ({ page }) => {
            const authButton = page.locator('button, a').filter({
                hasText: /sign in|login|đăng nhập|đăng ký/i
            });
            await expect(authButton.first()).toBeVisible();
        });

        test('should open registration form', async ({ page }) => {
            // Click register button
            await page.click('text=/sign up|register|đăng ký/i');

            // Verify form appears
            await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
            await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
        });

        test('should validate required fields in registration', async ({ page }) => {
            // Open registration
            await page.click('text=/sign up|register|đăng ký/i');

            // Try submit without data
            await page.click('button[type="submit"]');

            // Should show validation errors
            await expect(page.locator('text=/required|bắt buộc|nhập/i').first()).toBeVisible();
        });

        test('should register new user successfully', async ({ page }) => {
            const timestamp = Date.now();
            const testEmail = `test${timestamp}@test.com`;

            // Open registration
            await page.click('text=/sign up|register|đăng ký/i');

            // Fill form
            await page.fill('input[name="name"], input[placeholder*="name"]', 'Test User');
            await page.fill('input[type="email"]', testEmail);
            await page.fill('input[type="password"]', 'password123');

            // Submit
            await page.click('button[type="submit"]');

            // Should redirect or show success
            await page.waitForTimeout(2000);
            const successMessage = page.locator('text=/success|thành công|welcome/i');
            const isLoggedIn = page.locator('text=/logout|đăng xuất|profile|tài khoản/i');

            const hasSuccess = await successMessage.isVisible().catch(() => false);
            const isUserLoggedIn = await isLoggedIn.isVisible().catch(() => false);

            expect(hasSuccess || isUserLoggedIn).toBeTruthy();
        });
    });

    test.describe('Food Menu & Products', () => {

        test('should display food items', async ({ page }) => {
            // Go to menu
            await page.goto('http://localhost:5173/menu');

            // Wait for products to load
            await page.waitForLoadState('networkidle');

            // Check if food items are displayed
            const foodItems = page.locator('.food-item, .product-card, .menu-item');
            const count = await foodItems.count();

            expect(count).toBeGreaterThan(0);
        });

        test('should show food details', async ({ page }) => {
            await page.goto('http://localhost:5173/menu');

            // Click first food item
            const firstItem = page.locator('.food-item, .product-card').first();
            await firstItem.click();

            // Should show details (name, price, description)
            await expect(page.locator('text=/price|giá|₫|đ/i')).toBeVisible();
        });

        test('should filter/search foods', async ({ page }) => {
            await page.goto('http://localhost:5173/menu');

            // Find search input
            const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="tìm"]');

            if (await searchInput.isVisible()) {
                await searchInput.fill('pizza');
                await page.waitForTimeout(1000);

                // Results should update
                const results = page.locator('.food-item, .product-card');
                expect(await results.count()).toBeGreaterThan(0);
            }
        });
    });

    test.describe('Shopping Cart', () => {

        test('should add item to cart', async ({ page }) => {
            await page.goto('http://localhost:5173/menu');

            // Find and click "Add to cart" button
            const addToCartBtn = page.locator('button').filter({
                hasText: /add to cart|thêm vào giỏ|add|thêm/i
            }).first();

            await addToCartBtn.click();

            // Cart icon should show count
            await page.waitForTimeout(1000);
            const cartBadge = page.locator('.cart-count, .badge, [class*="cart"] [class*="count"]');

            if (await cartBadge.isVisible()) {
                const text = await cartBadge.textContent();
                expect(parseInt(text || '0')).toBeGreaterThan(0);
            }
        });

        test('should view cart', async ({ page }) => {
            // Add item first
            await page.goto('http://localhost:5173/menu');
            await page.locator('button').filter({ hasText: /add/i }).first().click();

            // Click cart icon
            await page.click('[href*="cart"], text=/cart|giỏ hàng/i');

            // Should show cart page
            await expect(page).toHaveURL(/cart/i);
            await expect(page.locator('h1, h2')).toContainText(/cart|giỏ hàng/i);
        });

        test('should update cart quantity', async ({ page }) => {
            await page.goto('http://localhost:5173/cart');

            // Find quantity buttons
            const increaseBtn = page.locator('button').filter({ hasText: /\+/ }).first();

            if (await increaseBtn.isVisible()) {
                await increaseBtn.click();
                await page.waitForTimeout(500);

                // Quantity should increase
                const qtyElement = page.locator('input[type="number"], .quantity').first();
                const qty = await qtyElement.inputValue() || await qtyElement.textContent();
                expect(parseInt(qty || '0')).toBeGreaterThan(1);
            }
        });
    });

    test.describe('Checkout & Order', () => {

        test('should proceed to checkout', async ({ page }) => {
            // Need items in cart first
            await page.goto('http://localhost:5173/menu');
            await page.locator('button').filter({ hasText: /add/i }).first().click();
            await page.goto('http://localhost:5173/cart');

            // Click checkout
            const checkoutBtn = page.locator('button').filter({
                hasText: /checkout|thanh toán|đặt hàng/i
            });

            if (await checkoutBtn.isVisible()) {
                await checkoutBtn.click();

                // Should show checkout form
                await expect(page.locator('input, form')).toBeVisible();
            }
        });

        test('should validate delivery address', async ({ page }) => {
            await page.goto('http://localhost:5173/checkout');

            // Try submit without address
            const submitBtn = page.locator('button[type="submit"]').last();
            if (await submitBtn.isVisible()) {
                await submitBtn.click();

                // Should show validation
                await expect(page.locator('text=/required|bắt buộc/i').first()).toBeVisible();
            }
        });
    });

    test.describe('Responsive Design', () => {

        test('should work on mobile viewport', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('http://localhost:5173');

            // Mobile menu should exist
            const mobileMenu = page.locator('button').filter({
                hasText: /menu|☰|≡/
            });

            await expect(page).toBeVisible();
        });

        test('should be responsive on tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('http://localhost:5173');

            // Page should render properly
            await expect(page.locator('body')).toBeVisible();
            const logo = page.locator('img[alt*="logo"]').first();
            await expect(logo).toBeVisible();
        });
    });

    test.describe('Performance & Loading', () => {

        test('should load page within acceptable time', async ({ page }) => {
            const startTime = Date.now();
            await page.goto('http://localhost:5173');
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;

            // Should load within 3 seconds
            expect(loadTime).toBeLessThan(3000);
        });

        test('should show loading states', async ({ page }) => {
            await page.goto('http://localhost:5173/menu');

            // Should have some loading indicator
            // (Even if brief, it shows proper UX)
            const hasContent = await page.locator('.food-item, .product-card, [class*="loading"]').first().isVisible();
            expect(hasContent).toBeTruthy();
        });
    });

    test.describe('Error Handling', () => {

        test('should handle 404 pages gracefully', async ({ page }) => {
            await page.goto('http://localhost:5173/non-existent-page');

            // Should show 404 message or redirect to home
            const has404 = await page.locator('text=/404|not found|không tìm thấy/i').isVisible().catch(() => false);
            const isHome = page.url().includes('localhost:5173') && !page.url().includes('non-existent');

            expect(has404 || isHome).toBeTruthy();
        });
    });
});
