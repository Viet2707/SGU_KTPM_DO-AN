import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        // Mobile viewports
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],

    // Run your local dev servers before starting the tests
    webServer: [
        {
            command: 'cd frontend && npm run dev',
            url: 'http://localhost:5173',
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'cd admin && npm run dev',
            url: 'http://localhost:5174',
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'cd backend && npm run server',
            url: 'http://localhost:5000',
            reuseExistingServer: !process.env.CI,
        },
    ],
});
