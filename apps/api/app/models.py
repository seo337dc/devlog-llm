from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PostCreate(BaseModel):
    title: str
    content: str
    category: str = "일상"


class Post(PostCreate):
    id: str
    created_at: datetime


class ConversationCreate(BaseModel):
    session_id: str
    role: str
    content: str
    context: Optional[str] = None


class Conversation(ConversationCreate):
    id: str
    created_at: datetime
