# System Design Explorer

An interactive web application for exploring system design patterns used by major tech companies including Meta, Google, Amazon, Netflix, and Uber.

## Features

- 📱 Responsive design that works on desktop and mobile
- 🏢 System design examples from major tech companies
- 🔍 Detailed explanations of architecture components
- ⚡ Interactive topic selection with smooth animations
- 📚 Educational content covering scalability and performance

## Companies & Topics

### Meta
- News Feed System
- Chat System (Messenger)
- Live Streaming

### Google
- Search Engine
- YouTube
- Maps

### Amazon
- E-commerce Platform
- AWS S3
- Recommendation System

### Netflix
- Video Streaming
- Content Delivery Network

### Uber
- Ride Matching System
- Surge Pricing

## Getting Started

Frontend:
- Simply open `index.html` in your browser to explore system design patterns.

Backend (prompt storage & APIs):
- Requirements: Node >= 18
- Install deps: `npm install`
- Start dev server: `npm run dev` (http://localhost:3001)
- Health check: `GET /api/health`
- List prompts: `GET /api/prompts`
- Read prompt: `GET /api/prompts/<name>`
- Upsert prompt: `POST /api/prompts/<name>` with body `{ "content": "..." }` or raw text
- Run prompt (stub): `POST /api/run/<name>` with optional `{ "parameters": { ... } }`

## Project Structure

```
backend/
  src/
    server.js           # Express server with prompt APIs
    routes.js           # Placeholder for future modular routes
content/                # Companies → Topics → PDF files
  <Company>/
    <Topic>/
      <some.pdf>
prompts/
  README.md             # Conventions & API usage
  example.meta.news-feed.md
index.html              # Frontend UI
script.js               # Frontend logic
styles.css              # Frontend styles
```

## Deployment

- Frontend can be deployed on static hosting (Vercel, Netlify, GitHub Pages).
- Backend can be deployed on any Node-compatible host (Render, Fly.io, Vercel serverless, etc.).

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js + Express (backend)

## Content management (companies, topics, PDFs)

Place your ML system design PDFs under `content/<Company>/<Topic>/*.pdf`.

- List companies: `GET /api/companies`
- List topics: `GET /api/companies/:company/topics`
- Stream topic PDF: `GET /api/companies/:company/topics/:topic/pdf`

Frontend automatically populates dropdowns from these endpoints and displays the PDF.
- Responsive Design# Clean installation completed - webpack issues resolved
# Comprehensive local testing completed - all systems verified
