const puppeteer = require('puppeteer');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
const targetUrl = "https://www.vultr.com/resources/subnet-calculator/";

if (!filePath || !targetUrl) {
  console.error('Usage: node index.js <csv-or-xlsx-file> <target-url>');
  process.exit(1);
}

function readFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.xlsx' || ext === '.xls') {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  } else {
    const csvData = fs.readFileSync(filePath, 'utf-8');
    return parse(csvData, { columns: true });
  }
}

async function run() {
  const records = readFile(filePath);
  console.log(`Loaded ${records.length} records`);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  for (const row of records) {
    const cidr = row['Customer IP Addresses'];

    if (!cidr) {
      console.warn(`Skipping empty row`);
      continue;
    }

    try {
  
  await page.goto(targetUrl, { waitUntil: 'networkidle2' });

 
  await page.waitForSelector('[name="ip_address"]', { timeout: 10000 });


  await page.$eval('[name="ip_address"]', el => el.value = '');
  await page.type('[name="ip_address"]', cidr);

 
  const buttons = await page.$$('#subnet-calculator-submit');
  await buttons[0].click();

 
  await page.waitForFunction(
    () => document.querySelector('#address-range').value !== '',
    { timeout: 10000 }
  );

  const rangeText = await page.$eval('#address-range', el => el.value.trim());
  const [startingIp, endingIp] = rangeText.split(' - ').map(ip => ip.trim());

  results.push({ cidr, startingIp, endingIp });
  console.log(`✓ ${cidr} → Start: ${startingIp} | End: ${endingIp}`);

} catch (err) {
  if (err.name === 'TimeoutError') {
    console.warn(`⏰ Timeout for ${cidr} — skipping...`);
  } else {
    console.warn(`✗ Failed for ${cidr}: ${err.message}`);
  }
  results.push({ cidr, startingIp: 'ERROR', endingIp: 'ERROR' });
}

  }

  const csvWriter = createObjectCsvWriter({
    path: 'results.csv',
    header: [
      { id: 'cidr',       title: 'CIDR' },
      { id: 'startingIp', title: 'Starting IP' },
      { id: 'endingIp',   title: 'Ending IP' },
    ]
  });

  await csvWriter.writeRecords(results);
  console.log('Saved to results.csv');
  await browser.close();
}

run();