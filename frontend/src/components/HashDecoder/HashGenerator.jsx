import React, { useState, useEffect } from 'react';
import { Hash, Copy, Check, ShieldAlert, ShieldCheck, Key, Shield, ArrowUpRight, Search } from 'lucide-react';

const SAMPLES = [
  'admin',
  'password123',
  'cybersecurity',
  'TopSecretPayload',
  'Hello World'
];

export default function HashGenerator({ onNotify, onSendToCracker, onSendToIdentifier }) {
  const [inputText, setInputText] = useState('password123');
  const [salt, setSalt] = useState('');
  const [saltPosition, setSaltPosition] = useState('suffix');
  const [hmacKey, setHmacKey] = useState('');
  const [isUppercase, setIsUppercase] = useState(false);
  const [hashResults, setHashResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchHashes = async () => {
    if (!inputText) {
      setHashResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/hashes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          salt: salt,
          salt_position: saltPosition,
          key: hmacKey
        })
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setHashResults(data.results || []);
    } catch (err) {
      console.error(err);
      onNotify('Failed to fetch hashes from backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHashes();
    }, 200);
    return () => clearTimeout(timer);
  }, [inputText, salt, saltPosition, hmacKey]);

  const handleCopy = (hashValue, id) => {
    const text = isUppercase ? hashValue.toUpperCase() : hashValue.toLowerCase();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify(`Copied ${id.toUpperCase()} hash!`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getSecurityClass = (sec) => {
    const s = sec.toLowerCase();
    if (s.includes('vulnerable') || s.includes('deprecated') || s.includes('collision')) return 'sec-vulnerable';
    if (s.includes('secure') || s.includes('standard') || s.includes('future') || s.includes('high')) return 'sec-secure';
    return 'sec-standard';
  };

  return (
    <div className="cyber-card">
      <div className="card-header">
        <div>
          <div className="card-title-group">
            <Hash className="card-icon" size={24} />
            <h2 className="card-title">Cryptographic Hash Generator</h2>
          </div>
          <p className="card-desc">
            Calculate one-way cryptographic message digests, salts, and HMAC signatures in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className={`btn-secondary ${isUppercase ? 'active' : ''}`}
            onClick={() => setIsUppercase(!isUppercase)}
            style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
          >
            {isUppercase ? 'UPPERCASE' : 'lowercase'}
          </button>
        </div>
      </div>

      {/* Preset samples */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>QUICK INPUTS:</span>
        {SAMPLES.map((sample) => (
          <button
            key={sample}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            onClick={() => setInputText(sample)}
          >
            "{sample}"
          </button>
        ))}
      </div>

      {/* Input controls */}
      <div className="form-group">
        <label className="form-label" htmlFor="hash-input-text">
          <span>PLAINTEXT STRING TO HASH</span>
          <span style={{ color: 'var(--text-dim)' }}>{inputText.length} bytes</span>
        </label>
        <input
          id="hash-input-text"
          type="text"
          className="cyber-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to hash..."
        />
      </div>

      {/* Optional Salt & HMAC controls */}
      <div className="two-col-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="hash-salt">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={14} color="var(--neon-emerald)" />
              OPTIONAL SALT
            </span>
            <select
              value={saltPosition}
              onChange={(e) => setSaltPosition(e.target.value)}
              className="cyber-select"
              style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              <option value="suffix">Suffix (Text + Salt)</option>
              <option value="prefix">Prefix (Salt + Text)</option>
            </select>
          </label>
          <input
            id="hash-salt"
            type="text"
            className="cyber-input"
            value={salt}
            onChange={(e) => setSalt(e.target.value)}
            placeholder="e.g. s@lt_k3y_99"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="hmac-key">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Key size={14} color="var(--neon-amber)" />
              OPTIONAL HMAC SECRET KEY
            </span>
            <span style={{ color: 'var(--text-dim)' }}>keyed-hash MAC</span>
          </label>
          <input
            id="hmac-key"
            type="text"
            className="cyber-input"
            value={hmacKey}
            onChange={(e) => setHmacKey(e.target.value)}
            placeholder="e.g. secret_shared_api_key"
          />
        </div>
      </div>

      {/* Hash Results Grid */}
      <div className="hash-results-grid">
        {hashResults.map((item) => {
          const displayHash = isUppercase ? item.hash.toUpperCase() : item.hash.toLowerCase();
          const isCopied = copiedId === item.id;
          const secClass = getSecurityClass(item.security);

          return (
            <div key={item.id} className="hash-card">
              <div className="hash-card-top">
                <div className="hash-name">
                  <span>{item.name}</span>
                  <span className="hash-bits">{item.bits} bits</span>
                </div>
                <span className={`security-badge ${secClass}`}>{item.security}</span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {item.description}
              </div>

              <div className="hash-digest-box">
                <span>{displayHash}</span>
                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                  <button
                    className="btn-icon"
                    onClick={() => handleCopy(item.hash, item.id)}
                    title={`Copy ${item.name} hash`}
                  >
                    {isCopied ? <Check size={14} color="var(--neon-emerald)" /> : <Copy size={14} />}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      onSendToCracker(displayHash, item.id);
                      onNotify(`Sent ${item.name} to Cracker`);
                    }}
                    title="Send to Cracker"
                  >
                    <ArrowUpRight size={14} color="var(--neon-cyan)" />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      onSendToIdentifier(displayHash);
                      onNotify(`Sent hash to Identifier`);
                    }}
                    title="Send to Identifier"
                  >
                    <Search size={14} color="var(--neon-violet)" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
