from __future__ import annotations

from fastapi import APIRouter

from app.db.supabase import get_client
from app.models import Conversation, ConversationCreate

router = APIRouter(prefix="/conversations", tags=["conversations"])


def save_conversation(
    session_id: str, role: str, content: str, context: str | None = None
) -> None:
    """다른 라우터(예: chat)에서 대화를 fire-and-forget으로 저장할 때 쓰는 내부 헬퍼.

    저장 실패가 원래 요청(예: 채팅 응답)을 막으면 안 되므로 예외를 삼킨다.
    """
    if not content:
        return
    try:
        get_client().table("conversations").insert(
            {
                "session_id": session_id,
                "role": role,
                "content": content,
                "context": context,
            }
        ).execute()
    except Exception:
        pass


@router.post("", response_model=Conversation, status_code=201)
async def create_conversation(conversation: ConversationCreate):
    client = get_client()
    result = client.table("conversations").insert(conversation.model_dump()).execute()
    return result.data[0]
