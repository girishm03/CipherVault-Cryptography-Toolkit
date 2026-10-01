# Hashes package init
from .hasher import generate_all_hashes, generate_hash_for_algorithm, SUPPORTED_ALGORITHMS
from .identifier import identify_hash
from .cracker import crack_hash
