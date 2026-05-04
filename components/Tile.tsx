"use client";

import React, { useState, useEffect } from 'react';
import TreeView from './TreeView';

interface TileProps {
  id: string;
  name: string;
  color: string;
  type: string;
  onJarvisClick?: () => void;
}

export default function Tile({ id, name, color, type, onJarvisClick }: TileProps) {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsedInfo, setParsedInfo] = useState<any>(null);

  // Extract icon and title from name (e.g. "🤖 Jarvis")
  const iconMatch = name.match(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/);
  const icon = iconMatch ? iconMatch[0] : '';
  const title = iconMatch ? name.replace(icon, '').trim() : name;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workflowy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: id })
      });
      const json = await res.json();
      const items = json.items || [];
      setData(items);

      // Parse specific data for special tile types
      if (type === 'aquarium') {
        parseAquarium(items);
      } else if (type === 'finances') {
        parseFinances(items);
      } else if (type === 'citations') {
        parseCitations(items);
      }
    } catch (e) {
      console.error("Failed to fetch data for tile", id);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (type !== 'lecture' && type !== 'jarvis') {
      fetchData(); // Fetch right away for tiles that need to show summaries
    }
  }, [type]);

  const handleExpand = () => {
    if (type === 'jarvis') {
      if (onJarvisClick) onJarvisClick();
      return;
    }
    
    if (!expanded && data.length === 0) {
      fetchData();
    }
    setExpanded(!expanded);
  };

  // Parsers for specific node types based on typical Workflowy list structures
  const parseAquarium = (items: any[]) => {
    // Looks for "population actuelle" or latest date
    // Sort items by modifiedAt or assume latest is last/first. Let's take the first item as the most recent day.
    if (items.length > 0) {
      const latestItem = items.reduce((prev, current) => (prev.createdAt > current.createdAt) ? prev : current);
      // We will just show its name as the latest param
      setParsedInfo({
        param: latestItem.name.replace(/<[^>]+>/g, ''), // strip HTML
        date: new Date(latestItem.createdAt * 1000).toLocaleDateString('fr-FR')
      });
    }
  };

  const parseFinances = (items: any[]) => {
    if (items.length > 0) {
      const latestItem = items.reduce((prev, current) => (prev.createdAt > current.createdAt) ? prev : current);
      setParsedInfo({
        balance: latestItem.name.replace(/<[^>]+>/g, ''),
        date: new Date(latestItem.createdAt * 1000).toLocaleDateString('fr-FR')
      });
    }
  };

  const parseCitations = (items: any[]) => {
    if (items.length > 0) {
      const latestItem = items.reduce((prev, current) => (prev.createdAt > current.createdAt) ? prev : current);
      setParsedInfo({
        quote: latestItem.name.replace(/<[^>]+>/g, '')
      });
    }
  };

  return (
    <div 
      className={`tile ${expanded ? 'expanded' : ''}`} 
      style={{ backgroundColor: expanded ? 'var(--bg-color)' : color }}
      onClick={!expanded ? handleExpand : undefined}
    >
      <div className="tile-header">
        <div className="tile-header-left">
          <span className="tile-icon">{icon}</span>
          <h2 className="tile-title">{title}</h2>
        </div>
        {expanded && (
          <button className="close-expand-btn" onClick={(e) => { e.stopPropagation(); setExpanded(false); }}>
            ×
          </button>
        )}
      </div>

      <div className="tile-content">
        {!expanded && (
          <>
            {type === 'lecture' && <p>Cliquez pour lire le contenu</p>}
            {type === 'jarvis' && <p>Paramètres système & mémoire</p>}
            {type === 'aquarium' && (
              <div>
                {loading ? <div className="skeleton line"></div> : (
                  <>
                    <p style={{margin: '0 0 8px 0'}}>Dernier paramètre :</p>
                    <div className="tile-value" style={{fontSize: '1.2rem', lineHeight: '1.4'}}>{parsedInfo?.param || 'Aucune donnée'}</div>
                    <div className="tile-date">{parsedInfo?.date}</div>
                  </>
                )}
              </div>
            )}
            {type === 'finances' && (
              <div>
                {loading ? <div className="skeleton line"></div> : (
                  <>
                    <p style={{margin: '0 0 8px 0'}}>Dernier solde / Facture :</p>
                    <div className="tile-value" style={{fontSize: '1.5rem'}}>{parsedInfo?.balance || 'Aucune donnée'}</div>
                    <div className="tile-date">{parsedInfo?.date}</div>
                  </>
                )}
              </div>
            )}
            {type === 'citations' && (
              <div>
                {loading ? <div className="skeleton line"></div> : (
                  <blockquote style={{margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)'}}>
                    "{parsedInfo?.quote || 'Aucune citation'}"
                  </blockquote>
                )}
              </div>
            )}
          </>
        )}

        {expanded && type === 'lecture' && (
          <div className="tree-container">
            {loading ? (
              <div>
                <div className="skeleton line"></div>
                <div className="skeleton line short"></div>
                <div className="skeleton line"></div>
              </div>
            ) : (
              data.map((item) => (
                <TreeView key={item.id} item={item} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
