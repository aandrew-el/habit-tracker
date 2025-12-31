// Quick automated test for add habit bug
// Run with: node test-add-habit.js

const puppeteer = require('puppeteer');

async function testAddHabit() {
  console.log('🚀 Starting automated test...\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });

  const page = await browser.newPage();

  try {
    // Go to dashboard
    console.log('📍 Navigating to dashboard...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });

    // Wait for login redirect to complete
    await page.waitForTimeout(2000);

    // Check initial state
    console.log('📊 Checking initial habits count...');
    const initialCount = await page.evaluate(() => {
      const text = document.body.innerText;
      const match = text.match(/Tracking (\d+) habit/);
      return match ? parseInt(match[1]) : 0;
    });
    console.log(`   Initial: ${initialCount} habits\n`);

    // Click Add Habit button
    console.log('➕ Clicking Add Habit button...');
    await page.click('button:has-text("Add Habit")');
    await page.waitForTimeout(500);

    // Fill form
    console.log('📝 Filling out form...');
    await page.type('input[placeholder="Enter habit name"]', 'Test Habit ' + Date.now());
    await page.waitForTimeout(200);

    // Submit
    console.log('💾 Submitting...');
    await page.click('button:has-text("Add Habit")');

    // Wait for toast
    await page.waitForTimeout(1000);

    // Check if habit appears
    console.log('🔍 Checking if habit appeared...');
    const newCount = await page.evaluate(() => {
      const text = document.body.innerText;
      const match = text.match(/Tracking (\d+) habit/);
      return match ? parseInt(match[1]) : 0;
    });
    console.log(`   After add: ${newCount} habits\n`);

    // Verify
    if (newCount > initialCount) {
      console.log('✅ SUCCESS! Habit appeared immediately.');
      console.log(`   Count increased from ${initialCount} to ${newCount}`);
    } else {
      console.log('❌ FAILED! Habit did not appear.');
      console.log(`   Count stayed at ${initialCount}`);

      // Check after refresh
      console.log('\n🔄 Checking after refresh...');
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForTimeout(1000);

      const afterRefresh = await page.evaluate(() => {
        const text = document.body.innerText;
        const match = text.match(/Tracking (\d+) habit/);
        return match ? parseInt(match[1]) : 0;
      });

      if (afterRefresh > initialCount) {
        console.log(`⚠️  Habit appears after refresh (${afterRefresh} habits)`);
        console.log('   Bug: Real-time update not working');
      }
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
    console.log('\n🏁 Test complete!');
  }
}

testAddHabit();
