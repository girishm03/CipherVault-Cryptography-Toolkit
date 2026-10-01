"""
CipherVault - One-Click Launcher for Backend & Frontend
Starts both FastAPI (port 8000) and Vite React Frontend (port 3000).
"""
import subprocess
import sys
import os
import time

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

# Virtual environment python binary
if sys.platform == "win32":
    PYTHON_EXE = os.path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe")
    NPM_CMD = "npm.cmd"
else:
    PYTHON_EXE = os.path.join(BACKEND_DIR, ".venv", "bin", "python")
    NPM_CMD = "npm"

def main():
    print("=" * 60)
    print("  CipherVault - Caesar Cipher & Hash Decoder Suite")
    print("=" * 60)

    if not os.path.exists(PYTHON_EXE):
        print(f"[!] Virtual environment not found at: {PYTHON_EXE}")
        print("[!] Please initialize backend/.venv first.")
        sys.exit(1)

    print("\n[+] Launching FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [PYTHON_EXE, "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=BACKEND_DIR
    )

    # Allow backend to bind
    time.sleep(2)

    print("[+] Launching React Frontend on http://localhost:3000 ...")
    frontend_proc = subprocess.Popen(
        [NPM_CMD, "run", "dev"],
        cwd=FRONTEND_DIR
    )

    print("\n" + "=" * 60)
    print("  CipherVault is running!")
    print("  -> Frontend: http://localhost:3000")
    print("  -> Backend API: http://127.0.0.1:8000/docs")
    print("  Press Ctrl+C to terminate both servers.")
    print("=" * 60 + "\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[*] Shutting down CipherVault servers...")
        frontend_proc.terminate()
        backend_proc.terminate()
        print("[*] All servers stopped cleanly. Goodbye!")

if __name__ == "__main__":
    main()
