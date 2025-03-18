#!/bin/bash

# Change to the repository directory
cd "$(dirname "$0")"

# Pull latest changes first to avoid conflicts
echo "Pulling latest changes from GitHub..."
git pull

# Check if there are any changes to commit
if [[ -n $(git status -s) ]]; then
    echo "Changes detected, committing and pushing..."
    
    # Add all changes
    git add .
    
    # Get the current date and time for the commit message
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    
    # Commit with timestamp
    git commit -m "Auto update: $TIMESTAMP"
    
    # Push to GitHub
    git push
    
    echo "Changes pushed to GitHub successfully!"
else
    echo "No changes detected, nothing to commit."
fi
