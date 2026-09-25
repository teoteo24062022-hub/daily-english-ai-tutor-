import gradio as gr
import spaces
from main import app as fastapi_app

# ZeroGPU requires a decorated function bound to a Gradio event
@spaces.GPU
def gpu_init():
    return "ZeroGPU Ready"

# Create Gradio demo
with gr.Blocks(title="Daily English AI Tutor") as demo:
    gr.HTML('<meta http-equiv="refresh" content="0; url=/static/index.html">')
    gr.Markdown("## 🎓 Daily English AI Tutor")
    gr.Markdown("Ứng dụng luyện giao tiếp tiếng Anh 10 câu/ngày cho Kỹ sư AI & đời sống hàng ngày.")
    gr.HTML('''
        <div style="text-align: center; margin: 20px 0;">
            <a href="/static/index.html" target="_top" style="display:inline-block; padding:12px 24px; background:#4f46e5; color:white; border-radius:8px; text-decoration:none; font-weight:bold; font-size:16px;">
                🚀 Mở Ứng Dụng Đầy Đủ (Full App)
            </a>
        </div>
    ''')

    # Event binding so ZeroGPU orchestrator detects the handler during scan
    btn = gr.Button("Init", visible=False)
    txt = gr.Textbox(visible=False)
    btn.click(fn=gpu_init, inputs=[], outputs=[txt])
    demo.load(fn=gpu_init, inputs=[], outputs=[txt])

# Mount Gradio onto our FastAPI application at /gradio
# Root `/` and all `/api/*` routes are handled by our FastAPI app in main.py
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
