const XLSX = require('xlsx');
const { createObjectCsvWriter } = require('csv-writer');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node index.js <csv-or-xlsx-file>');
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

function cidrToRange(cidr) {
  const [ip, prefix] = cidr.trim().split('/');
  const prefixLen = parseInt(prefix);

  // Convert IP to 32-bit number
  const ipParts = ip.split('.').map(Number);
  const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];

  // Calculate mask
  const mask = prefixLen === 0 ? 0 : (~0 << (32 - prefixLen)) >>> 0;

  // Calculate start and end
  const startNum = (ipNum & mask) >>> 0;
  const endNum = (startNum | (~mask >>> 0)) >>> 0;

  // Convert back to IP string
  const numToIp = (num) => [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.');

  return {
    startingIp: numToIp(startNum),
    endingIp: numToIp(endNum)
  };
}

async function run() {
  const records = readFile(filePath);
  console.log(`Loaded ${records.length} records\n`);

  const results = [];

  for (const row of records) {
    const cidr = row['Customer IP Addresses'];
    if (!cidr) continue;

    try {
      const { startingIp, endingIp } = cidrToRange(cidr);
      results.push({ cidr, startingIp, endingIp });
      console.log(`✓ [${results.length}/${records.length}] ${cidr} → Start: ${startingIp} | End: ${endingIp}`);
    } catch (err) {
      console.warn(`✗ Failed for ${cidr}: ${err.message}`);
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
  console.log(`\nSaved ${results.length} records to results.csv`);
}

run();