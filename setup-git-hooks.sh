#!/bin/bash

# This script sets up Git hooks to automatically push changes after commits

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Create the post-commit hook
mkdir -p .git/hooks
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash

echo "Auto-pushing changes to GitHub..."
git push

# If push fails (e.g., due to conflicts), notify the user
if [ $? -ne 0 ]; then
    echo "⚠️ Auto-push failed. You may need to pull changes first or resolve conflicts."
    echo "Run 'git pull' and then 'git push' manually."
else
    echo "✅ Changes successfully pushed to GitHub!"
fi
EOF

# Make the hook executable
chmod +x .git/hooks/post-commit

echo "Git hook installed successfully! Your changes will now be automatically pushed to GitHub after each commit."
echo "To commit changes, you can still use your normal Git workflow:"
echo "  git add ."
echo "  git commit -m 'Your commit message'"
echo "After the commit, the changes will be automatically pushed to GitHub."
