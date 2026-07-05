const { fetchPage } = require('@tiranyx/browser-engine');
const result = await fetchPage('https://example.com', {
  headless: true,
  waitForSelector: '.content'
});