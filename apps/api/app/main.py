import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.routers import posts

app = FastAPI(title="devlog-llm API")

allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3010").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(posts.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
