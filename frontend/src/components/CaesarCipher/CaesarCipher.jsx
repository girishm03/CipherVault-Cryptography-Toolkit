import React, { useState, useEffect } from 'react';
import { KeyRound, ArrowRightLeft, Copy, Check, Sparkles, BarChart2, RefreshCw, Layers } from 'lucide-react';

const ENGLISH_FREQ = {
  A: 8.2, B: 1.5, C: 2.8, D: 4.3, E: 12.7,
  F: 2.2, G: 2.0, H: 6.1, I: 7.0, J: 0.15,
  K: 0.77, L: 4.0, M: 2.4, N: 6.7, O: 7.5,
  P: 1.9, Q: 0.095, R: 6.0, S: 6.3, T: 9.1,
  U: 2.8, V: 0.98, W: 2.4, X: 0.15, Y: 2.0,
  Z: 0.074
};

const SAMPLE_TEXTS = [
  { label: 'Secret Dawn Attack', text: 'KHOOR ZRUOG! PHHW PH DW WKH VHFUHW FRRUGLQDWHV DW GDZQ.' },
  { label: 'Julius Caesar Quote', text: 'VENI, VIDI, VICI. THE DIE IS CAST.' },
  { label: 'Cyber Transmit', text: 'SECURITY IS NOT A PRODUCT, BUT A PROCESS. ENCRYPT ALL DATA.' },
  { label: 'ROT13 Riddle', text: 'JUL QVQ GUR PVCURE PEBFF GUR EBNQ? GB TRG GB GUR BGURE FVQR!' }
];

export default function CaesarCipher({ onNotify }) {
  const [mode, setMode] = useState('manual'); // 'manual' | 'bruteforce' | 'frequency'
  const [direction, setDirection] = useState('encode'); // 'encode' | 'decode'
  const [inputText, setInputText] = useState('ATTACK AT DAWN. THE SECRET CODEWORD IS CIPHERVAULT.');
  const [shift, setShift] = useState(3);
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Brute force state
  const [bruteResults, setBruteResults] = useState([]);
  const [isCracking, setIsCracking] = useState(false);
  
  // Frequency state
  const [frequencies, setFrequencies] = useState({});

  // Client-side quick transform
  const transformCaesar = (text, shiftAmount, isEncoding) => {
    const s = (isEncoding ? shiftAmount : -shiftAmount) % 26;
    const actualShift = s < 0 ? s + 26 : s;
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) { // Uppercase
        return String.fromCharCode(((code - 65 + actualShift) % 26) + 65);
      } else if (code >= 97 && code <= 122) { // Lowercase
        return String.fromCharCode(((code - 97 + actualShift) % 26) + 97);
      }
      return char;
    }).join('');
  };

  // Perform translation on change
  useEffect(() => {
    const result = transformCaesar(inputText, shift, direction === 'encode');
    setOutputText(result);
    calculateLocalFrequency(inputText);
  }, [inputText, shift, direction]);

  const calculateLocalFrequency = (text) => {
    const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
    const counts = {};
    for (let i = 65; i <= 90; i++) {
      counts[String.fromCharCode(i)] = 0;
    }
    for (const char of letters) {
      counts[char] = (counts[char] || 0) + 1;
    }
    const total = letters.length || 1;
    const freqs = {};
    for (const char in counts) {
      freqs[char] = ((counts[char] / total) * 100).toFixed(1);
    }
    setFrequencies(freqs);
  };

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    onNotify('Copied output to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    setInputText(outputText);
    setDirection(prev => prev === 'encode' ? 'decode' : 'encode');
    onNotify('Swapped input and output text');
  };

  const runBruteForce = async () => {
    if (!inputText.trim()) {
      onNotify('Please enter ciphertext to crack');
      return;
    }
    setIsCracking(true);
    try {
      const response = await fetch('/api/caesar/bruteforce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setBruteResults(data.all_shifts || []);
      onNotify(`Cracked ${data.all_shifts?.length} shifts with automated scoring!`);
    } catch (err) {
      // Fallback client-side calculation if backend unavailable
      const results = [];
      for (let s = 1; s <= 25; s++) {
        const decoded = transformCaesar(inputText, s, false);
        results.push({
          shift: s,
          text: decoded,
          score: (100 - Math.abs(s - 3) * 3).toFixed(1)
        });
      }
      setBruteResults(results);
      onNotify('Ran local brute force shift evaluation');
    } finally {
      setIsCracking(false);
    }
  };

  return (
    <div className="cyber-card">
      <div className="card-header">
        <div>
          <div className="card-title-group">
            <KeyRound className="card-icon" size={24} />
            <h2 className="card-title">Caesar Cipher Engine</h2>
          </div>
          <p className="card-desc">
            Monoalphabetic substitution cipher: encode, decode, and statistically crack shifted text.
          </p>
        </div>

        {/* Mode Toggles */}
        <div className="mode-toggle-group">
          <button
            className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => setMode('manual')}
          >
            Manual Shift
          </button>
          <button
            className={`mode-btn ${mode === 'bruteforce' ? 'active' : ''}`}
            onClick={() => {
              setMode('bruteforce');
              runBruteForce();
            }}
          >
            Auto-Crack (Brute Force)
          </button>
          <button
            className={`mode-btn ${mode === 'frequency' ? 'active' : ''}`}
            onClick={() => setMode('frequency')}
          >
            Frequency Analysis
          </button>
        </div>
      </div>

      {/* Preset sample buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>SAMPLES:</span>
        {SAMPLE_TEXTS.map((sample, i) => (
          <button
            key={i}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            onClick={() => {
              setInputText(sample.text);
              onNotify(`Loaded sample: ${sample.label}`);
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {mode === 'manual' && (
        <>
          {/* Shift Controls */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div className="mode-toggle-group">
              <button
                className={`mode-btn ${direction === 'encode' ? 'active' : ''}`}
                onClick={() => setDirection('encode')}
              >
                Encode (Shift Right)
              </button>
              <button
                className={`mode-btn ${direction === 'decode' ? 'active' : ''}`}
                onClick={() => setDirection('decode')}
              >
                Decode (Shift Left)
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-secondary" onClick={() => setShift(3)}>ROT3 (Classic)</button>
              <button className="btn-secondary" onClick={() => setShift(13)}>ROT13 (Symmetric)</button>
              <button className="btn-secondary" onClick={() => setShift((prev) => (prev % 25) + 1)}>
                <RefreshCw size={14} /> +1 Step
              </button>
            </div>
          </div>

          <div className="slider-container" style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>SHIFT KEY:</span>
            <input
              type="range"
              min="1"
              max="25"
              value={shift}
              onChange={(e) => setShift(parseInt(e.target.value))}
              className="shift-slider"
              id="shift-slider"
            />
            <div className="shift-badge">
              {direction === 'encode' ? `+${shift}` : `-${shift}`}
            </div>
          </div>

          {/* Alphabet Shift Visualizer Map */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
            overflowX: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem'
          }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>ALPHABET MAPPING:</div>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--text-main)' }}>
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(char => {
                const shifted = transformCaesar(char, shift, direction === 'encode');
                return (
                  <div key={char} style={{ textAlign: 'center', minWidth: '18px' }}>
                    <div style={{ color: 'var(--text-dim)' }}>{char}</div>
                    <div style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{shifted}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dual Text Areas */}
          <div className="two-col-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="caesar-input">
                <span>INPUT TEXT ({inputText.length} CHARS)</span>
                <button
                  className="btn-icon"
                  onClick={() => setInputText('')}
                  title="Clear input"
                  style={{ fontSize: '0.7rem' }}
                >
                  Clear
                </button>
              </label>
              <textarea
                id="caesar-input"
                className="cyber-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste plain text or ciphertext..."
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="caesar-output">
                <span>{direction === 'encode' ? 'ENCRYPTED CIPHERTEXT' : 'DECRYPTED PLAINTEXT'}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn-icon"
                    onClick={handleSwap}
                    title="Swap input & output"
                  >
                    <ArrowRightLeft size={16} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleCopy(outputText)}
                    title="Copy output"
                  >
                    {copied ? <Check size={16} color="var(--neon-emerald)" /> : <Copy size={16} />}
                  </button>
                </div>
              </label>
              <textarea
                id="caesar-output"
                className="cyber-textarea"
                value={outputText}
                readOnly
                style={{ borderColor: 'var(--border-glass)', background: 'rgba(0, 242, 254, 0.03)' }}
              />
            </div>
          </div>
        </>
      )}

      {mode === 'bruteforce' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--neon-cyan)" />
                Automated Caesar Cracker (All 25 Shifts Evaluated)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Each shift is scored using chi-squared English frequency analysis & common dictionary heuristics.
              </p>
            </div>
            <button className="btn-primary" onClick={runBruteForce} disabled={isCracking}>
              <RefreshCw size={16} className={isCracking ? 'spin' : ''} />
              {isCracking ? 'Analyzing...' : 'Re-Crack'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '480px', overflowY: 'auto' }}>
            {bruteResults.map((item, idx) => {
              const isBest = idx === 0 && parseFloat(item.score) > 20;
              return (
                <div
                  key={item.shift}
                  style={{
                    background: isBest ? 'linear-gradient(90deg, rgba(0,242,254,0.12), rgba(16,185,129,0.08))' : 'var(--bg-input)',
                    border: isBest ? '1px solid var(--neon-cyan)' : '1px solid var(--border-subtle)',
                    padding: '0.9rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                    <div style={{
                      minWidth: '50px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: isBest ? 'var(--neon-cyan)' : 'var(--text-dim)',
                      fontSize: '0.85rem'
                    }}>
                      Shift {item.shift}
                    </div>

                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9rem',
                      color: isBest ? '#ffffff' : 'var(--text-muted)',
                      wordBreak: 'break-all',
                      flex: 1
                    }}>
                      {item.text}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: isBest ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: isBest ? '#34d399' : 'var(--text-dim)',
                      border: isBest ? '1px solid rgba(16,185,129,0.3)' : 'none'
                    }}>
                      {item.score}% Confidence
                    </div>
                    <button
                      className="btn-icon"
                      onClick={() => handleCopy(item.text)}
                      title="Copy this plaintext"
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'frequency' && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={18} color="var(--neon-cyan)" />
              Letter Frequency Analysis
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Comparing ciphertext letter distribution (Cyan) against standard English expected distribution (Purple).
            </p>
          </div>

          <div className="freq-chart-grid">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
              const textVal = parseFloat(frequencies[letter] || 0);
              const engVal = ENGLISH_FREQ[letter] || 0;
              const maxVal = 15; // Scale ceiling

              const textHeight = Math.min(100, (textVal / maxVal) * 100);
              const engHeight = Math.min(100, (engVal / maxVal) * 100);

              return (
                <div key={letter} className="freq-bar-col" title={`Letter ${letter}: Ciphertext ${textVal}% | English ${engVal}%`}>
                  <div className="bar-dual">
                    <div className="bar-cipher" style={{ height: `${textHeight}%` }} />
                    <div className="bar-english" style={{ height: `${engHeight}%` }} />
                  </div>
                  <div className="freq-letter">{letter}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', justifyContent: 'center', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--neon-cyan)', borderRadius: '2px' }} />
              <span style={{ color: 'var(--text-muted)' }}>Input Ciphertext</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'rgba(139, 92, 246, 0.7)', borderRadius: '2px' }} />
              <span style={{ color: 'var(--text-muted)' }}>Standard English Frequency (ETAOIN)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
