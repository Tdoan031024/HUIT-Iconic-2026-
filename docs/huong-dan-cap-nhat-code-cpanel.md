# Huong dan cap nhat code tren cPanel

Tai lieu nay dung cho du an ICONIC2026 dang deploy tai:

```text
https://iconic2026.huitmedia.edu.vn
```

Thu muc tren host:

```text
/home/uqqwmiabhosting/public_html/iconic2026.huitmedia.edu.vn
```

Nhanh deploy hien tai:

```text
main
```

## 1. Vao dung thu muc du an

Mo Terminal trong cPanel, chay:

```bash
cd /home/uqqwmiabhosting/public_html/iconic2026.huitmedia.edu.vn
```

Kiem tra:

```bash
pwd
ls
```

Ket qua dung phai thay cac file/thu muc chinh:

```text
package.json
next.config.js
app
prisma
public
server.js
```

## 2. Bat Node.js va npm

Moi lan mo terminal moi, can chay:

```bash
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
```

Kiem tra:

```bash
node -v
npm -v
```

Neu hien version Node.js va npm la dung.

## 3. Kiem tra nhanh truoc khi cap nhat

```bash
git status --short --branch
```

Neu chi co file runtime tren host nhu `.htaccess`, `tmp`, `node_modules`, log thi co the tiep tuc.

Neu thay cac file code dang sua truc tiep tren host, can kiem tra truoc khi pull de tranh mat code.

## 4. Lay code moi nhat

Neu deploy tu nhanh `main`:

```bash
git pull origin main
```

Neu sau nay doi sang nhanh `dev`, dung:

```bash
git pull origin dev
```

## 5. Cai lai package neu can

Nen chay lenh nay sau khi pull code moi, dac biet khi `package.json` hoac `package-lock.json` co thay doi:

```bash
npm install --include=dev
```

## 6. Cap nhat Prisma va database

Generate Prisma Client:

```bash
npx prisma generate
```

Dong bo schema len MySQL:

```bash
npx prisma db push
```

Neu `db push` bao loi ket noi database, kiem tra lai file `.env`.

File `.env` tren host can co dang:

```env
DATABASE_URL="mysql://uqqwmiabhosting_huit_iconic:Huit%40media2019@localhost:3306/uqqwmiabhosting_huit_iconic"
JWT_SECRET="doi-thanh-chuoi-bi-mat-dai-kho-doan"
NEXT_PUBLIC_API_URL=""
```

Luu y: neu mat khau database co ky tu `@`, trong `DATABASE_URL` phai ghi thanh `%40`.

## 7. Build production

```bash
npm run build
```

Build thanh cong se co cac dong tuong tu:

```text
Compiled successfully
Generating static pages
Finalizing page optimization
```

Neu build loi, dung lai va doc loi truoc khi restart app.

## 8. Restart Node.js app trong cPanel

Vao:

```text
cPanel -> Setup Node.js App
```

Chon app:

```text
iconic2026.huitmedia.edu.vn
```

Bam:

```text
Restart
```

Thong tin app dung nen la:

```text
Application URL: iconic2026.huitmedia.edu.vn
Application root: public_html/iconic2026.huitmedia.edu.vn
Application startup file: server.js
Node.js version: 22
```

## 9. Kiem tra sau khi cap nhat

Mo trinh duyet:

```text
https://iconic2026.huitmedia.edu.vn/
https://iconic2026.huitmedia.edu.vn/admin/login
https://iconic2026.huitmedia.edu.vn/api/candidates
```

Ket qua dung:

- Trang chu hien giao dien ICONIC2026.
- Trang admin login hien form dang nhap.
- `/api/candidates` tra ve JSON hoac `[]`.

Kiem tra log neu web bi loi:

```bash
tail -100 stderr.log
```

## 10. Lenh cap nhat nhanh

Khi da chac chan khong co code sua tay tren host, co the chay nhanh:

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

Sau do vao cPanel `Setup Node.js App` va bam `Restart`.

## 11. Loi thuong gap

### npm: command not found

Nguyen nhan: terminal chua bat PATH Node.js.

Chay lai:

```bash
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
```

### DNS_PROBE_FINISHED_NXDOMAIN

Nguyen nhan: domain/subdomain chua tro DNS dung.

Can kiem tra DNS Zone cua `iconic2026.huitmedia.edu.vn`.

### LiteSpeed 404

Nguyen nhan thuong gap: request chua vao Node.js app, hoac `.htaccess` bi lan rule WordPress/SpeedyCache.

Kiem tra:

```bash
cat .htaccess
```

File `.htaccess` nen chi giu cau hinh Passenger:

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

Nguyen nhan thuong gap: Node app crash khi khoi dong.

Kiem tra:

```bash
tail -100 stderr.log
cat server.js
```

Sau khi sua loi, restart app trong cPanel.
