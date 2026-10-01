import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, ArrowRight, CheckCircle2, FileQuestion, Copy, Check } from 'lucide-react';

const SAMPLE_HASHES = [
  { label: 'MD5 (admin)', hash: '21232f297a57a5a743894a0e4a801fc3' },
  { label: 'SHA-1 (password)', hash: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8' },
  { label: 'SHA-256 (secret)', hash: '2bb80e3bad52994470164e2787e185f81099f141279a00f247fbe9944dc907b9' },
  { label: 'NTLM (Windows)', hash: '8846f7eaee8fb117ad06bdd830b7586c' },
  { label: 'bcrypt ($2a$)', hash: '$2a$12$e868d4f58546b4142f1cfO.K0U1oJ5E2zL4bX7cK0hKqM7V/yV.5e' }
];

export default function HashIdentifier({ initialHash, onNotify, onSendToCracker }) {
  const [hashInput, setHashInput] = useState(initialHash || '21232f297a57a5a743894a0e4a801fc3');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialHash) {
      setHashInput(initialHash);
    }
  }, [initialHash]);

  const runIdentification = async (hashToAnalyze) => {
    const val = hashToAnalyze !== undefined ? hashToAnalyze : hashInput;
    if (!val.trim()) {
      setAnalysis(null);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/hashes/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: val.trim() })
      });
      if (!response.ok) throw new Error('API failure');
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      onNotify('Failed to analyze hash with backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runIdentification(hashInput);
    }, 250);
    return () => clearTimeout(timer);
  }, [hashInput]);

  const handleCopy = () => {
    navigator.clipboard.writeText(hashInput);
    setCopied(true);
    onNotify('Copied hash to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cyber-card">
      <div className="card-header">
        <div>
          <div className="card-title-group">
            <Search className="card-icon" size={24} />
            <h2 className="card-title">Hash Analyzer & Type Identifier</h2>
          </div>
          <p className="card-desc">
            Identify unknown hashes, inspect entropy, detect bit-lengths, and find candidate algorithms.
          </p>
        </div>
      </div>

      {/* Preset sample buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>SAMPLE HASHES:</span>
        {SAMPLE_HASHES.map((sample, i) => (
          <button
            key={i}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            onClick={() => {
              setHashInput(sample.hash);
              onNotify(`Loaded ${sample.label}`);
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Hash Input */}
      <div className="form-group">
        <label className="form-label" htmlFor="hash-ident-input">
          <span>PASTE UNKNOWN HASH STRING</span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              className="btn-icon"
              onClick={() => setHashInput('')}
              title="Clear"
              style={{ fontSize: '0.7rem' }}
            >
              Clear
            </button>
            <button
              className="btn-icon"
              onClick={handleCopy}
              title="Copy"
            >
              {copied ? <Check size={14} color="var(--neon-emerald)" /> : <Copy size={14} />}
            </button>
          </div>
        </label>
        <textarea
          id="hash-ident-input"
          className="cyber-textarea"
          style={{ minHeight: '85px', fontFamily: 'var(--font-mono)' }}
          value={hashInput}
          onChange={(e) => setHashInput(e.target.value)}
          placeholder="Paste hash (e.g. 5d41402abc4b2a76b9719d911017c592)..."
        />
      </div>

      {/* Analysis Metrics */}
      {analysis && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div className="stat-chip">
              <span>CHAR LENGTH:</span>
              <strong style={{ color: 'var(--neon-cyan)' }}>{analysis.input_length}</strong>
            </div>
            <div className="stat-chip">
              <span>HEXADECIMAL:</span>
              <strong style={{ color: analysis.is_hexadecimal ? 'var(--neon-emerald)' : 'var(--neon-amber)' }}>
                {analysis.is_hexadecimal ? 'YES' : 'NO'}
              </strong>
            </div>
            {analysis.bit_length_estimate && (
              <div className="stat-chip">
                <span>BIT LENGTH:</span>
                <strong style={{ color: 'var(--neon-cyan)' }}>{analysis.bit_length_estimate} bits</strong>
              </div>
            )}
            <div className="stat-chip">
              <span>CANDIDATES:</span>
              <strong style={{ color: 'var(--neon-emerald)' }}>{analysis.matches_found} matches</strong>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            Candidate Hash Algorithms
          </h3>

          {analysis.candidates?.length === 0 ? (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <FileQuestion size={28} color="var(--neon-rose)" />
              <div>
                <div style={{ fontWeight: 600, color: '#fb7185' }}>Unrecognized Hash Format</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  This string does not match standard hexadecimal digests or modular crypt prefixes. It could be custom encoded, base64, or truncated.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {analysis.candidates.map((cand, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--neon-cyan)' }}>
                        {cand.algorithm}
                      </span>
                      <span className="hash-bits">{cand.bits} bits</span>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {cand.category}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      {cand.description}
                    </p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Security Status: <span style={{ color: cand.security.includes('Insecure') || cand.security.includes('Vulnerable') || cand.security.includes('Deprecated') ? 'var(--neon-rose)' : 'var(--neon-emerald)' }}>{cand.security}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--neon-emerald)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}>
                      {cand.confidence} Confidence
                    </div>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                      onClick={() => {
                        onSendToCracker(hashInput, cand.algorithm.toLowerCase());
                        onNotify(`Sent hash to Cracker as ${cand.algorithm}`);
                      }}
                    >
                      Attempt Decode / Crack
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
