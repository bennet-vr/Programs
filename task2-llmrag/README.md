Gemini PDF Q&A (RAG)

A lightweight Retrieval-Augmented Generation (RAG) web app built with Streamlit and the Google Gen AI Python SDK. Upload any text-based PDF in your browser and ask questions grounded directly in its contents.

How It Works

Extract & Chunk: Reads text from uploaded PDFs using pypdf and splits it into overlapping 1,000-character sections.

Embed & Index: Generates unit-normalized vector embeddings for each chunk using gemini-embedding-001 (RETRIEVAL_DOCUMENT).

Retrieve: Embeds your question (RETRIEVAL_QUERY) and ranks the top 3 matching excerpts using NumPy cosine similarity.

Generate: Answers strictly from the retrieved excerpts using gemini-3.8-flash, with automatic retry and fallback to gemini-3.5-flash-lite and gemini-2.5-flash-lite during high-demand spikes.

Tech Stack

LLM & Embeddings: Google Gemini API (google-genai)

Web UI: Streamlit

PDF Parsing: pypdf

Vector Math: NumPy

Environment Management: python-dotenv

Setup & Installation

1. Clone the repository

git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO


2. Create and activate a virtual environment

Windows (PowerShell):

python -m venv venv
.\venv\Scripts\Activate.ps1


macOS / Linux:

python3 -m venv venv
source venv/bin/activate


3. Install dependencies

pip install -r requirements.txt


(If installing manually without requirements.txt: pip install streamlit pypdf google-genai numpy python-dotenv)

4. Configure your Gemini API key

Get a free API key from Google AI Studio, then create a .env file in the project root:

GEMINI_API_KEY=your-api-key-here


Run the App

streamlit run app1.py


The app will open automatically in your browser at http://localhost:8501.

Project Structure

├── app1.py              # Main Streamlit + Gemini RAG application
├── requirements.txt     # Python dependencies
├── .gitignore           # Excludes .env, venv/, and __pycache__/
└── README.md            # Project documentation
