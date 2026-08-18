from fastembed import TextEmbedding
from typing import List, Union

_model = None

def get_embedding_model() -> TextEmbedding:
    global _model
    if _model is None:
        # טעינת מודל רזה ומהיר שרץ ללא PyTorch/CUDA וצורך ~100MB RAM בלבד
        _model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    return _model

def get_embeddings(texts: Union[str, List[str]]) -> List[List[float]]:
    """יוצר וקטורים עבור טקסט יחיד או רשימת טקסטים"""
    if isinstance(texts, str):
        texts = [texts]
    
    model = get_embedding_model()
    embeddings = list(model.embed(texts))
    return [e.tolist() for e in embeddings]

def get_single_embedding(text: str) -> List[float]:
    """יוצר וקטור עבור מחרוזת בודדת (עבור שאילתת חיפוש)"""
    res = get_embeddings(text)
    return res[0] if res else []