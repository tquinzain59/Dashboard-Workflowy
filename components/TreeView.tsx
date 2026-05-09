"use client";

import React, { useState } from 'react';

interface TreeViewProps {
  item: any;
  defaultExpanded?: boolean;
}

export default function TreeView({ item, defaultExpanded = false }: TreeViewProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchChildren = async () => {
    if (hasFetched) return;
    setLoading(true);
    try {
      const res = await fetch('/api/workflowy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id })
      });
      const json = await res.json();
      setChildren(json.items || []);
      setHasFetched(true);
    } catch (e) {
      console.error("Failed to fetch children for", item.id);
    }
    setLoading(false);
  };

  const toggleExpand = async () => {
    if (!expanded && !hasFetched) {
      await fetchChildren();
    }
    setExpanded(!expanded);
  };

  // Basic HTML sanitization for Workflowy's internal formatting
  const createMarkup = (htmlString: string) => {
    return { __html: htmlString || '' };
  };
  
  const formatDateName = (name: string) => {
    const rawName = name.replace(/<[^>]+>/g, '');
    let match = rawName.match(/📅\s*(\d{4}-\d{2}-\d{2})/);
    let dateObj: Date | null = null;
    
    if (match) {
      dateObj = new Date(match[1]);
    } else {
      match = rawName.match(/📅\s*(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        dateObj = new Date(`${match[3]}-${match[2]}-${match[1]}`);
      }
    }
    
    if (dateObj) {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formatted = dateObj.toLocaleDateString('fr-FR', options);
      return `📅 ${formatted.charAt(0).toUpperCase() + formatted.slice(1)}`;
    }
    
    return name;
  };

  const isLeaf = hasFetched && children.length === 0;
  
  const isSpecialChild = (child: any) => {
    const raw = child.name.replace(/<[^>]+>/g, '').toLowerCase();
    return raw.includes("résumé") || raw.includes("source") || raw.includes("lien");
  };

  const normalChildren = children.filter(c => !isSpecialChild(c));
  const hasSpecialChildren = children.some(isSpecialChild);

  const renderSpecialChildren = () => {
    const resume = children.find(c => c.name.replace(/<[^>]+>/g, '').toLowerCase().includes("résumé"));
    const source = children.find(c => c.name.replace(/<[^>]+>/g, '').toLowerCase().includes("source"));
    const lien = children.find(c => c.name.replace(/<[^>]+>/g, '').toLowerCase().includes("lien"));

    if (!resume && !source && !lien) return null;

    return (
      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginTop: '12px', marginBottom: '8px', fontSize: '0.9rem' }}>
        {resume && (
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--metro-teal)' }}>📝 Résumé :</strong>
            <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5' }}>{resume.note?.replace(/<[^>]+>/g, '') || 'Aucun contenu'}</p>
          </div>
        )}
        {source && (
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: 'var(--metro-orange)' }}>🔗 Source :</strong> {source.note?.replace(/<[^>]+>/g, '') || ''}
          </div>
        )}
        {lien && (
          <div>
            <strong style={{ color: 'var(--metro-blue)' }}>🔗 Lien :</strong> <a href={lien.note?.replace(/<[^>]+>/g, '') || '#'} target="_blank" rel="noreferrer" style={{ color: '#4da6ff', textDecoration: 'underline', wordBreak: 'break-all' }}>{lien.note?.replace(/<[^>]+>/g, '') || 'Ouvrir le lien'}</a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tree-node">
      <div className="tree-node-content">
        <div 
          className={`tree-node-bullet ${isLeaf ? 'empty' : ''}`} 
          onClick={toggleExpand}
        >
          {loading ? '⧖' : (isLeaf ? '•' : (expanded ? '−' : '+'))}
        </div>
        <div className="tree-node-text" style={{ flex: 1 }} onClick={toggleExpand}>
          <div dangerouslySetInnerHTML={createMarkup(formatDateName(item.name))} style={{ cursor: 'pointer', fontWeight: hasSpecialChildren ? 600 : 400 }} />
          {item.note && !hasSpecialChildren && (
            <div className="tree-node-note" dangerouslySetInnerHTML={createMarkup(item.note)} />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="tree-children">
          {hasSpecialChildren && renderSpecialChildren()}
          
          {normalChildren.length > 0 && normalChildren.map(child => (
            <TreeView key={child.id} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}
