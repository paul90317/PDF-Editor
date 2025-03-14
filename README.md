# PDF Vector Graphics Editor

A web application that allows users to selectively remove vector graphics from PDF files while preserving text and links.

## Features

- Upload PDF files
- Preview PDF pages with vector graphics highlighted
- Select/deselect vector graphics to keep or remove
- Download modified PDF with selected changes
- Preserves text content and hyperlinks
- Temporary file storage (files are automatically deleted after 60 seconds)

## Tech Stack

### Frontend
- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- Docker containerization

### Backend
- FastAPI (Python)
- PyMuPDF for PDF processing
- MongoDB for temporary file storage
- Docker containerization

## Getting Started

1. Clone the repository
2. Create a `.env` file in the root directory using `.env.example` as a template
3. Start the application using Docker Compose
```bash
docker compose up --build
```
4. Access the application
- Frontend: http://localhost/
- Backend API: http://localhost:3000/docs
- MongoDB: mongodb://localhost:27017
## Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 3000
```

