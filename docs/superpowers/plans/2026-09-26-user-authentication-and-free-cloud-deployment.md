# Kế Hoạch Triển Khai: Hệ Thống Đăng Nhập, Đăng Ký, Quên Mật Khẩu (Mã PIN) & Triển Khai Cloud Miễn Phí (Render.com)

## Danh Sách Công Việc (Task Breakdown)

### Task 1: Xây Dựng Core Models & Thư Viện Xác Thực (Auth Engine)
- **Mục tiêu**: Cung cấp hàm băm mật khẩu an toàn (PBKDF2-HMAC-SHA256 không phụ thuộc thư viện C ngoài), sinh mã PIN ngẫu nhiên 6 số, quản lý người dùng và phiên đăng nhập.
- **Tập tin cần tạo/sửa đổi**:
  - `app/models.py`: Bổ sung `UserRecord`, `AuthSession`, `RegisterRequest`, `LoginRequest`, `ForgotPasswordRequest`, `AuthResponse`.
  - `app/auth.py`: Xây dựng hàm băm, xác thực mật khẩu, sinh/kiểm tra mã PIN, tạo tài khoản và quản lý token phiên.
  - `tests/test_auth.py`: Viết 5 unit tests kiểm thử đăng ký, đăng nhập, mã PIN khôi phục.
- **Tiêu chí thành công**: `pytest tests/test_auth.py` chạy qua 100%.

---

### Task 2: Phân Vùng & Cách Ly Dữ Liệu Theo Người Dùng (Per-User Storage Isolation)
- **Mục tiêu**: Đảm bảo mỗi người dùng có không gian lưu trữ riêng biệt trong `data/users_data/{user_id}/` cho Streak, Lộ trình, Lỗi sai và Trạng thái từ vựng Flashcard SRS ("Đã biết"/"Chưa nhớ").
- **Tập tin cần sửa đổi**:
  - `app/storage.py`: Cập nhật `load_progress(user_id)`, `update_progress(..., user_id)`, `review_vocabulary_for_user(vocab_id, grade, user_id)`, `complete_roadmap_day_for_user(day, user_id)`.
  - `tests/test_user_storage_isolation.py`: Viết test xác nhận dữ liệu của 2 user độc lập hoàn toàn.
- **Tiêu chí thành công**: `pytest tests/test_user_storage_isolation.py` chạy qua 100%.

---

### Task 3: Xây Dựng Các Endpoint REST API Xác Thực (`main.py`)
- **Mục tiêu**: Tạo các route `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/me`, `/api/auth/logout`.
- **Tập tin cần sửa đổi**:
  - `main.py`: Khai báo dependency `get_current_user_id` và các endpoint auth.
  - `tests/test_auth_api.py`: Viết 5 integration tests kiểm thử các endpoint API.
- **Tiêu chí thành công**: `pytest tests/test_auth_api.py` chạy qua 100%.

---

### Task 4: Client API & Quản Lý State Frontend (`api.js`, `state.js`)
- **Mục tiêu**: Lưu Bearer token vào `localStorage`, tự động đính kèm header `Authorization: Bearer <token>` vào mọi yêu cầu API, quản lý `state.auth`.
- **Tập tin cần sửa đổi**:
  - `public/js/state.js`: Thêm `state.auth = { user, token, isGuest }` và hàm `setAuthUser`, `clearAuthUser`.
  - `public/js/api.js`: Thêm `registerUser()`, `loginUser()`, `forgotPassword()`, `fetchMe()`, `logoutUser()`.

---

### Task 5: Giao Diện Modal Đăng Nhập, Đăng Ký, Quên Mật Khẩu & Header Profile
- **Mục tiêu**: Thêm huy hiệu người dùng trên Header, Modal xác thực 3 tab (Đăng nhập, Đăng ký, Quên mật khẩu kèm mã PIN), hộp thoại sao chép mã PIN khôi phục.
- **Tập tin cần sửa đổi**:
  - `public/index.html`: Thêm nút profile ở header và `#auth-modal`.
  - `public/css/components.css`: CSS Glassmorphism cho Auth Modal, tab switcher, input và PIN recovery box.
  - `public/js/app.js`: Xử lý sự kiện mở/đóng modal, submit form, hiển thị avatar và mã PIN.

---

### Task 6: Cấu Hình Triển Khai Cloud Miễn Phí (Render.com) & Kiểm Thử Toàn Diện
- **Mục tiêu**: Tạo `render.yaml`, `Procfile`, cập nhật `requirements.txt`, chạy toàn bộ test suite và dùng `browser_subagent` kiểm thử trên trình duyệt.
- **Tập tin cần tạo/sửa đổi**:
  - `render.yaml`: Blueprint cấu hình Web Service miễn phí trên Render.
  - `Procfile`: Lệnh khởi chạy server.
  - `requirements.txt`: Đóng gói danh sách thư viện.
  - `walkthrough.md`: Hướng dẫn chi tiết từng bước deploy từ GitHub lên Render.com.
- **Tiêu chí thành công**: Tất cả các test qua 100%, browser subagent đăng ký tài khoản và đăng nhập thành công.
