# Deployment Troubleshooting Guide

This document contains solutions to common issues encountered when deploying or updating the portfolio site on an Azure VM.

## Issue: Git Pull Fails Due to Untracked Database

**Error Message:**
```text
error: The following untracked working tree files would be overwritten by merge:
        prisma/dev.db
Please move or remove them before you merge.
Aborting
```

**Cause:**
This error occurs because the SQLite database (`prisma/dev.db`) is committed and tracked in the GitHub repository. When you try to run `git pull` on the Azure VM, Git notices that the server already has its own locally generated `prisma/dev.db` file. To prevent accidentally overwriting the server's data, Git aborts the pull.

**Solution:**
Since the `dev.db` in GitHub contains the latest data you want to deploy, you can safely remove the blocking file on the server and try pulling again.

Run the following commands on your Azure VM:

```bash
# 1. Navigate to your project directory
cd ~/projects/portfolio-site

# 2. Delete the blocking database file on the server
rm prisma/dev.db

# 3. Pull the latest code and database from GitHub
git pull

# 4. Rebuild the Next.js application
npm run build

# 5. Restart the PM2 process to apply changes
pm2 restart portfolio
```
