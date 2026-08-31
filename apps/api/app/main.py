from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from app.routers import posts  # noqa: E402

app = FastAPI(title="devlog-llm API")

app.include_router(posts.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
