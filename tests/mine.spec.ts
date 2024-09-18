import { test, expect } from '@playwright/test';

test.describe('Mine', () => {

    test('should declare a custom product and display success notification', async ({ page }) => {
        // Navigate to the page where DefineProductForm is rendered
        await page.goto('/product/declare');

        // Open the product select dropdown and check if there are options
        const select = page.locator('select[name="selectedProduct"]');
        await select.click();

        // Check if there are product options
        const optionsCount = await select.locator('option').count();
        expect(optionsCount).toBeGreaterThan(1);

        // Click on the link to declare a custom product
        const addCustomLink = page.locator('text=Can\'t find your product type? Add a new one');
        await addCustomLink.click();

        // Enter custom product details
        await page.fill('input[name="customProductName"]', 'Gold');
        await page.fill('input[name="customSymbol"]', 'gld');
        await page.fill('input[name="price"]', '5000');

        // Upload a PDF file (assuming there's an input element for file upload)
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.click('input[type="file"]')
        ]);
        await fileChooser.setFiles('./document.pdf');

        // Submit the form
        const declareButton = page.locator('button:has-text("Declare Product")');
        await expect(declareButton).toBeEnabled(); // Ensure the button is enabled
        await declareButton.click();

        // Wait for the success notification
        const successNotification = page.locator('text=Product declared successfully');
        await expect(successNotification).toBeVisible();

        // Check if the progress bar is displayed
        const progressBar = page.locator('.h-1.bg-green-500');
        await expect(progressBar).toBeVisible();
    });

    test('should mint Gold mineral with 100kg amount and 1000kg CO2 and show success notification', async ({ page }) => {
        // Navigate to the minting form page
        await page.goto('/mine/minting');

        // Wait for the product select to be populated and select 'Gold' from the dropdown
        const selectMineral = page.locator('select#mineral');
        await selectMineral.waitFor();
        await selectMineral.selectOption({ label: 'Gold' });

        // Enter 100 kg for quantity
        const quantityInput = page.locator('input#quantity');
        await quantityInput.fill('100');

        // Enter 1000 kg for CO2 emissions
        const co2Input = page.locator('input#co2');
        await co2Input.fill('1000');

        // Submit the form by clicking on the "Mint Mineral" button
        const mintButton = page.locator('button:has-text("Mint Mineral")');
        await mintButton.click();

        // Wait for success notification
        const successNotification = page.locator('text=Mineral successfully minted');
        await expect(successNotification).toBeVisible();

        // Optionally, verify that the progress bar appears and functions
        const progressBar = page.locator('.h-1.bg-green-500');
        await expect(progressBar).toBeVisible();
    });

    test('should list Gold with the correct quantity and CO2 after minting', async ({ page }) => {
        // Navigate to the product list page
        await page.goto('/product/list'); // Adjust the URL to match the actual product list page

        // Filter for "Gold" product by name
        await page.fill('input[placeholder="Filter products..."]', 'Gold');

        // Wait for the product list to load and find the Gold product
        const goldProduct = page.locator('text=Gold');

        // Assert that the Gold product is visible in the list
        await expect(goldProduct).toBeVisible();

        // Check that the quantity for Gold is 100 kg
        const quantityText = goldProduct.locator('text=Quantity: 100 Kg');
        await expect(quantityText).toBeVisible();

        // Check that the CO2 emission for Gold is 1000 kg
        const co2Text = goldProduct.locator('text=CO2 Emission: 1000 Kg');
        await expect(co2Text).toBeVisible();
    });

    test('should display correct product details', async ({ page }) => {
        // Go to the product detail page (update the path to match your routing)
        await page.goto('/product/list/'); // Replace with the correct path

        // Verify that the product name and symbol are displayed correctly
        await expect(page.locator('text=Name:')).toHaveText(/Name: gold \(gld\)/);

        // Verify that the quantity is displayed correctly
        await expect(page.locator('text=Quantity:')).toHaveText(/Quantity: 100 Kg/);

        // Verify that the CO2 emission is displayed correctly
        await expect(page.locator('text=CO2 Emission:')).toHaveText(/CO2 Emission: 1000 Kg/);

        // Verify that the price is displayed correctly
        await expect(page.locator('text=Average Price:')).toHaveText(/Average Price: 5000 \$/);
    });

    test('should submit the form with product gold, quantity 80 and wait for success', async ({ page }) => {
        // Navigate to the page where the form is available (adjust URL to match your app's routing)
        await page.goto('/transactions/create');

        // Fill the "From" field (selecting the first group as an example)
        await page.selectOption('select[name="from"]', { index: 1 });

        // Fill the "To" field (selecting the second group as an example)
        await page.selectOption('select[name="to"]', { index: 2 });

        // Fill the "Transporter Email" field
        await page.fill('input[name="transporter"]', 'transporter@natixar.pro');

        // Select "gold" from the Product dropdown
        await page.selectOption('select[name="product"]', { label: 'gold' });

        // Fill the "Quantity" input with value 80
        await page.fill('input[name="quantity"]', '80');

        // Submit the form
        await page.click('button[type="submit"]');

        // Wait for the success message to appear
        await expect(page.locator('text=Transaction saved successfully!')).toBeVisible();

        // Check if the success message contains a link to the transactions list
        const link = page.locator('a:text("transactions list")');
        await expect(link).toHaveAttribute('href', '/transactions/list');
    });

    test('should filter transactions by name "gold" and verify transaction details', async ({ page }) => {
        // Navigate to the transaction page
        await page.goto('/transactions/list'); // Update with the correct route

        // Click the link to navigate to the transactions list (if applicable)
        await page.click('a:text("transactions list")'); // Adjust the selector based on the actual link

        // Type "gold" into the search input to filter the transactions
        await page.fill('input[data-testid="search-filter-input"]', 'gold');

        // Verify that the transaction with the correct product name is displayed
        const transactionRow = page.locator('table tbody tr', { hasText: 'gold' });

        // Ensure the transaction for "gold" is present
        await expect(transactionRow).toBeVisible();

        // Verify the product details in the transaction
        await expect(transactionRow.locator('td')).toContainText('gold');      // Product name
        await expect(transactionRow.locator('td')).toContainText('(gld)');     // Symbol
        await expect(transactionRow.locator('td')).toContainText('80 Kg');     // Quantity
        await expect(transactionRow.locator('td')).toContainText('5000 $');    // Price
        await expect(transactionRow.locator('td')).toContainText('1000 Kg');   // CO2
    });


});
