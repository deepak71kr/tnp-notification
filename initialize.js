// initialize.js
require('dotenv').config({ override: true });
const { runScraper } = require('./src/auth');
const { scrapePageContent } = require('./src/pageScraper');
const { processContent } = require('./src/contentProcessor');
const { writeData } = require('./src/dataManager');
const { sendNotification } = require('./src/notificationSender');

// Your previous code was likely missing the require statement for cheerio,
// which would cause a silent failure. Ensure this line is present.
const cheerio = require('cheerio'); 

const TARGET_PAGE_URL = process.env.TARGET_PAGE_URL;

async function initializeData() {
  console.log('--- initializeData started ---');
  let page;
  try {
    page = await runScraper();
    
    const htmlContent = await scrapePageContent(page, TARGET_PAGE_URL);
    if (!htmlContent) {
      console.error('Failed to scrape page content. Initialization aborted.');
      return;
    }

    const { newJobs, newNotifications } = processContent(htmlContent);

    // Save the initial data.
    writeData('previous_jobs', newJobs);
    writeData('previous_notifications', newNotifications);
    console.log('Initial data files saved successfully.');

    // Send a single, detailed email with the initial scraped data.
    const initialEmailContent = {
      jobs: newJobs,
      notifications: newNotifications,
    };
    await sendNotification('Initial Scrape Complete', initialEmailContent);

    console.log('Initialization complete. A confirmation email with the initial data has been sent.');

  } catch (error) {
    console.error('An error occurred during initialization:', error);
  } finally {
    if (page) {
      await page.browser().close();
    }
    console.log('--- initializeData finished ---');
  }
}

initializeData();