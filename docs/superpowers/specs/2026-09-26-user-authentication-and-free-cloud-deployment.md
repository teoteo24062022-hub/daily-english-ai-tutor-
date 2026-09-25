# Thiết Kế Chi Tiết: Hệ Thống Đăng Nhập, Đăng Ký, Quên Mật Khẩu (Mã PIN) & Triển Khai Cloud Miễn Phí (Render.com)

## 1. Mục Tiêu & Yêu Cầu (Requirements & Goals)
- **Tài khoản & Xác thực**:
  - Hỗ trợ đầy đủ luồng: **Đăng nhập (Login)**, **Đăng ký (Register)**, và **Quên mật khẩu (Forgot Password)**.
  - Cho phép người mới học thử ở chế độ **Khách (Guest)** mà không bị chặn, có nút Đăng nhập / Đăng ký ở thanh Header để đồng bộ và lưu trữ lâu dài.
  - Cơ chế quên mật khẩu bảo mật bằng **Mã PIN Khôi Phục (Recovery PIN 6 số)** được cấp khi tạo tài khoản, không cần cấu hình server Email rắc rối, chạy an toàn và độc lập 100%.
  - Khi người dùng đăng nhập từ chế độ Khách, dữ liệu học thử (Streak, câu đã hoàn thành) tự động sáp nhập (merge) vào tài khoản chính.
- **Phân vùng dữ liệu người dùng (Per-User Data Isolation)**:
  - Mỗi tài khoản người dùng có một không gian dữ liệu riêng biệt:
    - Tiến độ học (Streak, số câu làm trong ngày, tổng số câu, danh sách lỗi sai).
    - Trạng thái từ vựng Flashcard SRS (đánh dấu "Đã biết" / "Chưa nhớ" / các cấp độ giãn cách SRS).
    - Lộ trình 3 tháng (Roadmap ngày hiện tại, các ngày đã hoàn thành).
    - Lịch sử hội thoại Roleplay AI.
- **Triển khai Online miễn phí (Free Cloud Hosting)**:
  - Cung cấp cấu hình chuẩn hóa (`render.yaml`, `Procfile`, `requirements.txt`) để đưa toàn bộ project lên **Render.com**.
  - Người dùng có thể truy cập qua một đường dẫn URL công khai vĩnh viễn (ví dụ: `https://daily-english-ai.onrender.com`) trên điện thoại, iPad hay bất kỳ máy tính nào mà không tốn 1 đồng chi phí.

---

## 2. Kiến Trúc Hệ Thống (Architecture & Data Flow)

### 2.1. Cấu Trúc Lưu Trữ Dữ Liệu
```
data/
├── vocabulary.json          # 4,016 từ vựng gốc chia sẻ chung
├── topics.json              # Các chủ đề luyện tập mẫu
├── roadmap.json             # Giáo trình khung 90 ngày
├── users.json               # Danh sách tài khoản người dùng
├── sessions.json            # Token phiên đăng nhập còn hiệu lực
└── users_data/              # Thư mục lưu trữ riêng cho từng người dùng
    └── {user_id}/
        ├── progress.json    # Streak, số câu, nhật ký lỗi cá nhân
        ├── roadmap.json     # Tiến độ ngày học cá nhân
        └── srs_reviews.json # Bảng trạng thái SRS của các từ vựng đã học
```

### 2.2. Mô Hình Dữ Liệu (Pydantic Models trong `app/models.py`)
- `UserRecord`:
  - `id`: chuỗi định danh duy nhất (`usr_<timestamp>_<hex>`).
  - `email`: email đăng ký (chuẩn hóa chữ thường).
  - `username`: tên hiển thị của học viên.
  - `password_hash`: mật khẩu đã băm kèm muối (Salted SHA256 / PBKDF2).
  - `salt`: chuỗi muối ngẫu nhiên (32 ký tự hex).
  - `recovery_pin_hash`: băm của mã PIN 6 số dùng để khôi phục mật khẩu.
  - `created_at`: thời gian tạo tài khoản.
- `AuthSession`:
  - `token`: Bearer token ngẫu nhiên (64 ký tự hex).
  - `user_id`: ID người dùng sở hữu phiên.
  - `created_at`, `expires_at`: thời hạn hiệu lực (30 ngày).
- `RegisterRequest`: `{ email, username, password }`
- `LoginRequest`: `{ email_or_username, password }`
- `ForgotPasswordRequest`: `{ email, recovery_pin, new_password }`
- `AuthResponse`: `{ token, user, recovery_pin (chỉ trả về 1 lần khi đăng ký) }`

### 2.3. Các Endpoint Backend API (`main.py`)
| Phương thức | Endpoint | Chức năng | Quyền truy cập |
|---|---|---|---|
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới, sinh mã PIN 6 số | Public |
| `POST` | `/api/auth/login` | Đăng nhập tài khoản, cấp Bearer Token | Public |
| `POST` | `/api/auth/forgot-password` | Đặt lại mật khẩu bằng Email + Mã PIN | Public |
| `GET` | `/api/auth/me` | Lấy thông tin tài khoản hiện tại | Bearer Token / Public |
| `POST` | `/api/auth/logout` | Hủy phiên đăng nhập hiện tại | Bearer Token |

---

## 3. Thiết Kế Giao Diện Người Dùng (UI/UX)

### 3.1. Header Profile & Auth Trigger
- **Trạng thái Khách (Guest)**:
  - Nút bấm nổi bật: `[👤 Khách - Đăng nhập / Đăng ký]` tại thanh Header.
- **Trạng thái Đã Đăng Nhập**:
  - Huy hiệu avatar: `[🎓 {username}]` kèm menu thả xuống:
    - Thông tin tài khoản (`email`, `ngày tham gia`).
    - Xem lại Mã PIN khôi phục tài khoản.
    - Nút `[🚪 Đăng xuất]`.

### 3.2. Modal Xác Thực Đa Năng (`#auth-modal`)
Giao diện Dark Glassmorphism sang trọng với 3 Tab chuyển đổi mượt mà:
1. **Tab Đăng Nhập (Login Tab)**:
   - Trường nhập: Email hoặc Tên đăng nhập.
   - Trường nhập: Mật khẩu (kèm icon ẩn/hiện mật khẩu).
   - Nút liên kết: *"Quên mật khẩu?"* (chuyển sang Tab 3).
   - Nút hành động: `[🚀 Đăng nhập ngay]`.
   - Chuyển hướng: *"Chưa có tài khoản? Đăng ký miễn phí"*.
2. **Tab Đăng Ký (Register Tab)**:
   - Trường nhập: Tên hiển thị (Username).
   - Trường nhập: Email.
   - Trường nhập: Mật khẩu (tối thiểu 6 ký tự).
   - Nút hành động: `[✨ Tạo tài khoản mới]`.
   - **Hộp thoại thông báo mã PIN khôi phục (PIN Recovery Notice)**:
     - Khi đăng ký thành công, popup hiển thị mã PIN 6 số màu vàng óng nổi bật kèm nút sao chép `[📋 Sao chép mã PIN]`.
3. **Tab Quên Mật Khẩu (Forgot Password Tab)**:
   - Trường nhập: Email đã đăng ký.
   - Trường nhập: Mã PIN khôi phục 6 số.
   - Trường nhập: Mật khẩu mới.
   - Nút hành động: `[🔒 Đặt lại mật khẩu & Đăng nhập]`.

---

## 4. Hướng Dẫn & Cấu Hình Triển Khai Cloud Miễn Phí (Render.com)

1. **Chuẩn bị cấu hình trong mã nguồn**:
   - `render.yaml`: File định nghĩa Blueprint Service miễn phí trên Render.
   - `Procfile`: Lệnh khởi chạy server: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`.
   - Cập nhật `requirements.txt` đảm bảo đủ các thư viện (`fastapi`, `uvicorn`, `pydantic`, `google-genai`,...).
2. **Quy trình đưa lên Render.com (3 phút, miễn phí 100%)**:
   - Bước 1: Đẩy mã nguồn lên kho chứa GitHub cá nhân.
   - Bước 2: Đăng ký tài khoản miễn phí tại [render.com](https://render.com).
   - Bước 3: Nhấn **New +** ➔ **Web Service** ➔ Chọn GitHub Repo.
   - Bước 4: Nhập Build Command: `pip install -r requirements.txt` và Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
   - Bước 5: Thêm biến môi trường `GEMINI_API_KEY` (tùy chọn) trong mục **Environment Variables**.
   - Bước 6: Nhấn **Deploy Web Service**. Sau 1-2 phút, Render sẽ cấp một đường link HTTPS công khai (ví dụ: `https://daily-english-ai.onrender.com`) để bạn sử dụng trên mọi thiết bị.

---

## 5. Kế Hoạch Kiểm Thử (Verification Plan)
- **Unit & Integration Tests**:
  - Test đăng ký tài khoản mới và sinh mã PIN.
  - Test đăng nhập với mật khẩu đúng và sai.
  - Test khôi phục mật khẩu bằng mã PIN hợp lệ và không hợp lệ.
  - Test cách ly dữ liệu: Đảm bảo tài khoản A không thấy lịch sử tiến độ/SRS của tài khoản B.
  - Test duy trì dữ liệu Guest Mode khi người dùng chưa đăng nhập.
- **Browser Automation Verification**:
  - Mở web, kiểm tra giao diện Guest.
  - Đăng ký tài khoản mới, nhận mã PIN.
  - Đăng xuất, thử tính năng quên mật khẩu bằng mã PIN.
  - Đăng nhập lại với mật khẩu mới, kiểm tra hiển thị thông tin học viên trên Header.
