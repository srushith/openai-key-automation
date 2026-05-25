# OpenAI API Key Automation System

## Overview

This project automates **bulk OpenAI API key generation** for learners (e.g. students in a cohort) using browser automation. It drives a real, already-logged-in Chrome session through the OpenAI Platform UI, creates one secret key per learner under a specific OpenAI **project**, copies each generated key, and stores the results in a CSV.

The system uses:

* **Playwright** for browser automation (via Chrome DevTools Protocol)
* An **existing logged-in Chrome session** (no re-login or stored credentials)
* **CSV-based** learner input
* **Automatic** API key generation, copy, and capture
* **Automatic** CSV output storage (append mode)

For each learner it creates:

* one API key
* under a single, pre-selected OpenAI project

---

## Features

* Bulk API key creation in a single run
* Reads learner names from a CSV file
* Automatically creates keys through the live OpenAI UI
* Automatically clicks **Copy** and reads the key from the system clipboard
* Saves `name, apiKey` pairs into an output CSV (append mode)
* Reuses an existing Chrome login session — no credentials in code
* Scoped to a single OpenAI project via a project URL
* Error-safe loop: a failure on one learner is logged and the run continues

---

## Tech Stack

| Tool                | Purpose                                  |
| ------------------- | ---------------------------------------- |
| Node.js             | Runtime                                  |
| Playwright          | Browser automation (Chromium over CDP)   |
| Chrome (debug mode) | Provides the logged-in session           |
| csv-parser          | Reads the learner input CSV              |
| csv-writer          | Writes generated keys to the output CSV  |
| clipboardy          | Reads the copied API key from clipboard  |

Dependencies (from `package.json`):

```json
{
  "clipboardy": "^5.3.1",
  "csv-parser": "^3.2.0",
  "csv-writer": "^1.6.0",
  "playwright": "^1.59.1"
}
```

> **Note:** `clipboardy` v5 is ESM-only, so it is imported with `require('clipboardy').default`.

---

## Folder Structure

```bash
openai-key-automation/
│
├── main.js              # The automation script (entry point you actually run)
├── createKeys.js        # Currently empty; listed as "main" in package.json (see note below)
├── learners.csv         # Input — you create this (git-ignored)
├── generated_keys.csv   # Output — created automatically on first run (git-ignored)
├── logs/
│   └── errors.log       # Reserved for error logging
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

> **Important:** `package.json` declares `"main": "createKeys.js"`, but that file is currently empty. The working automation lives in **`main.js`**, which is the file you run. `learners.csv`, `generated_keys.csv`, `node_modules/`, and `.env` are all listed in `.gitignore` so secrets are never committed.

---

## Prerequisites

Install on your machine:

* **Node.js** (LTS recommended)
* **Google Chrome**

You also need an OpenAI account with access to the target project and permission to create API keys.

---

## Installation

### 1. Clone or open the project

```bash
git clone https://github.com/srushith/openai-key-automation.git
cd openai-key-automation
```

### 2. Install dependencies

```bash
npm install
```

This installs the dependencies already listed in `package.json` (Playwright, clipboardy, csv-parser, csv-writer).

### 3. Install Playwright browsers

```bash
npx playwright install
```

---

## Chrome Debug Setup

The automation does **not** log in for you. Instead, it connects to a Chrome instance that you have already logged into. This avoids handling OpenAI credentials in code.

### Step 1 — Close all Chrome windows

Close every Chrome window and ensure no `chrome.exe` processes are still running.

### Step 2 — Start Chrome in debug mode

Run this in CMD (Windows):

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug"
```

This:

* opens Chrome with the **remote debugging port** on `9222` (the port the script connects to)
* uses a **dedicated user-data directory** so the automation has its own persistent profile and login session

> On macOS/Linux the equivalent is to launch Chrome/Chromium with the same `--remote-debugging-port=9222` and a `--user-data-dir` of your choosing.

### Step 3 — Log in to OpenAI once

In the Chrome window that just opened, log in to the OpenAI Platform once. Because the profile is persistent, future runs reuse the session automatically.

---

## learners.csv Format

Create a file named `learners.csv` in the project root:

```csv
name
Rahul
Priya
Arjun
Sneha
```

Rules:

* the header (first row) **must** be `name`
* one learner per row, no empty rows
* UTF-8 encoding preferred

The script reads each row's `name` value, trims it, and uses it as the API key's name.

---

## Configuration

Open **`main.js`** and review these two settings before running.

### 1. Target OpenAI project (URL)

The project is selected by navigating directly to a **project-scoped** API keys URL. The `proj_...` segment in the URL determines which project the keys are created under:

```javascript
await page.goto(
  'https://platform.openai.com/settings/proj_5AD0AEuOMz8wBPyxZRlmPqwu/api-keys'
);
```

Replace `proj_5AD0AEuOMz8wBPyxZRlmPqwu` with your own project ID. You can find it in the OpenAI dashboard URL when viewing your project's settings.

> An older approach selected the project via an in-modal dropdown. That logic is still present in `main.js` but **commented out**, because selecting the project through the URL is simpler and more reliable.

### 2. Output file

Keys are appended to `generated_keys.csv`:

```javascript
const csvWriter = createObjectCsvWriter({
  path: 'generated_keys.csv',
  header: [
    { id: 'name',   title: 'NAME' },
    { id: 'apiKey', title: 'API_KEY' }
  ],
  append: true
});
```

Because `append: true` is set, re-running the script adds to the existing file rather than overwriting it.

---

## Running the Automation

### Step 1 — Start the Chrome debug session

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug"
```

Make sure you are logged in to OpenAI in this window.

### Step 2 — Run the script

```bash
node main.js
```

The console will log progress for each learner, for example:

```text
Found 4 learners

Processing: Rahul
Modal Opened
Learner Name Filled
Secret Key Created
API Key Copied
Copied API Key: sk-proj-xxxxx
Saved To CSV
Popup Closed
...
ALL LEARNERS COMPLETED
```

---

## Automation Flow

The script connects to Chrome **once**, opens the project's API keys page **once**, then loops over every learner. For each learner it:

1. Clicks **Create new secret key** to open the modal
2. Fills the learner's name into the key-name field (`input[placeholder="My Test Key"]`)
3. *(Project is already determined by the page URL; the dropdown step is commented out)*
4. Clicks **Create secret key**
5. Clicks **Copy** to copy the generated key
6. Reads the key from the system clipboard via `clipboardy.read()`
7. Appends `{ name, apiKey }` to `generated_keys.csv`
8. Clicks **Done** to close the modal
9. Moves on to the next learner

If any step throws, the error is logged to the console, the script presses **Escape** to dismiss the modal, and the loop continues with the next learner.

---

## Output File

Generated keys are stored in `generated_keys.csv`:

```csv
NAME,API_KEY
Rahul,sk-proj-xxxxx
Priya,sk-proj-yyyyy
```

This file is git-ignored so keys are never committed.

---

## Recommended Operational Structure

| Entity         | Suggested structure  |
| -------------- | -------------------- |
| OpenAI Project | One per batch/cohort |
| API Key        | One per learner      |

Advantages:

* easier billing per cohort
* easier revocation of individual learners' keys
* centralized usage tracking
* better rate/spend limit management

---

## Security Notes

API keys are sensitive credentials. **Never:**

* upload `generated_keys.csv` to a public location
* commit keys to GitHub (the included `.gitignore` already excludes the output CSV)
* share keys over unsecured channels

Recommended practices:

* store keys in encrypted storage
* deliver keys to learners securely
* prefer one-time visibility where possible
* rotate/revoke keys when a cohort ends

---

## Troubleshooting

### `ECONNREFUSED 127.0.0.1:9222`

**Cause:** Chrome is not running in debug mode on port 9222.
**Fix:** Start Chrome with the `--remote-debugging-port=9222` command **before** running the script.

### A button click does nothing / selector errors

**Cause:** OpenAI updated its UI, so the button text or input placeholder no longer matches.
**Fix:** Inspect the relevant element in Chrome DevTools and update the Playwright selectors in `main.js` (e.g. the button names or the `My Test Key` placeholder).

### `clipboardy.read is not a function`

**Cause:** `clipboardy` v5 is ESM-only and the default export was not used.
**Fix:** Import it as:

```javascript
const clipboardy = require('clipboardy').default;
```

### The clipboard read returns the wrong value

**Cause:** Something else wrote to the clipboard between the **Copy** click and the read, or the copy didn't complete in time.
**Fix:** Keep the machine idle during the run; the script already waits briefly after clicking **Copy**.

---

## Future Improvements

Potential upgrades:

* Google Sheets integration for input/output
* Learner dashboard and onboarding portal
* n8n workflow integration
* Supabase database for persistence and auth
* Admin panel
* Usage tracking and automatic revocation
* Quiz-based / on-demand API provisioning

### Suggested production architecture

```text
Frontend Portal
      ↓
Backend API
      ↓
Playwright Automation
      ↓
OpenAI Platform
      ↓
Generated API Key
      ↓
Database / Google Sheets
```

### Recommended stack for scaling

| Layer      | Tool              |
| ---------- | ----------------- |
| Frontend   | Next.js / React   |
| Backend    | Node.js + Express |
| Automation | Playwright        |
| Workflow   | n8n               |
| Database   | Supabase          |
| Auth       | Supabase Auth     |

---

## Disclaimer

This project automates browser interactions with the OpenAI Platform **UI**. UI selectors and page URLs may change over time if OpenAI updates their interface, so periodic maintenance may be required. Use it in accordance with OpenAI's terms of service.

---

## Author Notes

This system was initially built as a lightweight internal provisioning tool for learner onboarding automation during AI cohort management workflows.