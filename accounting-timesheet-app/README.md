# Accounting Timesheet App

A static web app for accounting firms to record staff working hours, client tasks, billable hours, and monthly summary reports.

## Features

- Timesheet entry form
- Staff dropdown
- Searchable client input with auto-add
- Job category dropdown
- Billable / non-billable hours
- Hourly rate and billing amount
- Staff Summary Report
- Client Summary Report
- CSV export
- Print / Save as PDF
- JSON backup import/export
- Works on GitHub Pages

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload all files in this folder to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` branch and `/root` folder.
6. Save and open the published site URL.

## Important

This version stores data in the browser's localStorage. For a real multi-user company system, add authentication and a database such as Firebase, Supabase, or a custom backend.
