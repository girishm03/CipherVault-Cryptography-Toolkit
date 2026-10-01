import React from 'react';
import { BookOpen, Key, Hash, ShieldAlert, Cpu } from 'lucide-react';

export default function CryptoReference() {
  return (
    <div className="cyber-card">
      <div className="card-header">
        <div>
          <div className="card-title-group">
            <BookOpen className="card-icon" size={24} />
            <h2 className="card-title">Cryptography Knowledge Base</h2>
          </div>
          <p className="card-desc">
            Technical principles of substitution ciphers, one-way hash functions, and cryptanalysis.
          </p>
        </div>
      </div>

      <div className="two-col-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Caesar Cipher Card */}
        <div style={{
          background: 'var(--bg-input)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Key size={20} color="var(--neon-cyan)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--neon-cyan)' }}>Caesar Cipher (Shift Cipher)</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.6' }}>
            The Caesar cipher is one of the earliest known encryption techniques, used by Julius Caesar to protect military messages.
            Each letter in the plaintext is shifted by a fixed number of positions down the alphabet.
          </p>
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            padding: '0.75rem',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-cyan)',
            marginBottom: '0.75rem'
          }}>
            <div>Encryption: E_n(x) = (x + n) mod 26</div>
            <div>Decryption: D_n(x) = (x - n) mod 26</div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            <strong>Cryptanalysis:</strong> Extremely vulnerable to brute-force attacks (only 25 possible keys) and frequency analysis, because individual letter frequencies are preserved unchanged in the ciphertext.
          </div>
        </div>

        {/* Cryptographic Hashes Card */}
        <div style={{
          background: 'var(--bg-input)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Hash size={20} color="var(--neon-emerald)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--neon-emerald)' }}>Cryptographic Hash Functions</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.6' }}>
            A cryptographic hash function is a deterministic one-way mathematical algorithm that maps arbitrary-length data into a fixed-size bit string (digest).
            Hashes cannot be mathematically reversed or "decrypted".
          </p>
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            padding: '0.75rem',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--neon-emerald)',
            marginBottom: '0.75rem'
          }}>
            <div>1. Pre-image Resistance: Given h, hard to find m such that H(m) = h</div>
            <div>2. Collision Resistance: Hard to find m1 != m2 such that H(m1) = H(m2)</div>
            <div>3. Avalanche Effect: 1-bit input flip changes ~50% of output bits</div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            <strong>Decoding/Cracking:</strong> Done via pre-computed rainbow tables, dictionary attacks of known passwords, or exhaustive brute-force search.
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
        Cryptographic Primitive Comparison
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-sans)'
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.8rem 1rem' }}>Primitive</th>
              <th style={{ padding: '0.8rem 1rem' }}>Type</th>
              <th style={{ padding: '0.8rem 1rem' }}>Key Required?</th>
              <th style={{ padding: '0.8rem 1rem' }}>Reversible?</th>
              <th style={{ padding: '0.8rem 1rem' }}>Modern Security</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>Caesar Cipher</td>
              <td style={{ padding: '0.8rem 1rem' }}>Symmetric (Monoalphabetic)</td>
              <td style={{ padding: '0.8rem 1rem' }}>Yes (Shift 1-25)</td>
              <td style={{ padding: '0.8rem 1rem' }}>Yes (Subtract Shift)</td>
              <td style={{ padding: '0.8rem 1rem', color: 'var(--neon-rose)' }}>Trivial to break (Insecure)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-amber)' }}>MD5 / SHA-1</td>
              <td style={{ padding: '0.8rem 1rem' }}>One-Way Hash</td>
              <td style={{ padding: '0.8rem 1rem' }}>No</td>
              <td style={{ padding: '0.8rem 1rem' }}>Irreversible (One-way)</td>
              <td style={{ padding: '0.8rem 1rem', color: 'var(--neon-amber)' }}>Deprecated (Collisions Found)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-emerald)' }}>SHA-256 / SHA-512</td>
              <td style={{ padding: '0.8rem 1rem' }}>One-Way Hash (SHA-2)</td>
              <td style={{ padding: '0.8rem 1rem' }}>No</td>
              <td style={{ padding: '0.8rem 1rem' }}>Irreversible (One-way)</td>
              <td style={{ padding: '0.8rem 1rem', color: 'var(--neon-emerald)' }}>Industry Standard (Secure)</td>
            </tr>
            <tr>
              <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-violet)' }}>HMAC-SHA256</td>
              <td style={{ padding: '0.8rem 1rem' }}>Keyed Hash (MAC)</td>
              <td style={{ padding: '0.8rem 1rem' }}>Yes (Secret Key)</td>
              <td style={{ padding: '0.8rem 1rem' }}>Irreversible</td>
              <td style={{ padding: '0.8rem 1rem', color: 'var(--neon-emerald)' }}>High Security Authentication</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
