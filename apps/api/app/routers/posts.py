from fastapi import APIRouter, HTTPException

from app.db.supabase import get_client
from app.models import Post, PostCreate

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("", response_model=Post, status_code=201)
async def create_post(post: PostCreate):
    client = get_client()
    result = client.table("posts").insert(post.model_dump()).execute()
    return result.data[0]


@router.get("", response_model=list[Post])
async def list_posts():
    client = get_client()
    result = (
        client.table("posts")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/{post_id}", response_model=Post)
async def get_post(post_id: str):
    client = get_client()
    result = client.table("posts").select("*").eq("id", post_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="post not found")
    return result.data[0]
