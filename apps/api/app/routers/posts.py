from typing import List

from fastapi import APIRouter

from app.db.supabase import get_client
from app.models import Post, PostCreate

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("", response_model=Post, status_code=201)
async def create_post(post: PostCreate):
    client = get_client()
    result = client.table("posts").insert(post.model_dump()).execute()
    return result.data[0]


@router.get("", response_model=List[Post])
async def list_posts():
    client = get_client()
    result = (
        client.table("posts")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data
