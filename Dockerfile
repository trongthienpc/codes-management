# Sử dụng hình ảnh chính thức của Bun
FROM oven/bun:1.1.43 AS base
WORKDIR /usr/src/app

# Cài đặt phụ thuộc chỉ khi cần
FROM base AS deps
RUN mkdir -p /temp/dev
COPY package.json /temp/dev/
COPY prisma /temp/dev/prisma
RUN cd /temp/dev && bun install 

# Xây dựng mã nguồn chỉ khi cần
FROM base AS builder
WORKDIR /usr/src/app
COPY --from=deps /temp/dev/node_modules ./node_modules
COPY . . 

# Chạy lệnh để sinh mã Prisma nếu có
COPY prisma ./prisma
COPY .env .env
RUN bun run prisma generate

# Chạy lệnh để xây dựng ứng dụng
RUN bun run build 

# Image sản xuất, sao chép tất cả các tệp và chạy ứng dụng
FROM base AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Tạo người dùng và nhóm cho ứng dụng
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Sao chép các thư mục cần thiết từ image builder
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/.next/static ./.next/static

# Copy Prisma files and generated client
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/clients ./node_modules/@prisma/clients
COPY --from=builder /usr/src/app/prisma ./prisma


# Thay đổi quyền cho các thư mục cần thiết
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ENV NEXT_PUBLIC_HOST="http://192.168.1.8:3000"

# Chạy ứng dụng
CMD ["bun", "run", "server.js"]
