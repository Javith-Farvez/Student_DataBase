import json
import numpy as np
import base64

def normalize_embedding(vector: list) -> list:
    """Normalizes vector to L2 unit length"""
    arr = np.array(vector, dtype=np.float32)
    norm = np.linalg.norm(arr)
    if norm == 0:
        return vector
    return (arr / norm).tolist()

def generate_mock_face_embedding(seed_str: str) -> list:
    """Generates a 512-dimensional normalized float embedding vector deterministically from seed"""
    np.random.seed(abs(hash(seed_str)) % (2**32))
    vec = np.random.randn(512).astype(np.float32)
    norm = np.linalg.norm(vec)
    return (vec / norm).tolist()

def cosine_similarity(vec1: list, vec2: list) -> float:
    """Computes cosine similarity between two 512-d embeddings"""
    v1 = np.array(vec1, dtype=np.float32)
    v2 = np.array(vec2, dtype=np.float32)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(v1, v2) / (norm1 * norm2))

def match_face_against_db(scanned_embedding: list, stored_embeddings: list, threshold: float = 0.50) -> dict:
    """
    Compares scanned embedding vector against list of (student_id, embedding_json) records.
    Returns best matching student_id and similarity score if score >= threshold.
    """
    best_match_id = None
    highest_score = -1.0

    for student_id, embedding_str in stored_embeddings:
        try:
            stored_vec = json.loads(embedding_str) if isinstance(embedding_str, str) else embedding_str
            sim = cosine_similarity(scanned_embedding, stored_vec)
            if sim > highest_score:
                highest_score = sim
                best_match_id = student_id
        except Exception:
            continue

    if highest_score >= threshold:
        return {"matched": True, "student_id": best_match_id, "confidence": round(highest_score * 100, 2)}
    return {"matched": False, "student_id": None, "confidence": round(max(highest_score, 0.0) * 100, 2)}
