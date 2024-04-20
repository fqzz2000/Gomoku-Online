import { test, expect } from '@playwright/test';

test('has button', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // 创建 Locator 对象指向特定按钮
  const buttonLocator = page.locator('button');

  // 使用 toContainText 断言检查按钮中是否包含文本 "Add Room"
  await expect(buttonLocator).toContainText('Add Room');
});


test("has login button", async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    const loginButtonLocator = page.locator('button:has-text("Login with JWT")');
    
    await expect(loginButtonLocator).toBeVisible();

    const loginButton2 = page.locator('button:has-text("Login with OIDC")');

    await expect(loginButton2).toBeVisible();

    // ensure that there are two form fields for username and password

    }
);


test (" login with JWT", async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    const loginButtonLocator = page.locator('button:has-text("Login with JWT")');
    await loginButtonLocator.click();
    await page.waitForTimeout(1000);
    const usernameField = page.locator('input[id="username"]');
    await usernameField.fill('2');
    const passwordField = page.locator('input[id="password"]');
    await passwordField.fill('2');
    const submitButton = page.locator('button:has-text("Login with JWT")');
    await submitButton.click();
    await page.waitForTimeout(1000);
    // it should redirect to the home page checking for the presence of the "Add Room" button
    const buttonLocator = page.locator('button');
    await expect(buttonLocator).toContainText('Add Room');
}
);


// test ("test jump to profile page", async ({ page }) => {
//     await page.goto('http://localhost:5173/login');
//     const loginButtonLocator = page.locator('button:has-text("Login with JWT")');
//     await loginButtonLocator.click();
//     await page.waitForTimeout(1000);
//     const usernameField = page.locator('input[id="username"]');
//     await usernameField.fill('2');
//     const passwordField = page.locator('input[id="password"]');
//     await passwordField.fill('2');
//     const submitButton = page.locator('button:has-text("Login with JWT")');
//     await submitButton.click();
//     await page.waitForTimeout(1000);
//     const profileButton = page.locator('button:has-text("Profile")');
//     await profileButton.click();
//     await page.waitForTimeout(1000);
//     const profileHeader = page.locator('h1:has-text("Profile")');
//     await expect(profileHeader).toBeVisible();
// });