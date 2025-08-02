// src/auth.js

// Import and configure dotenv to load environment variables from the .env file.
// The `override: true` option ensures local values take precedence.
require('dotenv').config({ override: true });

const puppeteer = require('puppeteer');
const path = require('path');

const PUPPETEER_HEADLESS = process.env.PUPPETEER_HEADLESS === 'true';
const PUPPETEER_TIMEOUT = parseInt(process.env.PUPPETEER_TIMEOUT, 10);
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const LOGIN_PAGE_URL = process.env.LOGIN_PAGE_URL;

async function runScraper() {
  const launchOptions = {
    headless: PUPPETEER_HEADLESS,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const browser = await puppeteer.launch(launchOptions);

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.setDefaultTimeout(PUPPETEER_TIMEOUT);

  try {
    await page.goto(LOGIN_PAGE_URL, { waitUntil: 'networkidle0' });

    // Fill out the login form using the correct selectors.
    await page.type('#identity', USERNAME, { delay: 100 });
    await page.type('#password', PASSWORD, { delay: 100 });

    await Promise.all([
      page.click('input[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);

    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      throw new Error('Login failed: Authentication credentials may be incorrect.');
    }
    return page;
  } catch (error) {
    console.error('An error occurred during the login process:', error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

module.exports = { runScraper };