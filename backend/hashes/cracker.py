import os
import time
import itertools
import string
from typing import Dict, Any, Optional, List
from .hasher import generate_hash_for_algorithm, SUPPORTED_ALGORITHMS
from .identifier import identify_hash

WORDLIST_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "wordlists", "passwords.txt")

# Preload wordlist in memory for ultra-fast lookup
_CACHED_WORDS: List[str] = []

def get_wordlist() -> List[str]:
    global _CACHED_WORDS
    if _CACHED_WORDS:
        return _CACHED_WORDS

    candidate_paths = [
        WORDLIST_PATH,
        os.path.join(os.getcwd(), "backend", "wordlists", "passwords.txt"),
        os.path.join(os.getcwd(), "wordlists", "passwords.txt"),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "wordlists", "passwords.txt")
    ]

    for path in candidate_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    _CACHED_WORDS = [line.strip() for line in f if line.strip()]
                if _CACHED_WORDS:
                    break
            except Exception:
                continue

    if not _CACHED_WORDS:
        _CACHED_WORDS = [
            "password", "password123", "123456", "123456789", "admin", "root",
            "guest", "qwerty", "welcome", "letmein", "secret", "cyber", "security",
            "cipher", "caesar", "crypto", "master", "testing", "helloworld"
        ]
    return _CACHED_WORDS

def crack_hash(
    target_hash: str,
    algorithm: str = "auto",
    attack_mode: str = "wordlist",
    custom_words: Optional[List[str]] = None,
    max_brute_length: int = 4
) -> Dict[str, Any]:
    """
    Decodes/cracks a given hash using dictionary and/or brute-force techniques.
    """
    target = target_hash.strip().lower()
    start_time = time.perf_counter()
    attempts = 0

    # Determine algorithm candidates
    algos_to_try = []
    if algorithm.lower() == "auto":
        # Use identifier to find matching candidates
        ident = identify_hash(target)
        candidates = [c["algorithm"].lower().replace("-", "").replace(" ", "") for c in ident.get("candidates", [])]
        # Filter supported algorithms
        valid_ids = {a["id"] for a in SUPPORTED_ALGORITHMS}
        for c in candidates:
            if c in valid_ids and c not in algos_to_try:
                algos_to_try.append(c)
        if not algos_to_try:
            # Fallback to standard top hashes based on length
            if len(target) == 32:
                algos_to_try = ["md5", "ntlm"]
            elif len(target) == 40:
                algos_to_try = ["sha1", "ripemd160"]
            elif len(target) == 64:
                algos_to_try = ["sha256", "sha3_256", "blake2s"]
            elif len(target) == 128:
                algos_to_try = ["sha512", "blake2b"]
            else:
                algos_to_try = ["md5", "sha1", "sha256"]
    else:
        norm_algo = algorithm.lower().replace("-", "_")
        algos_to_try = [norm_algo]

    # Helper function to check a candidate word across all target algorithms
    def check_candidate(candidate: str):
        nonlocal attempts
        cand_bytes = candidate.encode('utf-8')
        for algo in algos_to_try:
            attempts += 1
            try:
                h = generate_hash_for_algorithm(algo, cand_bytes)
                if h.lower() == target:
                    return algo, candidate
            except Exception:
                continue
        return None, None

    found_algo = None
    recovered_plaintext = None
    method_used = ""

    # Phase 1: Custom Words (if provided)
    if custom_words:
        method_used = "Custom Wordlist"
        for word in custom_words:
            algo, match = check_candidate(word.strip())
            if match is not None:
                found_algo = algo
                recovered_plaintext = match
                break

    # Phase 2: Built-in Dictionary Wordlist
    if not recovered_plaintext and attack_mode in ["wordlist", "combined", "auto"]:
        method_used = "Common Wordlist Dictionary Attack"
        wordlist = get_wordlist()
        for word in wordlist:
            algo, match = check_candidate(word)
            if match is not None:
                found_algo = algo
                recovered_plaintext = match
                break

    # Phase 3: Numeric PIN Brute-force (0 to 999999)
    if not recovered_plaintext and attack_mode in ["pin", "combined", "bruteforce"]:
        method_used = "Numeric PIN Search (0000 - 999999)"
        # Try 4-digit PINs first, then 6-digit PINs
        for pin_len in [4, 6]:
            if recovered_plaintext:
                break
            for i in range(10 ** pin_len):
                pin_str = f"{i:0{pin_len}d}"
                algo, match = check_candidate(pin_str)
                if match is not None:
                    found_algo = algo
                    recovered_plaintext = match
                    break

    # Phase 4: Short alphanumeric brute-force (length 1 to max_brute_length, default up to 4)
    if not recovered_plaintext and attack_mode in ["alphanumeric", "bruteforce"]:
        method_used = f"Alphanumeric Brute-Force (Length 1-{max_brute_length})"
        charset = string.ascii_lowercase + string.digits
        max_len = min(max_brute_length, 4)  # Safeguard against web request timeout
        
        for length in range(1, max_len + 1):
            if recovered_plaintext:
                break
            for combination in itertools.product(charset, repeat=length):
                candidate = "".join(combination)
                algo, match = check_candidate(candidate)
                if match is not None:
                    found_algo = algo
                    recovered_plaintext = match
                    break

    elapsed_s = max(time.perf_counter() - start_time, 0.0001)
    hash_rate = int(attempts / elapsed_s)

    return {
        "found": recovered_plaintext is not None,
        "plaintext": recovered_plaintext,
        "algorithm": found_algo.upper() if found_algo else (algorithm.upper() if algorithm != "auto" else "Unknown"),
        "tried_algorithms": [a.upper() for a in algos_to_try],
        "attempts": attempts,
        "time_taken_ms": round(elapsed_s * 1000, 2),
        "hash_rate": f"{hash_rate:,} H/s",
        "method": method_used if recovered_plaintext else "Dictionary & Brute-Force Exhausted"
    }
