# Setting Up Automatic GitHub Synchronization

This guide explains how to set up automatic synchronization of your local changes to GitHub.

## Option 1: Using Cron Jobs (macOS/Linux)

1. Open Terminal
2. Edit your crontab by running:
   ```
   crontab -e
   ```

3. Add one of the following lines to run the sync script at your preferred interval:

   ```
   # Run every hour
   0 * * * * /Users/andrebenoit/Desktop/civion-website-new/auto-sync.sh >> /Users/andrebenoit/Desktop/civion-website-new/sync.log 2>&1
   
   # Run every 15 minutes
   */15 * * * * /Users/andrebenoit/Desktop/civion-website-new/auto-sync.sh >> /Users/andrebenoit/Desktop/civion-website-new/sync.log 2>&1
   
   # Run at 9 AM and 5 PM every day
   0 9,17 * * * /Users/andrebenoit/Desktop/civion-website-new/auto-sync.sh >> /Users/andrebenoit/Desktop/civion-website-new/sync.log 2>&1
   ```

4. Save and exit the editor

## Option 2: Using Launchd (macOS)

1. Create a plist file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.civion-website-sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/andrebenoit/Desktop/civion-website-new/auto-sync.sh</string>
    </array>
    <key>StartInterval</key>
    <integer>3600</integer>
    <key>StandardOutPath</key>
    <string>/Users/andrebenoit/Desktop/civion-website-new/sync.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/andrebenoit/Desktop/civion-website-new/sync-error.log</string>
</dict>
</plist>
```

2. Save this as `~/Library/LaunchAgents/com.user.civion-website-sync.plist`
3. Load it with:
   ```
   launchctl load ~/Library/LaunchAgents/com.user.civion-website-sync.plist
   ```

## Option 3: Using Task Scheduler (Windows)

1. Open Task Scheduler
2. Create a Basic Task
3. Set the trigger (daily, weekly, etc.)
4. Set the action to "Start a Program"
5. Browse to the location of your script (you may need to create a .bat file that calls the .sh script using Git Bash)
6. Complete the wizard

## Option 4: Using VSCode Extensions

1. Install the "Git Automator" extension in VSCode
2. Configure it to automatically commit and push changes at regular intervals

## GitHub Actions Setup

The `.github/workflows/deploy.yml` file has been created to automatically deploy your site to Vercel when changes are pushed to GitHub.

To complete the setup:

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Add the following secrets:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

You can get these values from the Vercel dashboard or by running `vercel whoami` and `vercel projects list` with the Vercel CLI.
