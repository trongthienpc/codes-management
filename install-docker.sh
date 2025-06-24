#!/bin/bash

# Đảm bảo script được chạy với quyền root
if [ "$(id -u)" != "0" ]; then
   echo "Script này cần được chạy với quyền root" 1>&2
   exit 1
fi

echo "===== Bắt đầu cài đặt Docker trên Ubuntu ====="

# Bước 1: Cập nhật danh sách gói
echo "Đang cập nhật danh sách gói..."
apt-get update

# Bước 2: Cài đặt các gói phụ thuộc
echo "Đang cài đặt các gói phụ thuộc..."
apt-get install -y ca-certificates curl

# Bước 3: Tạo thư mục cho khóa GPG
echo "Đang thiết lập thư mục cho khóa GPG..."
install -m 0755 -d /etc/apt/keyrings

# Bước 4: Tải và cài đặt khóa GPG chính thức của Docker
echo "Đang tải khóa GPG của Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Bước 5: Thêm repository Docker vào nguồn APT
echo "Đang thêm repository Docker..."
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Bước 6: Cập nhật lại danh sách gói
echo "Đang cập nhật lại danh sách gói..."
apt-get update

# Bước 7: Cài đặt Docker Engine
echo "Đang cài đặt Docker Engine..."
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Bước 8: Kiểm tra cài đặt
echo "Kiểm tra cài đặt Docker..."
docker --version

# Bước 9: Khởi động và kích hoạt Docker khi khởi động
echo "Đang khởi động và kích hoạt Docker..."
systemctl start docker
systemctl enable docker

# Bước 10: Thêm người dùng hiện tại vào nhóm docker (nếu có biến $SUDO_USER)
if [ -n "$SUDO_USER" ]; then
    echo "Đang thêm người dùng $SUDO_USER vào nhóm docker..."
    usermod -aG docker $SUDO_USER
    echo "Người dùng $SUDO_USER đã được thêm vào nhóm docker."
    echo "Vui lòng đăng xuất và đăng nhập lại để áp dụng thay đổi nhóm."
fi

# Bước 11: Kiểm tra cài đặt bằng cách chạy container hello-world
echo "Kiểm tra cài đặt bằng container hello-world..."
docker run hello-world

echo "===== Cài đặt Docker hoàn tất ====="
echo "Để sử dụng Docker mà không cần sudo, hãy đăng xuất và đăng nhập lại."