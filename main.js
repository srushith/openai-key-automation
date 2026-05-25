const { chromium } = require('playwright');
const clipboardy = require('clipboardy').default;
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const csv = require('csv-parser');


// =========================
// CSV SETUP
// =========================

const csvWriter = createObjectCsvWriter({
  path: 'generated_keys.csv',
  header: [
    { id: 'name', title: 'NAME' },
    { id: 'apiKey', title: 'API_KEY' }
  ],
  append: true
});


// =========================
// READ LEARNERS
// =========================

async function readLearners() {

  return new Promise((resolve) => {

    const learners = [];

    fs.createReadStream('learners.csv')
      .pipe(csv())
      .on('data', (data) => learners.push(data))
      .on('end', () => resolve(learners));

  });

}


// =========================
// MAIN
// =========================

(async () => {

  // Read learners
  const learners = await readLearners();

  console.log(`Found ${learners.length} learners`);

  // Connect browser ONCE
  const browser = await chromium.connectOverCDP(
    'http://127.0.0.1:9222'
  );

  const context = browser.contexts()[0];

  const page = await context.newPage();

  // Open page ONCE
  await page.goto(
    'https://platform.openai.com/settings/proj_5AD0AEuOMz8wBPyxZRlmPqwu/api-keys'
  );

  await page.waitForTimeout(5000);


  // =========================
  // LOOP LEARNERS
  // =========================

  for (const learner of learners) {

    try {

      const learnerName = learner.name.trim();

      console.log(`\nProcessing: ${learnerName}`);


      // =========================
      // OPEN MODAL
      // =========================

      await page.getByRole('button', {
        name: /create new secret key/i
      }).first().click();

      console.log('Modal Opened');

      await page.waitForTimeout(2000);


      // =========================
      // FILL NAME
      // =========================

      await page.locator(
        'input[placeholder="My Test Key"]'
      ).fill(`${learnerName}`);

      console.log('Learner Name Filled');


      // // =========================
      // // OPEN PROJECT DROPDOWN
      // // =========================

      // await page.getByText('Select project...').click();

      // console.log('Dropdown Opened');

      // await page.waitForTimeout(2000);


      // // =========================
      // // SELECT PROJECT
      // // =========================

      // await page.locator('div').filter({
      //   hasText: /test-week-7/
      // }).last().click();

      // console.log('Project Selected');

      // await page.waitForTimeout(2000);


      // =========================
      // CREATE KEY
      // =========================

      await page.getByRole('button', {
        name: /^Create secret key$/
      }).last().click();

      console.log('Secret Key Created');

      await page.waitForTimeout(3000);


      // =========================
      // COPY API KEY
      // =========================

      await page.getByRole('button', {
        name: /copy/i
      }).click();

      console.log('API Key Copied');

      await page.waitForTimeout(1000);


      // =========================
      // READ CLIPBOARD
      // =========================

      const apiKey = await clipboardy.read();

      console.log('Copied API Key:', apiKey);


      // =========================
      // SAVE TO CSV
      // =========================

      await csvWriter.writeRecords([
        {
          name: learnerName,
          apiKey: apiKey
        }
      ]);

      console.log('Saved To CSV');


      // =========================
      // CLOSE POPUP
      // =========================

      // Click Done button
      await page.getByRole('button', {
        name: /^Done$/
      }).click();
      console.log('Popup Closed');
      await page.waitForTimeout(2000);


    } catch (error) {

      console.log(`FAILED for ${learner.name}`);

      console.log(error);

      // Try closing popup safely
      await page.keyboard.press('Escape');

      await page.waitForTimeout(2000);
    }

  }

  console.log('\nALL LEARNERS COMPLETED');

})();