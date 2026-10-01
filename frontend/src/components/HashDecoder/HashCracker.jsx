import React, { useState } from 'react';
import { Unlock, ShieldCheck, ShieldAlert, Zap, Timer, Flame, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESETS = [
  { label: 'MD5 ("admin")', hash: '21232f297a57a5a743894a0e4a801fc3', algo: 'md5' },
  { label: 'MD5 ("password")', hash: '5f4dcc3b5aa765d61d8327deb882cf99', algo: 'md5' },
  { label: 'SHA-1 ("123456")', hash: '7c4a8d09ca3762af61e59520943dc26494f8941b', algo: 'sha1' },
  { label: 'SHA-256 ("secret")', hash: '2bb80e3bad52994470164e2787e185f81099f141279a00f247fbe9944dc907b9', algo: 'sha256' },
  { label: 'NTLM ("password")', hash: '8846f7eaee8fb117ad06bdd830b7586c', algo: 'ntlm' }
];

export default function HashCracker({ initialHash, initialAlgo, onNotify }) {
  const [targetHash, setTargetHash] = useState(initialHash || '21232f297a57a5a743894a0e4a801fc3');
  const [algorithm, setAlgorithm] = useState(initialAlgo || 'auto');
  const [attackMode, setAttackMode] = useState('wordlist');
  const [customWords, setCustomWords] = useState('');
  const [isCracking, setIsCracking] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00f2fe', '#10b981', '#8b5cf6', '#ffffff']
      });
    } catch (e) {
      // ignore
    }
  };

  const handleCrack = async () => {
    if (!targetHash.trim()) {
      onNotify('Please enter a target hash to crack');
      return;
    }

    setIsCracking(true);
    setResult(null);

    try {
      const customList = attackMode === 'custom'
        ? customWords.split(/[\n,]+/).map(w => w.trim()).filter(Boolean)
        : null;

      const response = await fetch('/api/hashes/crack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hash: targetHash.trim(),
          algorithm: algorithm,
          attack_mode: attackMode === 'custom' ? 'wordlist' : attackMode,
          custom_words: customList
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setResult(data);

      if (data.found) {
        triggerConfetti();
        onNotify(`Success! Decoded plaintext: "${data.plaintext}"`);
      } else {
        onNotify('Hash not found in dictionary or selected attack space');
      }
    } catch (err) {
      console.error(err);
      onNotify('Cracking service error: Check backend server status');
    } finally {
      setIsCracking(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onNotify('Copied plaintext to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cyber-card">
      <div className="card-header">
        <div>
          <div className="card-title-group">
            <Unlock className="card-icon" size={24} />
            <h2 className="card-title">Hash Decoder & Cracker</h2>
          </div>
          <p className="card-desc">
            Reverse hash digests using dictionary attacks, numerical PIN search, or brute-force permutations.
          </p>
        </div>
      </div>

      {/* Preset sample buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>TARGET PRESETS:</span>
        {PRESETS.map((item, i) => (
          <button
            key={i}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            onClick={() => {
              setTargetHash(item.hash);
              setAlgorithm(item.algo);
              onNotify(`Loaded ${item.label}`);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Target Hash Input */}
      <div className="form-group">
        <label className="form-label" htmlFor="crack-hash-input">
          <span>TARGET HASH DIGEST</span>
          <span style={{ color: 'var(--text-dim)' }}>{targetHash.length} characters</span>
        </label>
        <input
          id="crack-hash-input"
          type="text"
          className="cyber-input"
          value={targetHash}
          onChange={(e) => setTargetHash(e.target.value)}
          placeholder="Paste hash (MD5, SHA-1, SHA-256, NTLM, etc.)..."
        />
      </div>

      {/* Configuration Controls */}
      <div className="two-col-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="crack-algo-select">ALGORITHM</label>
          <select
            id="crack-algo-select"
            className="cyber-select"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            <option value="auto">Auto-Detect Algorithm (Recommended)</option>
            <option value="md5">MD5 (128-bit)</option>
            <option value="sha1">SHA-1 (160-bit)</option>
            <option value="sha256">SHA-256 (256-bit)</option>
            <option value="sha512">SHA-512 (512-bit)</option>
            <option value="ntlm">NTLM (Windows Auth)</option>
            <option value="blake2s">BLAKE2s</option>
            <option value="blake2b">BLAKE2b</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="crack-mode-select">ATTACK VECTOR</label>
          <select
            id="crack-mode-select"
            className="cyber-select"
            value={attackMode}
            onChange={(e) => setAttackMode(e.target.value)}
          >
            <option value="wordlist">Common Wordlist Dictionary (10,000+ top passwords)</option>
            <option value="pin">Numeric PIN Search (0000 - 999999)</option>
            <option value="alphanumeric">Short Alphanumeric Brute-Force (1-4 chars)</option>
            <option value="combined">Combined (Dictionary + PIN + Short Alphanumeric)</option>
            <option value="custom">Custom Wordlist (Provide your own)</option>
          </select>
        </div>
      </div>

      {/* Custom Wordlist Textarea if chosen */}
      {attackMode === 'custom' && (
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" htmlFor="custom-wordlist">
            <span>ENTER CUSTOM CANDIDATE WORDS (COMMA OR NEWLINE SEPARATED)</span>
          </label>
          <textarea
            id="custom-wordlist"
            className="cyber-textarea"
            style={{ minHeight: '90px' }}
            value={customWords}
            onChange={(e) => setCustomWords(e.target.value)}
            placeholder="admin&#10;password&#10;secret123&#10;superman"
          />
        </div>
      )}

      {/* Crack Button */}
      <button
        className="btn-primary"
        style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
        onClick={handleCrack}
        disabled={isCracking}
      >
        <RefreshCw size={18} className={isCracking ? 'spin' : ''} />
        {isCracking ? 'Executing Attack Permutations...' : 'Launch Hash Decoder'}
      </button>

      {/* Results Banner */}
      {result && (
        <>
          {result.found ? (
            <div className="crack-success-banner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShieldCheck size={26} color="var(--neon-emerald)" />
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', letterSpacing: '0.5px' }}>
                    HASH DECODED SUCCESSFULLY!
                  </span>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => handleCopy(result.plaintext)}
                  style={{ borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)' }}
                >
                  {copied ? <Check size={16} color="var(--neon-emerald)" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy Plaintext'}</span>
                </button>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.45)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(16,185,129,0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>RECOVERED PLAINTEXT:</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'var(--neon-cyan)',
                    letterSpacing: '1px'
                  }}>
                    {result.plaintext}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ALGORITHM MATCH:</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--neon-emerald)' }}>
                    {result.algorithm}
                  </div>
                </div>
              </div>

              {/* Telemetry Chips */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="stat-chip">
                  <Timer size={14} color="var(--neon-cyan)" />
                  <span>TIME:</span>
                  <strong>{result.time_taken_ms} ms</strong>
                </div>
                <div className="stat-chip">
                  <Zap size={14} color="var(--neon-emerald)" />
                  <span>ATTEMPTS:</span>
                  <strong>{result.attempts.toLocaleString()}</strong>
                </div>
                <div className="stat-chip">
                  <Flame size={14} color="var(--neon-amber)" />
                  <span>RATE:</span>
                  <strong>{result.hash_rate}</strong>
                </div>
                <div className="stat-chip">
                  <span>METHOD:</span>
                  <strong>{result.method}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="crack-failed-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <ShieldAlert size={24} color="var(--neon-rose)" />
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fb7185' }}>
                  Decryption Failed: Plaintext Not In Search Space
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                The target hash was not found in the current attack vector after {result.attempts.toLocaleString()} attempts.
                Cryptographic hashes are one-way functions designed mathematically to prevent reversing unless the input exists in the wordlist or brute-force permutations.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="stat-chip">
                  <Timer size={14} />
                  <span>TIME:</span>
                  <strong>{result.time_taken_ms} ms</strong>
                </div>
                <div className="stat-chip">
                  <Zap size={14} />
                  <span>ATTEMPTS TESTED:</span>
                  <strong>{result.attempts.toLocaleString()}</strong>
                </div>
                <div className="stat-chip">
                  <Flame size={14} />
                  <span>HASH RATE:</span>
                  <strong>{result.hash_rate}</strong>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
