import gradio as gr
from main import app as fastapi_app

# Create Gradio block to satisfy Hugging Face Spaces interface
demo = gr.Blocks(title="Daily English AI Tutor")
with demo:
    gr.Markdown("## 🎓 Daily English AI Tutor")
    gr.Markdown("Ứng dụng luyện giao tiếp tiếng Anh 10 câu/ngày cho Kỹ sư AI & đời sống hàng ngày.")
    gr.HTML('''
        <div style="text-align: center; margin: 20px 0;">
            <a href="/" target="_top" style="display:inline-block; padding:12px 24px; background:#4f46e5; color:white; border-radius:8px; text-decoration:none; font-weight:bold; font-size:16px;">
                🚀 Mở Ứng Dụng Đầy Đủ (Full App)
            </a>
        </div>
    ''')

# Mount Gradio onto our FastAPI application at /gradio
# Root `/` and all `/api/*` routes are handled by our FastAPI app in main.py
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
