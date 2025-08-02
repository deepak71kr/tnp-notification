// src/contentProcessor.js
const cheerio = require('cheerio');

/**
 * Extracts job data from the provided HTML string.
 * @param {string} html The HTML content of the page.
 * @returns {Array<Object>} An array of job objects.
 */
function extractJobs(html) {
  const $ = cheerio.load(html);
  const jobs = [];
  // Use the correct selector for the job listings table body
  $('#job-listings_wrapper tbody tr').each((i, el) => {
    const $row = $(el);
    const columns = $row.find('td');
    if (columns.length > 0) {
      jobs.push({
        company: $(columns[0]).text().trim(),
        deadline: $(columns[1]).text().trim(),
        postedDate: $(columns[2]).text().trim(),
        // Construct the full link URL
        link: $(columns[3]).find('a').attr('href') ? `https://tp.bitmesra.co.in/${$(columns[3]).find('a').attr('href')}` : null,
      });
    }
  });
  return jobs;
}

/**
 * Extracts notification data from the provided HTML string.
 * @param {string} html The HTML content of the page.
 * @returns {Array<Object>} An array of notification objects.
 */
function extractNotifications(html) {
  const $ = cheerio.load(html);
  const notifications = [];
  // Use the correct selector for the notifications table body
  $('#newseventsx1 tbody tr').each((i, el) => {
    const $row = $(el);
    const columns = $row.find('td');
    if (columns.length > 0) {
      notifications.push({
        title: $(columns[0]).text().trim(),
        type: $(columns[1]).text().trim(),
        date: $(columns[2]).text().trim(),
        // Construct the full link URL
        link: $(columns[0]).find('a').attr('href') ? `https://tp.bitmesra.co.in/${$(columns[0]).find('a').attr('href')}` : null,
      });
    }
  });
  return notifications;
}

/**
 * Processes HTML content to extract job and notification data.
 * @param {string} htmlContent The HTML content of the page.
 * @returns {{newJobs: Array<Object>, newNotifications: Array<Object>}} The extracted data.
 */
function processContent(htmlContent) {
  if (!htmlContent) {
    console.error('No HTML content provided to process.');
    return { newJobs: [], newNotifications: [] };
  }
  const newJobs = extractJobs(htmlContent);
  const newNotifications = extractNotifications(htmlContent);
  return { newJobs, newNotifications };
}

/**
 * Compares old and new data arrays to find new entries.
 * @param {Array<Object>} oldArray The previous data array.
 * @param {Array<Object>} newArray The current data array.
 * @param {Function} keyFunction A function to create a unique key for each item.
 * @returns {Array<Object>} An array of new items.
 */
function compareNewEntries(oldArray, newArray, keyFunction) {
  const oldSet = new Set(oldArray.map(keyFunction));
  const newEntries = newArray.filter(item => !oldSet.has(keyFunction(item)));
  return newEntries;
}

module.exports = {
  extractJobs,
  extractNotifications,
  processContent,
  compareNewEntries,
};