import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CaesarCipher from './components/CaesarCipher/CaesarCipher';
import HashGenerator from './components/HashDecoder/HashGenerator';
import HashCracker from './components/HashDecoder/HashCracker';
import HashIdentifier from './components/HashDecoder/HashIdentifier';
import CryptoReference from './components/Reference/CryptoReference';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('caesar');
  const [apiOnline, setApiOnline] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Cross-component forwarding state
  const [targetCrackerHash, setTargetCrackerHash] = useState('');
  const [targetCrackerAlgo, setTargetCrackerAlgo] = useState('auto');
  const [targetIdentHash, setTargetIdentHash] = useState('');

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Check backend health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setApiOnline(true);
        } else {
          setApiOnline(false);
        }
      } catch (e) {
        setApiOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendToCracker = (hashVal, algo = 'auto') => {
    setTargetCrackerHash(hashVal);
    setTargetCrackerAlgo(algo);
    setActiveTab('hash-crack');
  };

  const handleSendToIdentifier = (hashVal) => {
    setTargetIdentHash(hashVal);
    setActiveTab('hash-ident');
  };

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiOnline={apiOnline}
      />

      <main>
        {activeTab === 'caesar' && (
          <CaesarCipher onNotify={addToast} />
        )}

        {activeTab === 'hash-gen' && (
          <HashGenerator
            onNotify={addToast}
            onSendToCracker={handleSendToCracker}
            onSendToIdentifier={handleSendToIdentifier}
          />
        )}

        {activeTab === 'hash-crack' && (
          <HashCracker
            initialHash={targetCrackerHash}
            initialAlgo={targetCrackerAlgo}
            onNotify={addToast}
          />
        )}

        {activeTab === 'hash-ident' && (
          <HashIdentifier
            initialHash={targetIdentHash}
            onNotify={addToast}
            onSendToCracker={handleSendToCracker}
          />
        )}

        {activeTab === 'reference' && (
          <CryptoReference />
        )}
      </main>

      {/* Toast Notification Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <CheckCircle size={16} color="var(--neon-cyan)" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
