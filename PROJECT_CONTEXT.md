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
  - **Tables:** `workspaces`, `workspace_members`, `workspace_app_data`, `workspace_settings`, `platform_admin_state`

---

## 3. Architecture & Key Files
- `App.jsx`: Main agency client SaaS application (Multi-agency workspace switcher, KPI metrics, client management, ledger, real-time cloud receiver for maintenance mode, suspensions, broadcasts, pricing & coupons).
- `src/CreateWorkspaceModal.jsx`: Modal for creating additional agency workspaces.
- `src/lib/supabase.js`: Supabase client instance.
- `src/lib/platformSync.js`: Shared real-time cloud sync helper reading/writing `platform_admin_state` table in Supabase.
- `admin.html`: Executive admin portal entry HTML.
- `admin.jsx`: Executive admin portal React root, authentication, auto-lock timer, failed attempt logger, Supabase sync, access code management, recovery mode.
- `src/AdminConsoleView.jsx`: Master admin console with categorized sidebar layout and full founder control tools.
- `tailwind.config.js`: Tailwind CSS configuration including `./src/**/*.{js,ts,jsx,tsx}` and `./admin.html`.

---

## 4. Admin Portal Features & Layout
- **Design Philosophy:** Minimal, modern, high-contrast, professional SaaS (NO flashy neons, NO childish badges).
- **Zero-Knowledge Privacy:** The admin NEVER accesses clients' personal client lists, invoices, profit margins, or private banking details.
- **Full Real-Time Supabase Sync:** Every change in the Admin Portal (`maintenance_mode`, `global_announcement`, `promo_coupons`, `platform_config`, `workspace_overrides`) syncs automatically to Supabase and reflects live in all web & desktop client apps without uninstalling or reinstalling.
- **Categorized Sidebar Navigation:**
  1. **Platform Telemetry:**
     - `Executive Overview`: Revenue KPIs, 6-Month MRR Bar Chart, Renewal Watchlist, quick directory snapshot.
     - `User Directory`: Full agency list, Expiry Countdown (days remaining), 1-click `Suspend` / `Activate` account toggle, 1-click Bilingual Renewal Reminder modal.
  2. **Revenue & Billing:**
     - `Promo & Coupons`: Create custom promo codes (% or fixed BDT), max uses limit, expiry date, 1-click copy, active/deactivate toggle.
     - `Payment Desk`: Audit bKash / Nagad TrxIDs and 1-click activate Starter Plan.
     - `Financial Ledger`: Complete transaction list and 1-Click **`Export Ledger (.CSV)`** download.
     - `Pricing & Trials`: Dynamic Free Trial days, Starter/Annual/Lifetime BDT pricing, New Signups Open/Paused toggle.
  3. **Communications:**
     - `Support Inbox`: Review and resolve customer inquiries.
     - `Broadcast Notices`: Instant global alert banners pushed across all agency dashboards.
  4. **System & Security:**
     - `Health & Backup Vault`: Live Supabase Cloud latency monitor, Manual Sync button, 1-Click **`Download Master Backup (.JSON)`**, **1-Click System Maintenance Mode Toggle**, Session Auto-Lock timeout setting.
     - `Admin Audit Trail`: Immutable timestamped log of administrative decisions, failed login attempts, billing approvals, and coupon creations.
     - `Co-Admins`: Manage sub-admin permissions.
- **Quick Command Palette:** `Ctrl+K` / `Cmd+K` global shortcut to jump to any tab, agency, or quick action.

---

## 5. Development Guidelines
- Always verify builds with `npm run build` using `"C:\Program Files\nodejs\npm.cmd"`.
- Always execute commands with working directory `E:\My Project\Quantrex` (NEVER recreate `D:\ttttttttttt`).
- Always communicate with the user in polite, clear Bengali (Bangla).
