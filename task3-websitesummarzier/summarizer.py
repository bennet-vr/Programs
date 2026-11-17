
import re
from collections import Counter

def summarize_text(text, sentence_count=5):
    # Clean unnecessary spaces and line breaks
    text = re.sub(r'\s+', ' ', text).strip()

    # Split text into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)

    if len(sentences) <= sentence_count:
        return text

    # Remove common words
    stop_words = {
        "the", "is", "a", "an", "and", "or", "but",
        "to", "of", "in", "on", "for", "with", "as",
        "at", "by", "from", "this", "that", "are",
        "was", "were", "be", "been", "it", "its"
    }

    # Calculate word frequency
    words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
    word_frequency = Counter(
        word for word in words if word not in stop_words
    )

    # Score each sentence
    sentence_scores = {}

    for index, sentence in enumerate(sentences):
        sentence_words = re.findall(r'\b[a-zA-Z]+\b', sentence.lower())

        score = sum(
            word_frequency[word] for word in sentence_words
        )

        sentence_scores[index] = score

    # Select the most important sentences
    important_sentences = sorted(
        sentence_scores,
        key=sentence_scores.get,
        reverse=True
    )[:sentence_count]

    # Maintain original sentence order
    important_sentences.sort()

    summary = " ".join(
        sentences[index] for index in important_sentences
    )

    return summary
