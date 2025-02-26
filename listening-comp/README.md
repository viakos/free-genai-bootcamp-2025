# Japanese Learning Assistant

An interactive learning application that helps users learn Japanese through YouTube video transcripts. The application extracts meaningful content from videos, generates practice questions, and provides a semantic search interface for finding similar questions.

## Overview

The application consists of two main components:
- A FastAPI backend that handles video processing, question generation, and vector search
- A frontend interface for interacting with the learning content

### Key Features
- Extract transcripts from Japanese YouTube videos
- Generate practice questions using Amazon Bedrock LLM
- Store and retrieve questions using semantic search (ChromaDB + Amazon Titan Embeddings)
- Interactive question-answer interface

## Backend

### Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your AWS credentials and other settings
```

3. Start the server:
```bash
cd listening-comp
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Configuration

The application's settings are managed through `backend/settings.yaml`. This file contains configuration for AI models and their parameters:

```yaml
aws_bedrock:
  text_structurer:
    model_id: amazon.nova-micro-v1:0
    max_tokens: 2048
    temperature: 0.7
    top_p: 0.9

openai:
  text_structurer:
    gpt4o:
      model_id: gpt-4o-mini
```

#### Configuration Options:

- **AWS Bedrock Settings**:
  - `model_id`: The model identifier for AWS Bedrock
  - `max_tokens`: Maximum number of tokens in the response
  - `temperature`: Controls randomness in the response (0.0 to 1.0)
  - `top_p`: Controls diversity of the response via nucleus sampling

- **OpenAI Settings**:
  - `model_id`: The model identifier for OpenAI's GPT model

### API Endpoints

#### Question Management
- **Add Questions**:
  ```bash
  curl -X POST http://127.0.0.1:8000/api/add-questions \
    -H "Content-Type: application/json" \
    -d '{"questions": [{"text": "Question text", "answer": "Answer", "topic": "Topic"}]}'
  ```

- **Get All Questions**:
  ```bash
  curl http://127.0.0.1:8000/api/all-questions
  ```

- **Find Similar Questions**:
  ```bash
  curl "http://127.0.0.1:8000/api/similar-questions?query=your%20search%20query"
  ```

- **Clear Question Database**:
  ```bash
 curl -X DELETE http://localhost:8000/api/clear-questions
  ```

#### Video Processing
- **Get Video Transcript**:
  ```bash
  curl "http://127.0.0.1:8000/api/get-transcript?video_url=YOUTUBE_URL"
  ```

### Architecture

- **Vector Store**: Uses ChromaDB with Amazon Titan embeddings for semantic search
- **LLM Integration**: Amazon Bedrock for question generation
- **Data Storage**: Local persistence with ChromaDB in `data/chroma_db/`

## Frontend

### Setup

1. Install dependencies:
```bash
cd frontend
pip install -r requirements.txt
```

2. Start the frontend:
```bash
streamlit run main.py
```

### Features
- Video URL input and transcript extraction
- Question generation from transcripts
- Interactive question-answer interface
- Similar question search

## Development

### Directory Structure
```
listening-comp/
├── backend/
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helper functions
│   └── requirements.txt
├── frontend/
│   ├── main.py
│   └── requirements.txt
└── data/                # Generated data (gitignored)
    └── chroma_db/       # Vector database
```

### Data Management
- Vector database is stored in `data/chroma_db/`
- Database can be cleared using the clear-questions endpoint:
```bash
curl -X POST http://127.0.0.1:8000/api/clear-questions
```
- Database files are gitignored and should be regenerated locally

### Testing
1. Start the server
2. Use the provided curl commands to test endpoints
3. Monitor the server logs for debugging

## Troubleshooting

### Common Issues
1. **Database Schema Conflicts**:
   - Use the clear-questions endpoint to reset the database
   - Restart the server

2. **Missing Dependencies**:
   - Ensure all requirements are installed
   - Check Python version compatibility

3. **API Errors**:
   - Verify AWS credentials in .env
   - Check server logs for detailed error messages
