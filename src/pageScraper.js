// src/pageScraper.js

async function scrapePageContent(page, url) {
  console.log(`Navigating to target page: ${url}`);
  try {
    // Navigate to the target URL if the page is not already on it.
    if (page.url() !== url) {
      await page.goto(url, { waitUntil: 'networkidle0' });
    }

    // Wait for the job listings and notifications tables to load.
    // This is crucial for scraping dynamic content.
    console.log('Waiting for content to load...');
    await page.waitForSelector('#job-listings_wrapper', { timeout: 30000 });
    await page.waitForSelector('#newseventsx1', { timeout: 30000 });

    // After waiting for the tables, get the full HTML content of the page.
    const htmlContent = await page.content();
    console.log('Page content scraped successfully.');
    return htmlContent;
  } catch (error) {
    console.error('Error during page scraping:', error);
    // Return null or throw an error to signal failure to the calling script.
    throw new Error('Failed to scrape page content after successful login.');
  }
}

module.exports = { scrapePageContent };