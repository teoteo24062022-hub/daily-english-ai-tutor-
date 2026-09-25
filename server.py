import os
os.environ["GRADIO_SSR_MODE"] = "False"

import gradio as gr
import spaces
from main import app as fastapi_app

# ZeroGPU requires a decorated function bound to a Gradio event
@spaces.GPU
def gpu_init():
    return "ZeroGPU Ready"

# Gradio demo mounted at /gradio
with gr.Blocks(title="Daily English AI Tutor") as demo:
    gr.HTML('<meta http-equiv="refresh" content="0; url=/">')
    gr.Markdown("## 🎓 Daily English AI Tutor")
    gr.HTML('<a href="/" target="_top">🚀 Mở ứng dụng toàn màn hình</a>')

    btn = gr.Button("Init", visible=False)
    txt = gr.Textbox(visible=False)
    btn.click(fn=gpu_init, inputs=[], outputs=[txt])
    demo.load(fn=gpu_init, inputs=[], outputs=[txt])

# Mount Gradio at /gradio; root "/" and all "/api/*", "/static/*" belong to our FastAPI app!
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
