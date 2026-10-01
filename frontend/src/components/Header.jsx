import React from 'react';
import { Shield, KeyRound, Hash, Search, Unlock, BookOpen } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, apiOnline }) {
  const tabs = [
    { id: 'caesar', label: 'Caesar Cipher', icon: KeyRound },
    { id: 'hash-gen', label: 'Hash Encoder', icon: Hash },
    { id: 'hash-crack', label: 'Hash Decoder / Cracker', icon: Unlock },
    { id: 'hash-ident', label: 'Hash Identifier', icon: Search },
    { id: 'reference', label: 'Crypto Docs', icon: BookOpen },
  ];

  return (
    <header className="cyber-header">
      <div className="brand">
        <div className="brand-icon">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="brand-title">CIPHERVAULT</h1>
          <div className="brand-subtitle">Cryptography & Hash Security Suite</div>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Main Navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="header-status">
        <div className={`status-badge ${apiOnline ? '' : 'error'}`}>
          <span className="pulse-dot" />
          <span>{apiOnline ? 'API ONLINE (v1.0)' : 'OFFLINE'}</span>
        </div>
      </div>
    </header>
  );
}
