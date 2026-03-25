CIDR to IP Converter 🌐
A robust Node.js toolset designed to automate the expansion of CIDR blocks into individual IP addresses. Whether you need the raw speed of local mathematical calculation or the verified results of a web-based calculator, this repository provides both.

📝 Introduction
This project was built to simplify the process of network mapping. Handling large datasets in Excel can be tedious; this tool automates the extraction of every usable IP within those ranges and saves them into a clean, portable result.csv file.

🚀 Installation
This project requires Node.js. Once Node is installed, run the following command in your terminal to install all necessary dependencies (Puppeteer for scraping, XLSX for Excel handling, and CSV tools for output):

```bash
npm install
```

🛠 Usage
1. High-Speed Local Engine (index.js)
Best for: Processing thousands of CIDRs in seconds.
This script uses bitwise mathematics to calculate IP ranges locally. It does not require an internet connection and is significantly faster than scraping.

```bash
node index.js <path-to-your-xlsx-file>
```


2. Puppeteer Web Scraper (script.js)
Best for: Verifying data against the Vultr Subnet Calculator.
This script launches a headless browser, navigates to Vultr, and targets the input field using the input[name="subnet"] attribute to fetch data directly from the web UI.

```bash
node script.js <path-to-your-xlsx-file>
```


📁 Data Specifications
Input
Format: .xlsx (Excel)

Column Header: The script targets the column labeled Customer IP Addresses.

Output
Format: result.csv

Structure:
| Original CIDR | IP Address |
| :--- | :--- |
| 192.168.1.0/24 | 192.168.1.0 |
| 192.168.1.0/24 | 192.168.1.1 |

⚙️ How It Works
XLSX Integration: Uses the xlsx library to parse the spreadsheet into a JSON object.

Automation: The Puppeteer script includes logic to clear the input field, type the CIDR, and wait for the results table to appear before scraping.

Performance: Uses csv-writer to stream data directly to the disk, ensuring the script can handle large IP lists without running out of memory.
