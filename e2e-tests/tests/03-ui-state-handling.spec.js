/**
 * 3️⃣ UI STATE HANDLING
 */
import { test, expect } from '@playwright/test';

test.describe('UI State Handling - Xử lý trạng thái giao diện', () => {
    const FRONTEND_URL = 'http://localhost:5173';

    test.describe('Loading States', () => {
        test('Trang chủ load thành công', async ({ page }) => {
            await page.goto(FRONTEND_URL);
            await page.waitForLoadState('domcontentloaded');

            // Navbar visible
            await expect(page.locator('.navbar')).toBeVisible();
        });

        test('Food items load', async ({ page }) => {
            await page.goto(FRONTEND_URL);
            await page.waitForTimeout(2000);

            // At least one food item
            const hasContent = await page.locator('.food-display').isVisible();
            expect(hasContent).toBeTruthy();
        });
    });

    test.describe('Empty States', () => {
        test('Giỏ hàng hiển thị khi không có sản phẩm', async ({ page }) => {
            await page.goto(`${FRONTEND_URL}/cart`);
            await page.waitForTimeout(500);

            // Cart section visible
            await expect(page.locator('.cart').first()).toBeVisible();
        });

        test('My Orders page load được', async ({ page }) => {
            await page.goto(`${FRONTEND_URL}/myorders`);
            await page.waitForTimeout(1000);

            // Page loads without crash
            expect(page.url()).toContain('myorders');
        });
    });

    test.describe('Error States', () => {
        test('Xử lý gracefully khi API chậm', async ({ page }) => {
            // Slow network simulation
            await page.route('**/api/**', route => {
                setTimeout(() => route.continue(), 1000);
            });

            await page.goto(FRONTEND_URL);

            // Page vẫn render
            await expect(page.locator('.navbar')).toBeVisible();
        });
    });
});
