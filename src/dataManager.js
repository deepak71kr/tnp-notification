// src/dataManager.js
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

/**
 * Reads a JSON file from the data directory and returns its content.
 * @param {string} filename The name of the file to read (without extension).
 * @returns {Array} The parsed JSON content, or an empty array if the file doesn't exist.
 */
function readData(filename) {
  const filePath = path.join(dataDir, `${filename}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

/**
 * Writes data to a JSON file in the data directory.
 * @param {string} filename The name of the file to write (without extension).
 * @param {Array} data The data to be written.
 */
function writeData(filename, data) {
  const filePath = path.join(dataDir, `${filename}.json`);
  // Ensure the data directory exists before writing.
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Export the functions so they can be used by other files.
module.exports = { readData, writeData };