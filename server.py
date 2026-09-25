import os
os.environ["GRADIO_SSR_MODE"] = "False"

import gradio as gr
import spaces
from main import app as fastapi_app

# ZeroGPU requires a decorated function bound to a Gradio event
@spaces.GPU
def gpu_init():
    return "ZeroGPU Ready"

# 1. Create Gradio demo
with gr.Blocks(title="Daily English AI Tutor", fill_width=True) as demo:
    gr.HTML('<meta http-equiv="refresh" content="0; url=/">')
    gr.Markdown("## 🎓 Daily English AI Tutor")
    gr.HTML('''
        <div style="text-align: center; margin: 20px 0;">
            <a href="/" target="_top" style="display:inline-block; padding:12px 24px; background:#4f46e5; color:white; border-radius:8px; text-decoration:none; font-weight:bold; font-size:16px;">
                🚀 Mở Ứng Dụng Toàn Màn Hình
            </a>
        </div>
    ''')

    btn = gr.Button("Init", visible=False)
    txt = gr.Textbox(visible=False)
    btn.click(fn=gpu_init, inputs=[], outputs=[txt])
    demo.load(fn=gpu_init, inputs=[], outputs=[txt])

# 2. Compile Gradio event graph so ZeroGPU scanner detects gpu_init
demo.queue()

# 3. Mount Gradio onto our FastAPI application at /gradio
# Root "/" and all "/api/*", "/static/*" are served by our FastAPI app
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
