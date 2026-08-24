# cPanel Code Update Guide

This document is for the ICONIC2026 project currently deployed at:

```text
https://iconic2026.huitmedia.edu.vn
```

Host directory:

```text
/home/uqqwmiabhosting/public_html/iconic2026.huitmedia.edu.vn
```

Current deployment branch:

```text
main
```

## 1. Go to the correct project directory

Open Terminal in cPanel and run:

```bash
cd /home/uqqwmiabhosting/public_html/iconic2026.huitmedia.edu.vn
```

Verify:

```bash
pwd
ls
```

You should see core files/folders such as:

```text
package.json
next.config.js
app
prisma
public
server.js
```

## 2. Enable Node.js and npm

Each new terminal session requires:

```bash
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
```

Verify:

```bash
node -v
npm -v
```

If Node.js and npm versions are shown, the setup is correct.

## 3. Quick check before updating

```bash
git status --short --branch
```

If you only see host runtime files such as `.htaccess`, `tmp`, `node_modules`, or logs, you can continue.

If code files were edited directly on the host, review them first to avoid losing changes after pull.

## 4. Pull the latest code

If deploying from `main`:

```bash
git pull origin main
```

If you later switch to `dev`:

```bash
git pull origin dev
```

## 5. Reinstall packages if needed

Run this after pulling new code, especially when `package.json` or `package-lock.json` changes:

```bash
npm install --include=dev
```

## 6. Update Prisma and database

Generate Prisma Client:

```bash
npx prisma generate
```

Sync schema to MySQL:

```bash
npx prisma db push
```

If `db push` reports a database connection error, recheck the `.env` file.

Example `.env` on host:

```env
DATABASE_URL="******localhost:3306/uqqwmiabhosting_huit_iconic"
JWT_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_API_URL=""
```

Note: if the database password contains `@`, encode it as `%40` in `DATABASE_URL`.

## 7. Build for production

```bash
npm run build
```

A successful build should include lines similar to:

```text
Compiled successfully
Generating static pages
Finalizing page optimization
```

If build fails, stop and read the error before restarting the app.

## 8. Restart Node.js app in cPanel

Go to:

```text
cPanel -> Setup Node.js App
```

Select app:

```text
iconic2026.huitmedia.edu.vn
```

Click:

```text
Restart
```

Expected app configuration:

```text
Application URL: iconic2026.huitmedia.edu.vn
Application root: public_html/iconic2026.huitmedia.edu.vn
Application startup file: server.js
Node.js version: 22
```

## 9. Verify after update

Open in browser:

```text
https://iconic2026.huitmedia.edu.vn/
https://iconic2026.huitmedia.edu.vn/admin/login
https://iconic2026.huitmedia.edu.vn/api/candidates
```

Expected result:

- Home page displays the ICONIC2026 interface.
- Admin login page shows the login form.
- `/api/candidates` returns JSON or `[]`.

Check logs if the website errors:

```bash
tail -100 stderr.log
```

## 10. Quick update command set

When you are sure there are no manual code edits on the host, run:

```bash
cd /home/uqqwmiabhosting/public_html/iconic2026.huitmedia.edu.vn
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
git status --short --branch
git pull origin main
npm install --include=dev
npx prisma generate
npx prisma db push
npm run build
```

Then go to cPanel `Setup Node.js App` and click `Restart`.

## 11. Common issues

### npm: command not found

Cause: Node.js PATH is not enabled in this terminal session.

Run again:

```bash
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
```

### DNS_PROBE_FINISHED_NXDOMAIN

Cause: domain/subdomain DNS is not correctly pointed.

Check DNS Zone for `iconic2026.huitmedia.edu.vn`.

### LiteSpeed 404

Common cause: request is not routed to the Node.js app, or `.htaccess` contains conflicting WordPress/SpeedyCache rules.

Check:

```bash
cat .htaccess
```

`.htaccess` should only keep Passenger config:

```apache
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/uqqwmiabhosting/public_html/iconic2026.huitmedia.edu.vn"
PassengerBaseURI "/"
PassengerNodejs "/home/uqqwmiabhosting/nodevenv/public_html/iconic2026.huitmedia.edu.vn/22/bin/node"
PassengerAppType node
PassengerStartupFile server.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
```

### 500 Internal Server Error

Common cause: Node app crashes on startup.

Check:

```bash
tail -100 stderr.log
cat server.js
```

After fixing, restart the app in cPanel.
