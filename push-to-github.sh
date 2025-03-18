#!/bin/bash

# Add all changes
git add .

# Get the current date and time for the commit message
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Commit with timestamp
git commit -m "Auto update: $TIMESTAMP"

# Push to GitHub
git push

echo "Changes pushed to GitHub successfully!"
