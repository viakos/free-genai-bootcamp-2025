from fastapi import FastAPI
from .api.routes import router

# Initialize FastAPI app
app = FastAPI(
    title="Listening Comprehension API",
    description="API for processing YouTube transcripts and generating structured questions",
    version="1.0.0"
)

# Include routers
app.include_router(router)

# If running this file directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
