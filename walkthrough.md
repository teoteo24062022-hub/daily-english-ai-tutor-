# Hướng Dẫn Sử Dụng & Triển Khai Cloud Miễn Phí (Render.com)

Ứng dụng **Daily English AI Tutor** hiện đã được tích hợp đầy đủ hệ thống **Xác thực Đa Người Dùng (Multi-User Authentication)**, phân vùng dữ liệu cá nhân hóa (Streak, Lộ trình 3 tháng, Sổ tay lỗi sai, Kho từ vựng Flashcard SRS) và sẵn sàng đưa lên Cloud miễn phí 100% để bạn có thể mở đường dẫn URL trên điện thoại, iPad hoặc máy tính bất kỳ lúc nào.

---

## 1. Tính Năng Tài Khoản Học Viên Mới

### 👤 Chế độ Khách (Guest Mode) & Chế độ Đăng Nhập
- **Khách học thử**: Bạn có thể mở web và làm bài tập ngay lập tức mà không bị bắt buộc phải đăng nhập.
- **Tự động chuyển giao dữ liệu (Merge Data)**: Khi bạn bấm nút **`[👤 Đăng nhập]`** trên thanh Header và tạo tài khoản hoặc đăng nhập, toàn bộ câu đã luyện tập, chuỗi ngày streak và lỗi sai trong phiên khách sẽ tự động được gộp vào tài khoản của bạn.

### 🔐 Bảo Mật & Mã PIN Khôi Phục (Recovery PIN 6 Số)
- Không cần cấu hình mail server hay gửi OTP phức tạp.
- Khi tạo tài khoản mới thành công, hệ thống sẽ cấp ngay **Mã PIN 6 số bí mật** (ví dụ: `739201`).
- Nếu quên mật khẩu, bạn chỉ cần bấm **`Quên mật khẩu?`**, nhập Email và Mã PIN 6 số này để đặt lại mật khẩu mới ngay tức thì.

---

## 2. Hướng Dẫn Deploy Lên Render.com Miễn Phí 100% (Chỉ 3 Phút)

**Render.com** cung cấp gói **Free Web Service** vĩnh viễn, tự động cấp chứng chỉ bảo mật HTTPS và tên miền dạng `https://<ten-app>.onrender.com`.

### Bước 1: Đẩy mã nguồn lên GitHub
Mở Terminal tại thư mục project `f:\ENGLISH LEARN` và chạy các lệnh:
```bash
git add .
git commit -m "feat: complete user authentication and render deployment config"
git branch -M main
git remote add origin https://github.com/<tai-khoan-github-cua-ban>/<ten-repository>.git
git push -u origin main
```

### Bước 2: Tạo Web Service trên Render.com
1. Truy cập [render.com](https://render.com) và đăng ký tài khoản miễn phí (khuyên dùng Đăng nhập bằng GitHub).
2. Tại trang Dashboard, nhấn nút **New +** ở góc trên bên phải ➔ Chọn **Web Service**.
3. Chọn kho chứa GitHub (Repository) vừa đẩy lên ở Bước 1.
4. Render sẽ tự động đọc file `render.yaml` và `Procfile`. Bạn chỉ cần xác nhận các thông tin:
   - **Name**: `daily-english-ai-tutor` (hoặc tên bạn thích).
   - **Region**: Singapore (hoặc Oregon / Frankfurt).
   - **Branch**: `main`.
   - **Runtime**: `Python 3`.
   - **Build Command**: `pip install -r requirements.txt`.
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
   - **Instance Type**: Chọn **Free** ($0/tháng).

### Bước 3: Cài đặt Biến môi trường (Environment Variables)
Trong mục **Environment Variables** trên Render, thêm:
- `PYTHON_VERSION`: `3.11.9`
- `GEMINI_API_KEY`: *(Nhập mã Gemini API Key miễn phí lấy từ Google AI Studio nếu muốn kích hoạt sẵn cho toàn server)*.

### Bước 4: Nhấn "Deploy Web Service"
- Render sẽ tiến hành build và khởi động ứng dụng trong khoảng 1–2 phút.
- Khi màn hình hiện chữ **`Live`**, bạn sẽ nhận được đường dẫn URL công khai (ví dụ: `https://daily-english-ai-tutor.onrender.com`).
- Bây giờ bạn có thể gửi link này cho bạn bè, lưu bookmark trên điện thoại để mở học tiếng Anh hàng ngày!

---

## 3. Khởi Chạy Local Trên Máy Tính
Nếu muốn chạy trực tiếp trên máy tính:
```bash
.venv\Scripts\uvicorn.exe main:app --reload --host 127.0.0.1 --port 8000
```
Truy cập trình duyệt: [http://127.0.0.1:8000](http://127.0.0.1:8000)
