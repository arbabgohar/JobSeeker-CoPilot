from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Tuple
import re
from collections import Counter

# Initialize the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_keywords(text: str) -> List[str]:
    """Extract important keywords from text."""
    # Convert to lowercase and remove special characters
    text = re.sub(r'[^\w\s]', ' ', text.lower())
    
    # Split into words
    words = text.split()
    
    # Remove common stop words (you can expand this list)
    stop_words = set(['and', 'the', 'to', 'of', 'in', 'a', 'for', 'with', 'is', 'on', 'that', 'this'])
    words = [word for word in words if word not in stop_words]
    
    # Get word frequency
    word_freq = Counter(words)
    
    # Return most common words as keywords
    return [word for word, freq in word_freq.most_common(20)]

def compute_similarity(text1: str, text2: str) -> float:
    """Compute cosine similarity between two texts using sentence embeddings."""
    # Get embeddings
    embedding1 = model.encode([text1])[0]
    embedding2 = model.encode([text2])[0]
    
    # Compute cosine similarity
    similarity = np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))
    
    # Convert to percentage
    return float(similarity * 100)

def analyze_resume_match(job_description: str, resume: str) -> Tuple[float, List[str]]:
    """
    Analyze how well a resume matches a job description.
    Returns a tuple of (match_score, missing_keywords)
    """
    # Compute overall similarity score
    match_score = compute_similarity(job_description, resume)
    
    # Extract keywords from both texts
    job_keywords = set(extract_keywords(job_description))
    resume_keywords = set(extract_keywords(resume))
    
    # Find missing keywords
    missing_keywords = list(job_keywords - resume_keywords)
    
    return match_score, missing_keywords 