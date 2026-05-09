"use client";

import React from 'react';
import { useSession } from 'next-auth/react';

interface TileContainerProps {
  color: string;
  icon: string;
  title: string;
  expanded: boolean;
  onExpandToggle: () => void;
  children: React.ReactNode;
}

export default function TileContainer({ color, icon, title, expanded, onExpandToggle, children }: TileContainerProps) {
  const { data: session } = useSession();

  return (
    <div 
      className={`tile ${expanded ? 'expanded' : ''}`} 
      style={{ backgroundColor: expanded ? 'var(--bg-color)' : color }}
      onClick={!expanded ? onExpandToggle : undefined}
    >
      <div className="tile-header">
        <div className="tile-header-left">
          <span className="tile-icon">{icon}</span>
          <h2 className="tile-title">{title}</h2>
        </div>
        {expanded && (
          <button className="close-expand-btn" onClick={(e) => { e.stopPropagation(); onExpandToggle(); }}>
            ×
          </button>
        )}
      </div>

      <div className="tile-content">
        {!session ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', opacity: 0.8, textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>🔒 Connectez-vous pour voir le contenu</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
