from __future__ import annotations

import json
import os

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from groq import Groq
from pydantic import BaseModel

from app.routers.conversations import save_conversation

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM_PROMPT = (
    "당신은 개인 개발 블로그 'devlog-llm'의 AI 어시스턴트입니다. "
    "사용자가 개발 관련 회고/블로그 글을 쓰는 것을 돕습니다. "
    "친절하고 간결하게 답변해주세요."
)

MODEL = "openai/gpt-oss-20b"
CONTEXT = "devlog-chat"


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    session_id: str


@router.post("")
async def chat(data: ChatRequest):
    client = Groq(api_key=os.environ["GROQ_API_KEY"])

    last_user = next((m for m in reversed(data.messages) if m.role == "user"), None)
    if last_user:
        save_conversation(data.session_id, "user", last_user.content, CONTEXT)

    groq_messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *[{"role": m.role, "content": m.content} for m in data.messages],
    ]

    def generate():
        full_text = ""
        stream = client.chat.completions.create(
            model=MODEL,
            messages=groq_messages,
            max_tokens=1024,
            stream=True,
        )
        for chunk in stream:
            text = chunk.choices[0].delta.content or ""
            if text:
                full_text += text
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"
        save_conversation(data.session_id, "assistant", full_text, CONTEXT)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
