"""
Simple PDF RAG Web App using Streamlit & Gemini
-----------------------------------------------
Dependencies:
    pip install streamlit pypdf google-genai numpy python-dotenv

Setup:
    Create a .env file in the same folder with:
    GEMINI_API_KEY=your-api-key-here

Run (opens automatically in your browser at http://localhost:8501):
    streamlit run app1.py
"""

import os
import numpy as np
import streamlit as st
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pypdf import PdfReader

load_dotenv()

EMBEDDING_MODEL = "gemini-embedding-001"
GENERATION_MODEL = "gemini-3.8-flash"


@st.cache_resource
def get_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "GEMINI_API_KEY is not set. Check your .env file."
        )
    return genai.Client(api_key=api_key)


def extract_pdf_text(uploaded_file) -> str:
    reader = PdfReader(uploaded_file)
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages).strip()


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def embed_documents(client: genai.Client, texts: list[str], batch_size: int = 50) -> np.ndarray:
    all_vectors = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=batch,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
        )
        all_vectors.extend([emb.values for emb in response.embeddings])

    vectors = np.array(all_vectors, dtype=np.float32)
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    return vectors / np.clip(norms, a_min=1e-12, a_max=None)


def embed_query(client: genai.Client, query: str) -> np.ndarray:
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=query,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
    )
    vector = np.array(response.embeddings[0].values, dtype=np.float32)
    return vector / max(np.linalg.norm(vector), 1e-12)


def retrieve_top_k(
    query_vec: np.ndarray,
    doc_matrix: np.ndarray,
    chunks: list[str],
    k: int = 3,
) -> list[tuple[str, float]]:
    scores = doc_matrix @ query_vec
    top_indices = np.argsort(scores)[::-1][: min(k, len(chunks))]
    return [(chunks[i], float(scores[i])) for i in top_indices]


def generate_answer(
    client: genai.Client,
    query: str,
    retrieved_chunks: list[tuple[str, float]],
) -> str:
    context_block = "\n\n".join(
        f"[Excerpt {idx + 1} | score={score:.3f}]:\n{text}"
        for idx, (text, score) in enumerate(retrieved_chunks)
    )
    prompt = (
        "Answer the user's question using ONLY the PDF excerpts provided below. "
        "If the answer is not in the excerpts, say you could not find it in the PDF.\n\n"
        f"PDF Excerpts:\n{context_block}\n\n"
        f"Question: {query}\n"
        "Answer:"
    )
    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
    )
    return response.text


def main() -> None:
    st.set_page_config(page_title="PDF Q&A with Gemini RAG", page_icon="📄")
    st.title("📄 Ask Your PDF (Gemini RAG)")

    try:
        client = get_client()
    except EnvironmentError as err:
        st.error(str(err))
        st.stop()

    uploaded_file = st.file_uploader("Upload a PDF file", type=["pdf"])

    if uploaded_file is not None:
        file_id = f"{uploaded_file.name}_{uploaded_file.size}"

        if st.session_state.get("file_id") != file_id:
            with st.spinner("Reading and indexing your PDF..."):
                text = extract_pdf_text(uploaded_file)
                if not text:
                    st.warning("No readable text found in this PDF (it may be scanned images).")
                    st.stop()

                chunks = chunk_text(text)
                embeddings = embed_documents(client, chunks)

                st.session_state["file_id"] = file_id
                st.session_state["chunks"] = chunks
                st.session_state["embeddings"] = embeddings

            st.success(f"Indexed {len(chunks)} sections from {uploaded_file.name}.")

        query = st.text_input("Ask a question about your PDF:")
        if query:
            with st.spinner("Searching PDF and generating answer..."):
                query_vec = embed_query(client, query)
                top_chunks = retrieve_top_k(
                    query_vec,
                    st.session_state["embeddings"],
                    st.session_state["chunks"],
                    k=3,
                )
                answer = generate_answer(client, query, top_chunks)

            st.subheader("Answer")
            st.write(answer)

            with st.expander("View retrieved PDF excerpts"):
                for idx, (chunk, score) in enumerate(top_chunks, start=1):
                    st.markdown(f"**Excerpt {idx}** (similarity: `{score:.3f}`)")
                    st.write(chunk)


if __name__ == "__main__":
    main()