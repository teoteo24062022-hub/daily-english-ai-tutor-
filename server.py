import os
from pathlib import Path
import gradio as gr
import spaces
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from main import app as fastapi_app

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"

# ZeroGPU requires a decorated function bound to a Gradio event
@spaces.GPU
def gpu_init():
    return "ZeroGPU Ready"

# 1. Create Gradio demo interface with iframe pointing to /web
with gr.Blocks(title="Daily English AI Tutor", fill_width=True) as demo:
    gr.HTML('''
        <div style="text-align: center; margin-bottom: 12px; font-family: system-ui, sans-serif;">
            <h1 style="margin: 0; font-size: 24px; color: #1e293b;">🎓 Daily English AI Tutor</h1>
            <p style="margin: 4px 0 14px; color: #64748b; font-size: 14px;">Luyện giao tiếp tiếng Anh 10 câu/ngày cho Kỹ sư AI & đời sống hàng ngày</p>
            <a href="/web" target="_blank" style="display:inline-block; padding:10px 22px; background:linear-gradient(135deg, #4f46e5, #7c3aed); color:white; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px; box-shadow:0 4px 12px rgba(79,70,229,0.3);">
                🚀 Mở Ứng Dụng Toàn Màn Hình (Khuyên dùng)
            </a>
        </div>
        <iframe src="/web" style="width: 100%; height: 850px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);"></iframe>
    ''')

    # Dummy components to register ZeroGPU event with orchestrator
    btn = gr.Button("Init", visible=False)
    txt = gr.Textbox(visible=False)
    btn.click(fn=gpu_init, inputs=[], outputs=[txt])
    demo.load(fn=gpu_init, inputs=[], outputs=[txt])

# 2. Compile Gradio app
app = gr.routes.App.create_app(demo)

# 3. Mount static assets and backend API onto Gradio's FastAPI instance
app.mount("/static", StaticFiles(directory=str(PUBLIC_DIR)), name="static")
app.mount("/api", fastapi_app)

@app.get("/web")
async def serve_full_web():
    index_file = PUBLIC_DIR / "index.html"
    return FileResponse(str(index_file))

# 4. Attach configured app back to demo so demo.launch uses it
demo.app = app

if __name__ == "__main__":
    demo.launch(ssr_mode=False, server_name="0.0.0.0", server_port=7860)
