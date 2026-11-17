# Gemini PDF Q&A – RAG-Based Study Assistant

A lightweight **Retrieval-Augmented Generation (RAG)** application built using [Streamlit](https://streamlit.io/) and the [Google Gen AI Python SDK](https://googleapis.github.io/python-genai/). Upload PDF documents and ask questions about their contents. The application retrieves relevant information from the uploaded documents and uses Google Gemini to generate clear, context-based answers.

## Features

- **PDF Upload:** Upload one or multiple text-based PDF documents.
- **Text Extraction:** Extract text from PDFs using PyPDF.
- **Text Chunking:** Divide extracted text into overlapping sections for efficient retrieval.
- **Semantic Embeddings:** Generate vector embeddings using Gemini's `gemini-embedding-001` model.
- **Relevant Information Retrieval:** Identify the three most relevant text sections based on the user's question.
- **AI-Powered Answers:** Use Gemini to generate answers grounded in the retrieved document content.
- **Context-Based Responses:** Avoid unrelated information and indicate when the uploaded documents do not contain enough information.

## How It Works

The application follows a Retrieval-Augmented Generation (RAG) pipeline:

1. **Extract:** Read and extract text from uploaded PDF documents using PyPDF.
2. **Chunk:** Split the extracted text into overlapping 1,000-character sections.
3. **Embed:** Generate vector embeddings for document chunks using `gemini-embedding-001` with the `RETRIEVAL_DOCUMENT` task type.
4. **Retrieve:** Convert the user's question into an embedding using the `RETRIEVAL_QUERY` task type. Rank document chunks using cosine similarity and retrieve the top three matching sections.
5. **Generate:** Pass the retrieved sections and the user's question to Gemini to generate a relevant answer based on the document content.

## Tech Stack

| Technology | Purpose |
|---|---|
| Python | Core application logic |
| Streamlit | Web application interface |
| Google Gemini API | Embeddings and AI-generated answers |
| Google Gen AI SDK | Gemini API integration |
| PyPDF | PDF text extraction |
| NumPy | Vector operations and similarity calculations |
| python-dotenv | Environment variable management |

## Project Structure

```text
Task2_Study_Notes_Assistant/
│
├── app1.py              # Main Streamlit application
├── requirements.txt     # Project dependencies
├── .env                 # Gemini API key (not uploaded)
├── .gitignore           # Files excluded from Git
└── README.md            # Project documentation
```

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

Alternatively, install them manually:

```bash
pip install streamlit pypdf google-genai numpy python-dotenv
```

### 5. Configure the Gemini API key

1. Obtain an API key through [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create a `.env` file in the project root directory.
3. Add your API key:

```env
GEMINI_API_KEY=your-api-key-here
```

**Important:** Never upload your `.env` file or expose your API key in your GitHub repository.

### 6. Run the application

```bash
streamlit run app1.py
```

The application will open in your browser, usually at:

```text
http://localhost:8501
```

## Requirements

- Python 3.9 or later
- Google Gemini API key
- Internet connection for Gemini API access
- Text-based PDF documents

## Future Improvements

- Support for additional document formats.
- Improved document retrieval and ranking.
- Chat history and follow-up questions.
- Downloadable study notes and answers.

---

**Developed using Python, Streamlit, and Google Gemini.**
