# Quantrex Project Context & Master Memory

> This file contains the complete system architecture, development history, active features, and configuration for Quantrex. Any AI assistant session in any account must read this file to immediately continue development without missing any context.

---

## 1. Project Overview & Identity
- **Project Name:** Quantrex
- **Type:** Digital Agency Financial Intelligence & Performance Marketing SaaS
- **Local Path:** `E:\My Project\Quantrex`
- **GitHub Repository:** `https://github.com/M-S-Siam/Quantrex.git` (Branch: `main`)
- **Live Customer App URL:** `https://m-s-siam.github.io/Quantrex/`
- **Live Admin Portal URL:** `https://m-s-siam.github.io/Quantrex/admin.html`
- **Desktop Electron App:** Built at `E:\My Project\Quantrex\release\win-unpacked\Quantrex.exe` with desktop shortcut `C:\Users\ASUS\Desktop\Quantrex.lnk` and installer `Quantrex Setup 1.0.0.exe`.

---

## 2. Credentials, Access Codes & Backend
- **Admin Portal Access Code:** `6202`
- **Master Admin / Founder Email:** `mdshahariar307@gmail.com` (and backup: `veloxadsphere@gmail.com`)
- **Supabase Cloud Backend:**
  - **Project URL:** `https://zgyldkvrzmrdvjhtbmcg.supabase.co`
  - **Publishable Key:** Located in `src/lib/supabase.js`
  - **Tables:** `workspaces`, `workspace_members`, `workspace_app_data`

---

## 3. Architecture & Key Files
- `App.jsx`: Main agency client SaaS application (Multi-agency workspace switcher, KPI metrics, client management, ledger).
- `src/CreateWorkspaceModal.jsx`: Modal for creating additional agency workspaces.
- `admin.html`: Executive admin portal entry HTML.
- `admin.jsx`: Executive admin portal React root, authentication, access code management, recovery mode.
- `src/AdminConsoleView.jsx`: Master admin console with sidebar layout and full founder control tools.
- `tailwind.config.js`: Tailwind CSS configuration including `./src/**/*.{js,ts,jsx,tsx}` and `./admin.html`.

---

## 4. Admin Portal Features & Layout
- **Design Philosophy:** Minimal, modern, high-contrast, professional SaaS (NO flashy neons, NO childish badges).
- **Zero-Knowledge Privacy:** The admin NEVER accesses clients' personal client lists, invoices, profit margins, or private banking details.
- **Categorized Sidebar Navigation:**
  1. **Platform Telemetry:**
     - `Executive Overview`: Revenue KPIs, quick directory snapshot.
     - `User Directory`: Full agency list, Expiry Countdown (days remaining), 1-click `Suspend` / `Activate` account toggle.
  2. **Revenue & Billing:**
     - `Promo & Coupons`: Create custom promo codes (% or fixed BDT), max uses limit, expiry date, 1-click copy, active/deactivate toggle.
     - `Payment Desk`: Audit bKash / Nagad TrxIDs and 1-click activate Starter Plan.
     - `Financial Ledger`: Complete transaction list and 1-Click **`Export Ledger (.CSV)`** download.
  3. **Communications:**
     - `Support Inbox`: Review and resolve customer inquiries.
     - `Broadcast Notices`: Instant global alert banners pushed across all agency dashboards.
  4. **System & Security:**
     - `Health & Backup Vault`: Supabase Cloud latency monitor, 1-Click **`Download Master Backup (.JSON)`**, and **1-Click System Maintenance Mode Toggle**.
     - `Admin Audit Trail`: Immutable timestamped log of administrative decisions, billing approvals, and coupon creations.
     - `Co-Admins`: Manage sub-admin permissions.

---

## 5. Development Guidelines
- Always verify builds with `npm run build` using `"C:\Program Files\nodejs\npm.cmd"`.
- Working directory workaround: Ensure `D:\ttttttttttt` exists for background shell sessions or execute via workflow scripts in `E:\My Project\Quantrex`.
- Always communicate with the user in polite, clear Bengali (Bangla).
