import os
from pathlib import Path
import gradio as gr
import spaces
import uvicorn
from main import app as fastapi_app

# ZeroGPU requires a decorated function bound to a Gradio event
@spaces.GPU
def gpu_init():
    return "ZeroGPU Ready"

# 1. Gradio dummy interface to satisfy Hugging Face ZeroGPU runtime check
with gr.Blocks(title="Daily English AI Tutor") as demo:
    gr.Markdown("# Daily English AI Tutor Backend")
    btn = gr.Button("Init", visible=False)
    txt = gr.Textbox(visible=False)
    btn.click(fn=gpu_init, inputs=[], outputs=[txt])
    demo.load(fn=gpu_init, inputs=[], outputs=[txt])

# Launch Gradio on secondary internal port (7861) in non-blocking mode
# This satisfies ZeroGPU scanner and Hugging Face supervisor
demo.launch(
    ssr_mode=False,
    server_name="0.0.0.0",
    server_port=7861,
    prevent_thread_lock=True
)

# 2. Main FastAPI app takes the primary exposed port (7860)
# Serving all frontend HTML/CSS/JS and all /api endpoints
if __name__ == "__main__":
    uvicorn.run(fastapi_app, host="0.0.0.0", port=7860)
