import React from 'react';

interface TileContainerProps {
  color: string;
  icon: string;
  title: string;
  expanded: boolean;
  onExpandToggle: () => void;
  children: React.ReactNode;
}

export default function TileContainer({ color, icon, title, expanded, onExpandToggle, children }: TileContainerProps) {
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
        {children}
      </div>
    </div>
  );
}
