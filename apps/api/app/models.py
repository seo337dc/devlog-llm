from datetime import datetime

from pydantic import BaseModel


class PostCreate(BaseModel):
    title: str
    content: str


class Post(PostCreate):
    id: str
    created_at: datetime
