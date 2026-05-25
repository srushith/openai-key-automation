# OpenAI API Key Automation System

## Overview

This project automates OpenAI API key generation for learners using:

* Playwright browser automation
* Existing logged-in Chrome session
* CSV-based learner input
* Automatic API key generation
* Automatic CSV output storage

The system creates:

* one API key per learner
* under a selected OpenAI project


---

# Features

* Bulk API key creation
* Reads learner names from CSV
* Automatically creates keys in OpenAI UI
* Automatically copies generated API keys
* Saves keys into output CSV
* Uses existing Chrome login session
* Supports project-level organization
* Error-safe loop execution

---

# Tech Stack

| Tool              | Purpose              |
| ----------------- | -------------------- |
| Node.js           | Runtime              |
| Playwright        | Browser automation   |
| Chrome Debug Mode | Session persistence  |
| csv-parser        | Read learner CSV     |
| csv-writer        | Write generated keys |
| clipboardy        | Read copied API keys |

---

# Folder Structure

```bash
openai-key-automation/
│
├── test.js
├── learners.csv
├── generated_keys.csv
├── package.json
└── README.md
```

---

# Prerequisites

Install:

* Node.js
* Google Chrome

---

# Installation

## 1. Create Project

```bash
mkdir openai-key-automation
cd openai-key-automation
```

---

## 2. Initialize Node Project

```bash
npm init -y
```

---

## 3. Install Dependencies

```bash
npm install playwright clipboardy csv-parser csv-writer
```

---

## 4. Install Playwright Browsers

```bash
npx playwright install
```

---

# Chrome Debug Setup

The automation connects to an already logged-in Chrome session.

---

## Step 1 — Close All Chrome Windows

Close:

* all Chrome windows
* all chrome.exe processes

---

## Step 2 — Start Chrome in Debug Mode

Run this command in CMD:

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug"
```

This creates:

* dedicated automation Chrome profile
* persistent login session

---

## Step 3 — Login OpenAI

Inside opened Chrome:

* login to OpenAI once

Future runs will reuse session automatically.

---

# learners.csv Format

Create:

```text
learners.csv
```

Structure:

```csv
name
Rahul
Priya
Arjun
Sneha
```

Important:

* first row must be `name`
* no empty rows
* UTF-8 encoding preferred

---

# Running The Automation

## Step 1 — Start Chrome Debug Session

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug"
```

---

## Step 2 — Run Script

```bash
node test.js
```

---

# Automation Flow

For each learner:

1. Opens OpenAI API keys page
2. Opens “Create new secret key” modal
3. Fills learner name
4. Selects target project
5. Creates API key
6. Copies generated API key
7. Reads clipboard value
8. Saves learner + API key into CSV
9. Clicks Done
10. Moves to next learner

---

# Output File

Generated keys are stored in:

```text
generated_keys.csv
```

Example:

```csv
NAME,API_KEY
Rahul,sk-proj-xxxxx
Priya,sk-proj-yyyyy
```

---

# Important Configuration

Inside `test.js`, update:

## OpenAI Project Name

```javascript
hasText: /TPM Early March Cohort/
```

Replace with your actual OpenAI project name.

---

## OpenAI URL

```javascript
https://platform.openai.com/settings/organization/api-keys
```

Can be changed if needed.

---

# Security Notes

API keys are sensitive credentials.

Never:

* upload generated CSV publicly
* commit keys to GitHub
* share keys in unsecured channels

Recommended:

* encrypted storage
* secure learner delivery
* one-time visibility

---

# Recommended Operational Structure

Best practice:

| Entity         | Structure            |
| -------------- | -------------------- |
| OpenAI Project | One per batch/cohort |
| API Key        | One per learner      |

Advantages:

* easier billing
* easier revocation
* centralized usage tracking
* better limit management

---

# Common Issues

---

## ECONNREFUSED 127.0.0.1:9222

Cause:

* Chrome debug session not running

Fix:

* start Chrome using debug command before running script

---

## Button Click Not Working

Cause:

* OpenAI UI updated
* selector mismatch

Fix:

* inspect button text again
* update Playwright selectors

---

## clipboardy.read is not a function

Fix:

```javascript
const clipboardy = require('clipboardy').default;
```

---

# Future Improvements

Potential upgrades:

* Google Sheets integration
* Learner dashboard
* Automatic onboarding portal
* n8n integration
* Supabase database
* Admin panel
* Usage tracking
* Automatic revocation
* Quiz-based API provisioning

---

# Suggested Production Architecture

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

---

# Recommended Stack For Scaling

| Layer      | Tool              |
| ---------- | ----------------- |
| Frontend   | Next.js / React   |
| Backend    | Node.js + Express |
| Automation | Playwright        |
| Workflow   | n8n               |
| Database   | Supabase          |
| Auth       | Supabase Auth     |

---

# Disclaimer

This project automates browser interactions with the OpenAI platform UI.

UI selectors may change over time if OpenAI updates their interface.

Periodic maintenance may be required.

---

# Author Notes

This system was initially built as:

* a lightweight internal provisioning tool
* for learner onboarding automation
* during AI cohort management workflows.
