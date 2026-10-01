import re
from typing import List, Dict, Any

# Hash patterns and signatures
PATTERNS = [
    {
        "name": "MD5",
        "regex": r"^[a-fA-F0-9]{32}$",
        "bits": 128,
        "format": "Hexadecimal",
        "category": "Raw Hash",
        "security": "Insecure (Collisions practical)",
        "confidence": "High",
        "description": "32-hex character digest. Could also be NTLM, MD4, or NTLMv1."
    },
    {
        "name": "NTLM",
        "regex": r"^[a-fA-F0-9]{32}$",
        "bits": 128,
        "format": "Hexadecimal",
        "category": "Windows Authentication",
        "security": "Vulnerable to Pass-The-Hash and rainbow tables",
        "confidence": "Medium",
        "description": "Windows password hash (MD4 of UTF-16LE). Same format as MD5."
    },
    {
        "name": "SHA-1",
        "regex": r"^[a-fA-F0-9]{40}$",
        "bits": 160,
        "format": "Hexadecimal",
        "category": "Raw Hash",
        "security": "Deprecated (SHAttered collision demonstrated)",
        "confidence": "High",
        "description": "40-hex character digest. Also matches RIPEMD-160, HAVAL-160."
    },
    {
        "name": "RIPEMD-160",
        "regex": r"^[a-fA-F0-9]{40}$",
        "bits": 160,
        "format": "Hexadecimal",
        "category": "Raw Hash",
        "security": "Legacy Secure",
        "confidence": "Medium",
        "description": "40-hex character digest used frequently in Bitcoin P2PKH addresses."
    },
    {
        "name": "SHA-224",
        "regex": r"^[a-fA-F0-9]{56}$",
        "bits": 224,
        "format": "Hexadecimal",
        "category": "SHA-2",
        "security": "Secure",
        "confidence": "High",
        "description": "56-hex character digest."
    },
    {
        "name": "SHA-256",
        "regex": r"^[a-fA-F0-9]{64}$",
        "bits": 256,
        "format": "Hexadecimal",
        "category": "SHA-2",
        "security": "Industry Standard (Very Secure)",
        "confidence": "Very High",
        "description": "64-hex character digest. Most widely used hash in modern security."
    },
    {
        "name": "SHA3-256",
        "regex": r"^[a-fA-F0-9]{64}$",
        "bits": 256,
        "format": "Hexadecimal",
        "category": "SHA-3 / Keccak",
        "security": "Future Proof Standard",
        "confidence": "Medium",
        "description": "Keccak sponge construction. Same 64-hex length as SHA-256."
    },
    {
        "name": "BLAKE2s",
        "regex": r"^[a-fA-F0-9]{64}$",
        "bits": 256,
        "format": "Hexadecimal",
        "category": "BLAKE Family",
        "security": "Very Secure & Ultra Fast",
        "confidence": "Medium",
        "description": "64-hex characters. High speed 256-bit hash."
    },
    {
        "name": "SHA-384",
        "regex": r"^[a-fA-F0-9]{96}$",
        "bits": 384,
        "format": "Hexadecimal",
        "category": "SHA-2",
        "security": "High Security",
        "confidence": "Very High",
        "description": "96-hex characters (384 bits). Truncated version of SHA-512."
    },
    {
        "name": "SHA-512",
        "regex": r"^[a-fA-F0-9]{128}$",
        "bits": 512,
        "format": "Hexadecimal",
        "category": "SHA-2",
        "security": "Maximum Security",
        "confidence": "Very High",
        "description": "128-hex characters (512 bits). High resistance against length extension."
    },
    {
        "name": "BLAKE2b",
        "regex": r"^[a-fA-F0-9]{128}$",
        "bits": 512,
        "format": "Hexadecimal",
        "category": "BLAKE Family",
        "security": "Maximum Security & Ultra Fast",
        "confidence": "Medium",
        "description": "128-hex characters (512 bits). Optimized for 64-bit platforms."
    },
    {
        "name": "bcrypt",
        "regex": r"^\$2[aby]\$[0-9]{2}\$[A-Za-z0-9\.\/]{53}$",
        "bits": 184,
        "format": "Modular Crypt Format ($2a$...)",
        "category": "Password KDF",
        "security": "Highly Secure (Adaptive Work Factor)",
        "confidence": "Definitive (100%)",
        "description": "OpenBSD Blowfish-based adaptive password hashing function."
    },
    {
        "name": "Argon2",
        "regex": r"^\$argon2(i|d|id)\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$",
        "bits": 256,
        "format": "Modular Crypt Format ($argon2...)",
        "category": "Password KDF",
        "security": "State of the Art (PHC Winner)",
        "confidence": "Definitive (100%)",
        "description": "Memory-hard password hashing function, resistant to GPU/ASIC attacks."
    },
    {
        "name": "PBKDF2 (SHA-256)",
        "regex": r"^pbkdf2_sha256\$\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$",
        "bits": 256,
        "format": "Django PBKDF2 Format",
        "category": "Password KDF",
        "security": "Secure with high iterations",
        "confidence": "Definitive (100%)",
        "description": "Default Django cryptographic password hash format."
    }
]

def identify_hash(hash_str: str) -> Dict[str, Any]:
    """Analyzes an input string to identify likely hashing algorithms."""
    cleaned = hash_str.strip()
    length = len(cleaned)
    matches: List[Dict[str, Any]] = []

    # Check if string is hexadecimal
    is_hex = bool(re.match(r"^[a-fA-F0-9]+$", cleaned))
    
    for pattern in PATTERNS:
        if re.match(pattern["regex"], cleaned):
            matches.append({
                "algorithm": pattern["name"],
                "bits": pattern["bits"],
                "format": pattern["format"],
                "category": pattern["category"],
                "security": pattern["security"],
                "confidence": pattern["confidence"],
                "description": pattern["description"]
            })

    # Character breakdown
    analysis = {
        "input_length": length,
        "is_hexadecimal": is_hex,
        "bit_length_estimate": (length * 4) if is_hex else None,
        "matches_found": len(matches),
        "candidates": matches
    }

    return analysis
