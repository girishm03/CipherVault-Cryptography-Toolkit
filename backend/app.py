from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from ciphers.caesar import (
    caesar_transform,
    caesar_brute_force,
    calculate_letter_frequencies,
    ENGLISH_FREQ
)
from hashes.hasher import (
    generate_all_hashes,
    SUPPORTED_ALGORITHMS
)
from hashes.identifier import identify_hash
from hashes.cracker import crack_hash

app = FastAPI(
    title="CipherVault API",
    description="Backend API for Caesar Cipher and Hash Decoding/Encoding Suite",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Models -----------------

class CaesarRequest(BaseModel):
    text: str = Field(..., description="Text to encode or decode")
    shift: int = Field(3, description="Shift value between 1 and 25")

class CaesarBruteRequest(BaseModel):
    text: str = Field(..., description="Ciphertext to crack")

class HashGenerateRequest(BaseModel):
    text: str = Field(..., description="Plain text to hash")
    salt: Optional[str] = Field("", description="Optional salt value")
    salt_position: Optional[str] = Field("suffix", description="Position of salt ('prefix' or 'suffix')")
    key: Optional[str] = Field("", description="Optional HMAC secret key")

class HashIdentifyRequest(BaseModel):
    hash: str = Field(..., description="Hash string to analyze")

class HashCrackRequest(BaseModel):
    hash: str = Field(..., description="Target hash to crack")
    algorithm: Optional[str] = Field("auto", description="Algorithm name or 'auto'")
    attack_mode: Optional[str] = Field("wordlist", description="Attack mode: 'wordlist', 'pin', 'alphanumeric', or 'combined'")
    custom_words: Optional[List[str]] = Field(None, description="Optional custom wordlist")
    max_brute_length: Optional[int] = Field(4, description="Max character length for brute force")

# ----------------- Endpoints -----------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CipherVault API",
        "supported_algorithms": [a["name"] for a in SUPPORTED_ALGORITHMS]
    }

@app.post("/api/caesar/encode")
def encode_caesar(req: CaesarRequest):
    encoded = caesar_transform(req.text, req.shift, encode=True)
    return {
        "original": req.text,
        "shift": req.shift,
        "result": encoded
    }

@app.post("/api/caesar/decode")
def decode_caesar(req: CaesarRequest):
    decoded = caesar_transform(req.text, req.shift, encode=False)
    return {
        "original": req.text,
        "shift": req.shift,
        "result": decoded
    }

@app.post("/api/caesar/bruteforce")
def bruteforce_caesar(req: CaesarBruteRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Ciphertext cannot be empty.")
    
    results = caesar_brute_force(req.text)
    best_match = results[0] if results else None
    
    return {
        "original": req.text,
        "best_match": best_match,
        "all_shifts": results
    }

@app.post("/api/caesar/frequency")
def frequency_analysis(req: CaesarBruteRequest):
    freqs = calculate_letter_frequencies(req.text)
    return {
        "text_frequencies": freqs,
        "standard_english": ENGLISH_FREQ
    }

@app.post("/api/hashes/generate")
def generate_hashes(req: HashGenerateRequest):
    if not req.text:
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")
    
    data = generate_all_hashes(
        text=req.text,
        salt=req.salt or "",
        salt_position=req.salt_position or "suffix",
        key=req.key or ""
    )
    return data

@app.post("/api/hashes/identify")
def identify_hash_endpoint(req: HashIdentifyRequest):
    if not req.hash.strip():
        raise HTTPException(status_code=400, detail="Hash input cannot be empty.")
        
    analysis = identify_hash(req.hash)
    return analysis

@app.post("/api/hashes/crack")
def crack_hash_endpoint(req: HashCrackRequest):
    if not req.hash.strip():
        raise HTTPException(status_code=400, detail="Hash input cannot be empty.")
        
    crack_result = crack_hash(
        target_hash=req.hash,
        algorithm=req.algorithm or "auto",
        attack_mode=req.attack_mode or "wordlist",
        custom_words=req.custom_words,
        max_brute_length=req.max_brute_length or 4
    )
    return crack_result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
