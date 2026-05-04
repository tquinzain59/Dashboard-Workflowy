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

  const isLeaf = hasFetched && children.length === 0;

  return (
    <div className="tree-node">
      <div className="tree-node-content">
        <div 
          className={`tree-node-bullet ${isLeaf ? 'empty' : ''}`} 
          onClick={toggleExpand}
        >
          {loading ? '⧖' : (isLeaf ? '•' : (expanded ? '−' : '+'))}
        </div>
        <div className="tree-node-text">
          <div dangerouslySetInnerHTML={createMarkup(item.name)} />
          {item.note && (
            <div className="tree-node-note" dangerouslySetInnerHTML={createMarkup(item.note)} />
          )}
        </div>
      </div>
      
      {expanded && children.length > 0 && (
        <div className="tree-children">
          {children.map(child => (
            <TreeView key={child.id} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}
