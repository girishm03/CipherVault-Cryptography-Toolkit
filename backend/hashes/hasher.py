import hashlib
import hmac
import struct
from typing import Dict, Any, Optional

def _md4(message: bytes) -> bytes:
    """Pure-Python implementation of MD4 (RFC 1320) for standard NTLM hashing."""
    def left_rotate(n, b):
        return ((n << b) | (n >> (32 - b))) & 0xFFFFFFFF

    def f(x, y, z): return (x & y) | (~x & z)
    def g(x, y, z): return (x & y) | (x & z) | (y & z)
    def h(x, y, z): return x ^ y ^ z

    # Padding
    msg_len = len(message)
    msg = bytearray(message)
    msg.append(0x80)
    while len(msg) % 64 != 56:
        msg.append(0x00)
    msg += struct.pack('<Q', msg_len * 8)

    # Initial state
    a, b, c, d = 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476

    # Process 64-byte chunks
    for i in range(0, len(msg), 64):
        chunk = msg[i:i+64]
        X = list(struct.unpack('<16I', chunk))
        aa, bb, cc, dd = a, b, c, d

        # Round 1
        s1 = [3, 7, 11, 19]
        for j in range(16):
            k = j
            shift = s1[j % 4]
            a = left_rotate((a + f(b, c, d) + X[k]) & 0xFFFFFFFF, shift)
            a, b, c, d = d, a, b, c

        # Round 2
        s2 = [3, 5, 9, 13]
        order2 = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15]
        for j in range(16):
            k = order2[j]
            shift = s2[j % 4]
            a = left_rotate((a + g(b, c, d) + X[k] + 0x5A827999) & 0xFFFFFFFF, shift)
            a, b, c, d = d, a, b, c

        # Round 3
        s3 = [3, 9, 11, 15]
        order3 = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15]
        for j in range(16):
            k = order3[j]
            shift = s3[j % 4]
            a = left_rotate((a + h(b, c, d) + X[k] + 0x6ED9EBA1) & 0xFFFFFFFF, shift)
            a, b, c, d = d, a, b, c

        a = (a + aa) & 0xFFFFFFFF
        b = (b + bb) & 0xFFFFFFFF
        c = (c + cc) & 0xFFFFFFFF
        d = (d + dd) & 0xFFFFFFFF

    return struct.pack('<4I', a, b, c, d)

def ntlm_hash(text: str) -> str:
    """Computes Windows NTLM hash (MD4 of UTF-16LE encoding)."""
    utf16_bytes = text.encode('utf-16le')
    try:
        # Try native openssl if available
        return hashlib.new('md4', utf16_bytes).hexdigest()
    except ValueError:
        # Fallback to pure-Python MD4
        return _md4(utf16_bytes).hex()

SUPPORTED_ALGORITHMS = [
    {
        "id": "md5",
        "name": "MD5",
        "bits": 128,
        "security": "Vulnerable / Deprecated",
        "category": "Legacy",
        "description": "Widely used 128-bit checksum algorithm, vulnerable to hash collisions."
    },
    {
        "id": "sha1",
        "name": "SHA-1",
        "bits": 160,
        "security": "Deprecating / Collisions Found",
        "category": "Legacy",
        "description": "160-bit hash function formerly standard for TLS and Git, now deprecated."
    },
    {
        "id": "sha224",
        "name": "SHA-224",
        "bits": 224,
        "security": "Secure",
        "category": "SHA-2 Family",
        "description": "Truncated version of SHA-256 for 2-key Triple DES compatibility."
    },
    {
        "id": "sha256",
        "name": "SHA-256",
        "bits": 256,
        "security": "Industry Standard",
        "category": "SHA-2 Family",
        "description": "Standard cryptographic hash used in Bitcoin, TLS/SSL, and modern security."
    },
    {
        "id": "sha384",
        "name": "SHA-384",
        "bits": 384,
        "security": "High Security",
        "category": "SHA-2 Family",
        "description": "Truncated 384-bit output of SHA-512 with high collision resistance."
    },
    {
        "id": "sha512",
        "name": "SHA-512",
        "bits": 512,
        "security": "High Security",
        "category": "SHA-2 Family",
        "description": "64-bit word architecture hash function providing maximum security margin."
    },
    {
        "id": "sha3_256",
        "name": "SHA3-256",
        "bits": 256,
        "security": "Next-Gen Standard",
        "category": "SHA-3 Keccak",
        "description": "Sponge-construction hash function resistant to length-extension attacks."
    },
    {
        "id": "sha3_512",
        "name": "SHA3-512",
        "bits": 512,
        "security": "Next-Gen Standard",
        "category": "SHA-3 Keccak",
        "description": "512-bit output Keccak sponge function for high-security applications."
    },
    {
        "id": "blake2b",
        "name": "BLAKE2b",
        "bits": 512,
        "security": "High Speed & Secure",
        "category": "BLAKE Family",
        "description": "Optimized for 64-bit platforms, faster than MD5 yet as secure as SHA-3."
    },
    {
        "id": "blake2s",
        "name": "BLAKE2s",
        "bits": 256,
        "security": "High Speed & Secure",
        "category": "BLAKE Family",
        "description": "Optimized for 8-to-32-bit platforms, faster than SHA-256."
    },
    {
        "id": "ntlm",
        "name": "NTLM",
        "bits": 128,
        "security": "Vulnerable / Windows Auth",
        "category": "Authentication",
        "description": "Standard Windows NT LAN Manager hash (MD4(UTF-16LE))."
    },
    {
        "id": "ripemd160",
        "name": "RIPEMD-160",
        "bits": 160,
        "security": "Legacy Secure",
        "category": "RIPEMD Family",
        "description": "160-bit European standard cryptographic hash, used in Bitcoin addresses."
    }
]

def generate_hash_for_algorithm(algo: str, data: bytes, key: Optional[bytes] = None) -> str:
    """Calculates hash or HMAC for a specific algorithm."""
    algo = algo.lower().replace("-", "_")
    
    if key:
        # HMAC computation
        if algo == "ntlm":
            raise ValueError("HMAC is not applicable for raw NTLM")
        
        hash_name = algo.replace("_", "")
        # map common aliases
        if algo == "sha256": hash_func = hashlib.sha256
        elif algo == "sha512": hash_func = hashlib.sha512
        elif algo == "sha1": hash_func = hashlib.sha1
        elif algo == "md5": hash_func = hashlib.md5
        elif algo == "sha224": hash_func = hashlib.sha224
        elif algo == "sha384": hash_func = hashlib.sha384
        elif algo == "sha3_256": hash_func = hashlib.sha3_256
        elif algo == "sha3_512": hash_func = hashlib.sha3_512
        elif algo == "blake2s": hash_func = hashlib.blake2s
        elif algo == "blake2b": hash_func = hashlib.blake2b
        elif algo == "ripemd160": hash_func = lambda: hashlib.new('ripemd160')
        else: hash_func = hashlib.sha256

        return hmac.new(key, data, hash_func).hexdigest()

    # Plain hash computation
    if algo == "ntlm":
        # decode data back to string for UTF-16LE handling
        text = data.decode('utf-8', errors='replace')
        return ntlm_hash(text)
    elif algo == "md5":
        return hashlib.md5(data).hexdigest()
    elif algo == "sha1":
        return hashlib.sha1(data).hexdigest()
    elif algo == "sha224":
        return hashlib.sha224(data).hexdigest()
    elif algo == "sha256":
        return hashlib.sha256(data).hexdigest()
    elif algo == "sha384":
        return hashlib.sha384(data).hexdigest()
    elif algo == "sha512":
        return hashlib.sha512(data).hexdigest()
    elif algo == "sha3_224":
        return hashlib.sha3_224(data).hexdigest()
    elif algo == "sha3_256":
        return hashlib.sha3_256(data).hexdigest()
    elif algo == "sha3_384":
        return hashlib.sha3_384(data).hexdigest()
    elif algo == "sha3_512":
        return hashlib.sha3_512(data).hexdigest()
    elif algo == "blake2b":
        return hashlib.blake2b(data).hexdigest()
    elif algo == "blake2s":
        return hashlib.blake2s(data).hexdigest()
    elif algo == "ripemd160":
        try:
            return hashlib.new('ripemd160', data).hexdigest()
        except ValueError:
            return "ripemd160 not supported by system openssl"
    else:
        raise ValueError(f"Unsupported algorithm: {algo}")

def generate_all_hashes(text: str, salt: str = "", salt_position: str = "suffix", key: str = "") -> Dict[str, Any]:
    """Generates all supported hashes for the provided text, optional salt and HMAC key."""
    # Apply salt
    if salt:
        if salt_position == "prefix":
            full_text = salt + text
        else:
            full_text = text + salt
    else:
        full_text = text

    raw_bytes = full_text.encode('utf-8')
    key_bytes = key.encode('utf-8') if key else None

    results = []
    for info in SUPPORTED_ALGORITHMS:
        try:
            hash_val = generate_hash_for_algorithm(info["id"], raw_bytes, key_bytes)
            results.append({
                **info,
                "hash": hash_val,
                "length": len(hash_val)
            })
        except Exception as e:
            results.append({
                **info,
                "hash": f"Error: {str(e)}",
                "length": 0
            })

    return {
        "input_text": text,
        "salted_text": full_text if salt else text,
        "is_hmac": bool(key),
        "results": results
    }
