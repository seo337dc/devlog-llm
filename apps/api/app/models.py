from datetime import datetime

from pydantic import BaseModel


class PostCreate(BaseModel):
    title: str
    content: str
    category: str = "일상"


class Post(PostCreate):
    id: str
    created_at: datetime
