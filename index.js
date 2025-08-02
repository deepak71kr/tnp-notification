// index.js

// Import necessary modules and configure dotenv
require('dotenv').config({ override: true });
const { runScraper } = require('./src/auth');
const { scrapePageContent } = require('./src/pageScraper');
const { processContent, compareNewEntries } = require('./src/contentProcessor');
const { readData, writeData } = require('./src/dataManager');
const { sendNotification } = require('./src/notificationSender');

const CHECK_INTERVAL_MINUTES = parseInt(process.env.CHECK_INTERVAL_MINUTES, 10) || 30;
const TARGET_PAGE_URL = process.env.TARGET_PAGE_URL;

/**
 * The main function to monitor the job portal for changes.
 */
async function monitorJobPortal() {
  console.log(`[${new Date().toISOString()}] Starting new check for job listings and notifications...`);

  let page;
  try {
    // 1. Log into the portal and get the authenticated page object.
    page = await runScraper();

    // 2. Scrape the current content of the target page.
    const htmlContent = await scrapePageContent(page, TARGET_PAGE_URL);
    if (!htmlContent) {
      console.error('Failed to scrape page content. Skipping this run.');
      return;
    }

    // 3. Process the scraped HTML to extract jobs and notifications.
    const { newJobs, newNotifications } = processContent(htmlContent);

    // 4. Get the old data from the saved JSON files.
    const previousJobs = readData('previous_jobs');
    const previousNotifications = readData('previous_notifications');

    // 5. Compare the new data with the old data to find only new entries.
    const newJobEntries = compareNewEntries(previousJobs, newJobs, (job) => job.company + job.postedDate + job.deadline);
    const newNotificationEntries = compareNewEntries(previousNotifications, newNotifications, (notification) => notification.title + notification.date);

    let newContentFound = false;

    // 6. If new jobs are found, log them and send a notification.
    if (newJobEntries.length > 0) {
      console.log(`Found ${newJobEntries.length} new job listing(s)!`);
      await sendNotification('New Job Listings Found', { jobs: newJobEntries, notifications: [] });
      newContentFound = true;
    }

    // 7. If new notifications are found, log them and send a notification.
    if (newNotificationEntries.length > 0) {
      console.log(`Found ${newNotificationEntries.length} new notification(s)!`);
      await sendNotification('New Notifications Found', { jobs: [], notifications: newNotificationEntries });
      newContentFound = true;
    }
    
    // 8. If no new content is found, send a confirmation email.
    if (!newContentFound) {
      console.log('No new content found. Sending confirmation email.');
      await sendNotification('No New Updates Found', { jobs: [], notifications: [] });
    }

    // 9. Always update the data files with the latest content for the next run's comparison.
    // This is important even if no changes were found to prevent old "new" content from being resent.
    writeData('previous_jobs', newJobs);
    writeData('previous_notifications', newNotifications);
    console.log('Data files updated with the latest content.');

  } catch (error) {
    console.error(`[${new Date().toISOString()}] An error occurred during monitoring:`, error);
  } finally {
    if (page) {
      await page.browser().close();
    }
    console.log(`[${new Date().toISOString()}] Check finished. Waiting for next run.`);
  }
}

// Start the one-time monitoring process to initialize the data.
console.log('Starting initial run...');
monitorJobPortal().then(() => {
    console.log(`Starting scheduled monitoring. Will check every ${CHECK_INTERVAL_MINUTES} minutes.`);
    // Set up the recurring check.
    setInterval(monitorJobPortal, CHECK_INTERVAL_MINUTES * 60 * 1000);
});