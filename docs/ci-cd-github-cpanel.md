# CI/CD GitHub cho ICONIC 2026

Workflow nằm tại `.github/workflows/ci-cd.yml`.

## Quy trình

Mỗi lần push vào nhánh `main`, GitHub Actions sẽ:

1. Cài Node.js 22 và dependencies bằng `npm ci`.
2. Kiểm tra TypeScript.
3. Build production Next.js.
4. SSH vào cPanel.
5. Pull code mới nhất từ `origin/main`.
6. Đồng bộ Prisma database.
7. Build lại và restart CloudLinux Passenger.

Bước deploy sử dụng `npm install` để tận dụng dependencies đã có trên host, bỏ generate Prisma trùng lặp và giới hạn bộ nhớ Node để tránh CloudLinux kết thúc tiến trình với lỗi `137`.

Database production và `.env` không nằm trong repository. Workflow chỉ sử dụng `.env` hiện có trên host.

## Cấu hình GitHub Secrets

Vào repository trên GitHub:

`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Tạo các secret:

| Secret | Giá trị |
|---|---|
| `CPANEL_HOST` | hostname SSH của host, ví dụ `turbohost-122404.inet.vn` |
| `CPANEL_USER` | `uqqwmiabhosting` |
| `CPANEL_SSH_PORT` | port SSH của host, thường là `22` |
| `CPANEL_SSH_KEY` | private key dùng để SSH vào cPanel |

Không đưa mật khẩu database, `.env` hoặc private key vào code hay file workflow.

## Tạo SSH key

Tạo key trên máy local:

```bash
ssh-keygen -t ed25519 -C "github-actions-iconic" -f ~/.ssh/iconic_github_actions
```

Thêm nội dung file `.pub` vào cPanel → **SSH Access** → **Manage SSH Keys** → **Import Key**, sau đó authorize key.

Đưa toàn bộ nội dung private key `iconic_github_actions` vào secret `CPANEL_SSH_KEY`.

## Kiểm tra

Push lên `main`:

```bash
git add .github/workflows/ci-cd.yml docs/ci-cd-github-cpanel.md
git commit -m "ci: deploy main to cpanel"
git push origin main
```

Theo dõi tại GitHub → tab **Actions**.

Sau khi workflow thành công, kiểm tra:

```text
https://iconic2026.huitmedia.edu.vn/
https://iconic2026.huitmedia.edu.vn/api/health
```

Nếu host không cho phép SSH từ GitHub Actions hoặc dùng port SSH khác, cập nhật secret `CPANEL_SSH_PORT` và kiểm tra quyền SSH trước khi chạy lại workflow.
