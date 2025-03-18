# GitHub Automation for Civion Website

This document explains the various methods available to automate syncing your local changes with GitHub, which will then trigger deployments to Vercel.

## Quick Start

Choose one of these methods based on your preference:

1. **Manual Push**: Run `./push-to-github.sh` whenever you want to push changes
2. **Automatic Push After Commit**: Run `./setup-git-hooks.sh` once to set up Git hooks
3. **Scheduled Sync**: Follow instructions in `setup-auto-sync.md` to set up automatic syncing
4. **VSCode Integration**: Use the VSCode tasks to push changes from within the editor

## Available Scripts

### 1. push-to-github.sh

A simple script that adds all changes, commits them with a timestamp, and pushes to GitHub.

Usage:
```bash
./push-to-github.sh
```

### 2. auto-sync.sh

A more advanced script that pulls changes first, checks if there are any local changes, and only commits and pushes if necessary.

Usage:
```bash
./auto-sync.sh
```

### 3. setup-git-hooks.sh

Sets up a Git hook that automatically pushes changes after each commit.

Usage:
```bash
./setup-git-hooks.sh
```

After running this script once, your normal Git workflow will automatically push changes:
```bash
git add .
git commit -m "Your changes"
# Auto-push happens here
```

## VSCode Integration

VSCode tasks have been set up to make it easy to push changes from within the editor:

1. Press `Cmd+Shift+B` (macOS) or `Ctrl+Shift+B` (Windows/Linux)
2. Select "Push to GitHub" or "Auto-Sync with GitHub"

## Scheduled Automation

For fully automated syncing, see `setup-auto-sync.md` for instructions on setting up:

- Cron jobs (macOS/Linux)
- Launchd (macOS)
- Task Scheduler (Windows)
- VSCode extensions

## GitHub Actions

A GitHub Actions workflow has been set up in `.github/workflows/deploy.yml` to automatically deploy your site to Vercel when changes are pushed to GitHub.

To complete the setup, follow the instructions in `setup-auto-sync.md` to add the required secrets to your GitHub repository.
