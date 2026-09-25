# ⚡ Daily English AI Tutor (Python + FastAPI + Gemini AI)

> 🎯 **Ứng dụng luyện giao tiếp tiếng Anh 10 câu/ngày dành riêng cho Kỹ sư AI (AI Engineer) & đời sống hằng ngày.**  
> Tích hợp phản xạ dịch Việt - Anh, nhận diện giọng nói (Microphone), phát âm bản ngữ US chuẩn Shadowing, và trợ lý chấm điểm / phân tích ngữ pháp chuyên sâu từ Google Gemini.

---

## 🌟 Tính Năng Nổi Bật

1. **20 Chủ đề giao tiếp thực chiến:**
   * **5 chủ đề Kỹ sư AI & Công nghệ:**
     * 🚀 *Daily Standup & Sprint Updates*
     * 🧠 *Explaining AI Models & Data Pipelines*
     * 🐛 *Debugging & Production Incidents (CUDA OOM, Latency)*
     * 🔍 *Code Review & Technical Feedback*
     * 💬 *Technical Meetings & Q&A*
   * **15 chủ đề đời sống hằng ngày:** Chào hỏi, Gọi món cafe/nhà hàng, Mua sắm, Sân bay, Khách sạn, Hỏi đường, Sức khỏe, v.v.
2. **Luyện Nói trực tiếp (Voice Input):**
   * Nhấn nút Micro và nói câu tiếng Anh của bạn. Web Speech API sẽ tự động chuyển giọng nói thành văn bản để gửi AI chấm điểm.
3. **Luyện Nghe & Shadowing (Text-to-Speech):**
   * Nghe AI đọc mẫu câu chuẩn bản ngữ US với 3 tốc độ: **0.8x** (nghe rõ từng âm để bắt chước), **1.0x** (tốc độ hội thoại chuẩn), **1.2x** (tốc độ tự nhiên bản xứ).
4. **Trí tuệ nhân tạo Gemini AI Coach:**
   * Chấm điểm từ 0 đến 100.
   * Chỉ rõ từng lỗi ngữ pháp (thì, mạo từ, cấu trúc câu) kèm **giải thích cặn kẽ bằng tiếng Việt**.
   * Đề xuất **cách nói tự nhiên hơn của người bản xứ (Native Alternative / Collocations / Phrasal Verbs)**.
   * Gợi ý từ vựng và phiên âm IPA.
5. **Theo dõi tiến độ & Giữ lửa học tập:**
   * **Chuỗi ngày học liên tục (🔥 Streak):** Tự động cộng ngày khi bạn hoàn thành bài học mỗi ngày.
   * **Mục tiêu 10 câu/ngày:** Thanh tiến độ trực quan giúp bạn duy trì thói quen.
   * **Sổ tay lỗi sai (Mistakes Notebook):** Tự động lưu lại các câu bạn làm sai hoặc điểm dưới 75 để ôn tập lại bất kỳ lúc nào.
   * **Tạo câu mới vô hạn:** Bấm *"✨ Tạo thêm câu mới với AI"* để Gemini sinh thêm các tình huống mới theo chủ đề.

---

## 🚀 Hướng Dẫn Khởi Chạy

Dự án được xây dựng 100% bằng **Python (FastAPI)** và giao diện Web Glassmorphic hiện đại.

### 1. Kích hoạt môi trường ảo & Khởi động Server
```powershell
# Kích hoạt môi trường ảo và chạy server FastAPI
.\.venv\Scripts\python.exe main.py
```

Server sẽ khởi chạy tại:
👉 **http://127.0.0.1:8000** (hoặc http://localhost:8000)

### 2. Cấu hình Gemini API Key
Bạn có thể cấu hình theo 1 trong 2 cách:
* **Cách 1 (Nhanh nhất):** Mở giao diện Web, bấm biểu tượng **Bánh răng (⚙️ Cài đặt)** ở góc trên bên phải, dán API Key vào và bấm *"Lưu cấu hình"*.
* **Cách 2:** Tạo file `.env` từ `.env.example` và điền key:
  ```env
  GEMINI_API_KEY=AIzaSy...
  ```
*(Nếu chưa có API Key, bạn có thể lấy hoàn toàn miễn phí tại [Google AI Studio](https://aistudio.google.com/)).*

---

## 📅 Lộ Trình 3 Tháng Bứt Phá Giao Tiếp Cho AI Engineer

* **Tháng 1: Phá băng phản xạ & Chuẩn hóa phát âm**
  * Mỗi ngày dịch và nói 10 câu trên App.
  * Bấm nút **Loa (0.8x hoặc 1.0x)** để nghe AI đọc mẫu, sau đó **nhại lại to rõ ràng 3 lần (Kỹ thuật Shadowing)** trước khi sang câu tiếp theo.
* **Tháng 2: Làm chủ giao tiếp công việc (Daily Standup & Tech Meetings)**
  * Tập trung vào 5 chủ đề công nghệ trên App: Báo cáo task, mô tả pipeline RAG/LLM, giải thích lỗi CUDA OOM.
  * Sử dụng nút **Micro** để nói trực tiếp thay vì gõ phím.
* **Tháng 3: Tự nhiên hóa ngôn từ & Thuyết trình kỹ thuật**
  * Đọc kỹ phần **"Cách nói tự nhiên hơn của người bản xứ"** để tích lũy phrasal verbs (*dig into, pin down, roll back, bring down latency*).
  * Mở **Sổ tay lỗi sai (📖)** cuối tuần để ôn lại toàn bộ những điểm ngữ pháp còn yếu.

---

## 🧪 Chạy Kiểm Thử (Tests)

Toàn bộ backend và dữ liệu đã được kiểm thử tự động bằng `pytest`:
```powershell
.\.venv\Scripts\pytest.exe
```

---

Chúc bạn có những giờ học tiếng Anh thật hứng khởi và đạt bước tiến nhảy vọt trong sự nghiệp AI Engineer!
