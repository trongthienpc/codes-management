# Codes Management

## Giới thiệu

Codes Management là một ứng dụng web được phát triển để quản lý các biểu mẫu và mã biểu mẫu. Ứng dụng cung cấp giao diện trực quan để tạo, chỉnh sửa, và quản lý các loại biểu mẫu, biểu mẫu và chi tiết biểu mẫu.

## Tính năng chính

- Quản lý loại biểu mẫu : Tạo và quản lý các loại biểu mẫu khác nhau
- Quản lý biểu mẫu : Tạo, chỉnh sửa và xóa các biểu mẫu với mã và tên riêng
- Quản lý chi tiết biểu mẫu : Thêm và quản lý các chi tiết cho từng biểu mẫu
- Nhập/Xuất dữ liệu : Hỗ trợ nhập và xuất dữ liệu biểu mẫu
- Giao diện người dùng thân thiện : Sử dụng các thành phần UI hiện đại và trực quan

## Công nghệ sử dụng

- Frontend : Next.js, React, TailwindCSS
- Backend : Next.js API Routes
- Database : PostgreSQL với Prisma ORM
- Containerization : Docker và Docker Compose
- Styling : TailwindCSS, tw-animate-css
- Form Handling : React Hook Form với Zod validation
- UI Components : Radix UI, Lucide Icons

## Cấu trúc dữ liệu

Ứng dụng sử dụng ba model chính:

1. FormType : Quản lý các loại biểu mẫu
2. Form : Quản lý các biểu mẫu thuộc về một loại biểu mẫu
3. FormDetail : Quản lý chi tiết của từng biểu mẫu

## Cài đặt và chạy

### Yêu cầu

- Node.js (v18 trở lên) hoặc Bun
- PostgreSQL
- Docker và Docker Compose (tùy chọn)

### Cài đặt thủ công

1. Clone repository:

```
git clone <repository-url>
cd codes-management
```

2. Cài đặt dependencies:

```
npm install
# hoặc
bun install
```

3. Cấu hình file .env:

```
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>"
# thay vào <username>, <password>, <host>, <port>, <database> thông tin của cá bạn
```

4. Khởi tạo database:

```
npm run db:migrate
# hoặc
bun run db:migrate
```

5. Chạy ứng dụng ở môi trường development:

```
npm run dev
# hoặc
bun run dev
```

### Sử dụng Docker

1. Build image:

```
docker build -t codes-management:latest .
```

2. Chạy với Docker Compose:

```
docker-compose up -d
```

## Nhập dữ liệu mẫu

Để nhập dữ liệu mẫu từ file JSON:

```
npm run db:import
# hoặc
bun run db:import
```

## Triển khai

Ứng dụng có thể được triển khai lên các nền tảng hỗ trợ Next.js như Vercel, Netlify hoặc sử dụng Docker trên các dịch vụ cloud.
