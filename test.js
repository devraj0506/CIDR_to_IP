const puppeteer = require('puppeteer');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');

console.log("started")

const records = readFile(filePath);
console.log('First record:', records[0]); // See actual column names