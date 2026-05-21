# Equipment Database Management System

Premium serverless asset management platform built with React 19, TypeScript, Vite, TailwindCSS v4, TanStack Table, React Query, Zustand, and Framer Motion.

## Features

- Enterprise dashboard with inventory stats, charts, recent activity, and global search patterns
- Equipment CRUD, fuzzy search, filters, sorting, pagination, bulk selection, export, and delete confirmation
- Employee module with profile pages, accountability summaries, printable forms, CSV, Excel, and PDF exports
- A4 print layouts optimized for government-office property accountability reports
- Serverless Google Sheets architecture through Google Apps Script Web API
- Password-gate authentication, persistent dark mode, responsive premium SaaS UI

## Install

```bash
npm install
npm run dev
```

The app runs in mock mode by default. Use the password from `.env.example`:

```bash
VITE_AUTH_PASSWORD=change-this-password
VITE_ENABLE_MOCKS=true
```

## Environment

Create `.env.local`:

```bash
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_AUTH_PASSWORD=your-secure-password
VITE_ORGANIZATION_NAME=Your Office Name
VITE_ENABLE_MOCKS=false
```

## Google Sheets Setup

Create a spreadsheet with these tabs and exact headers:

- `MASTER LIST OF PERSONNEL`: `Employee ID`, `Name`, `STATUS`, `Position`
- `PPE ACCOUNTABILITY`: `Article`, `Property No.`, `Item Description`, `Amount`, `PAR No.`, `Issued To`, `Date Issued`, `Status`, `Location`, `Remarks`
- `SEMI-EXPENDABLE PROPERTY (SE)`: `Article`, `Property No.`, `Item Description`, `Amount`, `ICS No.`, `Issued To`, `Date Issued`, `Status`, `Location`, `Remarks`
- `TECHNICAL AND SCIENTIFIC EQUIPMENTS`: `Article`, `Property No.`, `Item Description`, `Amount`, `PAR No.`, `Issued To`, `Date Issued`, `Status`, `Location`, `Remarks`
- `OFFICE EQUIPMENTS - EXPANDABLES`: same as PAR tabs
- `SUPPLIES AND SEMI-EXPENDABLES/OFFICE EQUIPMENT`: same as PAR tabs

Open `Extensions > Apps Script`, paste `google-apps-script/Code.gs`, then deploy as a Web App:

- Execute as: `Me`
- Who has access: `Anyone`
- Copy the `/exec` URL into `VITE_GOOGLE_APPS_SCRIPT_URL`

## Vercel Deployment

1. Push this project to a Git provider.
2. Import it in Vercel.
3. Add the environment variables from `.env.local`.
4. Build command: `npm run build`
5. Output directory: `dist`

`vercel.json` includes SPA rewrites for client-side routing.

## Architecture

```text
React Vite App
  -> services/api.ts
  -> Google Apps Script Web App
  -> Google Sheets tabs
```

The frontend remains fully serverless and deploys cleanly to Vercel. React Query owns server state, Zustand owns local UI/auth/theme state, and the table/report/export systems are modular under `src/components` and `src/services`.
