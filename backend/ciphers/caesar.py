import string
from typing import List, Dict, Any

# Standard English letter frequencies (percentages)
ENGLISH_FREQ = {
    'A': 8.2,  'B': 1.5,  'C': 2.8,  'D': 4.3,  'E': 12.7,
    'F': 2.2,  'G': 2.0,  'H': 6.1,  'I': 7.0,  'J': 0.15,
    'K': 0.77, 'L': 4.0,  'M': 2.4,  'N': 6.7,  'O': 7.5,
    'P': 1.9,  'Q': 0.095,'R': 6.0,  'S': 6.3,  'T': 9.1,
    'U': 2.8,  'V': 0.98, 'W': 2.4,  'X': 0.15, 'Y': 2.0,
    'Z': 0.074
}

COMMON_WORDS = {
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
    'hello', 'world', 'secret', 'password', 'message', 'flag', 'hidden', 'meet',
    'attack', 'dawn', 'tonight', 'key', 'caesar', 'cipher', 'cryptography', 'security',
    'help', 'please', 'thanks', 'name', 'friend', 'love', 'life', 'great', 'code',
    'computer', 'system', 'network', 'access', 'data', 'user', 'admin', 'test'
}

def caesar_transform(text: str, shift: int, encode: bool = True) -> str:
    """Transforms text with Caesar shift. Handles positive and negative shifts."""
    actual_shift = (shift if encode else -shift) % 26
    result = []
    
    for char in text:
        if 'a' <= char <= 'z':
            base = ord('a')
            result.append(chr((ord(char) - base + actual_shift) % 26 + base))
        elif 'A' <= char <= 'Z':
            base = ord('A')
            result.append(chr((ord(char) - base + actual_shift) % 26 + base))
        else:
            result.append(char)
            
    return "".join(result)

def calculate_letter_frequencies(text: str) -> Dict[str, float]:
    """Calculates relative frequencies of letters in text."""
    letters = [c.upper() for c in text if c.isalpha()]
    total = len(letters)
    if total == 0:
        return {letter: 0.0 for letter in string.ascii_uppercase}
        
    counts = {letter: 0 for letter in string.ascii_uppercase}
    for char in letters:
        counts[char] += 1
        
    return {letter: round((counts[letter] / total) * 100, 2) for letter in string.ascii_uppercase}

def score_english(text: str) -> float:
    """
    Scores how likely a piece of text is natural English using:
    1. Dictionary word recognition (heaviest weight for natural phrases)
    2. Chi-squared test against standard English letter frequencies
    3. Common English digraph frequencies (TH, HE, IN, ER, AN, RE, ED, ON, ES, ST)
    Returns a score 0 - 100%.
    """
    cleaned = text.strip()
    if not cleaned:
        return 0.0

    words = [w.strip(string.punctuation).lower() for w in cleaned.split()]
    recognized_words = sum(1 for w in words if len(w) > 0 and w in COMMON_WORDS)
    
    word_ratio = (recognized_words / len(words)) if words else 0.0
    
    # If 100% of words are recognized in our common dictionary, it's virtually guaranteed to be the right plaintext!
    if word_ratio >= 0.8:
        return round(85.0 + (word_ratio * 15.0), 1)

    letters = [c.upper() for c in cleaned if c.isalpha()]
    total_letters = len(letters)
    if total_letters == 0:
        return 0.0

    # Letter frequencies in candidate
    observed = {l: 0 for l in string.ascii_uppercase}
    for char in letters:
        observed[char] += 1

    # Chi-square statistic
    chi2 = 0.0
    for char in string.ascii_uppercase:
        expected = (ENGLISH_FREQ[char] / 100.0) * total_letters
        diff = observed[char] - expected
        chi2 += (diff * diff) / (expected if expected > 0 else 0.001)

    # Normalized frequency score (0-100)
    freq_score = max(0.0, min(100.0, 100.0 - (chi2 / (total_letters * 0.15 + 15)) * 25))

    # Common English digraph bonus
    upper_text = "".join(letters)
    common_digraphs = ["TH", "HE", "IN", "ER", "AN", "RE", "ED", "ON", "ES", "ST"]
    digraph_count = sum(upper_text.count(dg) for dg in common_digraphs)
    digraph_bonus = min(20.0, (digraph_count / max(1, len(upper_text) - 1)) * 50.0)

    # Combine word ratio bonus + frequency score
    final_score = (word_ratio * 60.0) + (freq_score * 0.3) + digraph_bonus
    return round(min(100.0, max(0.0, final_score)), 1)


def caesar_brute_force(ciphertext: str) -> List[Dict[str, Any]]:
    """Tries all 25 possible Caesar shifts and ranks them by English probability."""
    results = []
    
    for shift in range(1, 26):
        decrypted = caesar_transform(ciphertext, shift, encode=False)
        score = score_english(decrypted)
        results.append({
            "shift": shift,
            "text": decrypted,
            "score": score
        })
        
    # Sort descending by score
    results.sort(key=lambda x: x["score"], reverse=True)
    return results
