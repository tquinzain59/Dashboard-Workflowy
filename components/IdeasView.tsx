import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface WorkflowyNode {
  id: string;
  nm: string;
  no?: string;
  ch?: WorkflowyNode[];
}

export default function IdeasView() {
  const [nodes, setNodes] = useState<WorkflowyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedNode, setSelectedNode] = useState<WorkflowyNode | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/workflowy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: '566be6818799' })
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch Ideas from Workflowy');
      }
      
      const data = await res.json();
      if (data && data.ch) {
        setNodes(data.ch);
      } else {
        setNodes([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractDriveId = (text?: string) => {
    if (!text) return null;
    
    // Match standard Drive links like https://drive.google.com/file/d/ID/view
    const fileIdMatch = text.match(/drive\.google\.com\/file\/d\/([^\/\?\&]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return fileIdMatch[1];
    }
    
    // Match open?id=ID links
    const openIdMatch = text.match(/drive\.google\.com\/open\?id=([^&]+)/);
    if (openIdMatch && openIdMatch[1]) {
      return openIdMatch[1];
    }

    return null;
  };

  const handleNodeClick = async (node: WorkflowyNode) => {
    setSelectedNode(node);
    setMarkdownContent(null);
    
    const driveId = extractDriveId(node.no) || extractDriveId(node.nm);
    
    if (!driveId) {
      setMarkdownContent('*(Aucun lien Google Drive trouvé pour cette analyse)*');
      return;
    }

    try {
      setContentLoading(true);
      const res = await fetch(`/api/drive?fileId=${driveId}`);
      if (!res.ok) {
        throw new Error('Erreur lors du chargement du fichier Drive');
      }
      const text = await res.text();
      setMarkdownContent(text);
    } catch (err: any) {
      setMarkdownContent(`*(Erreur: ${err.message})*`);
    } finally {
      setContentLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Chargement des analyses...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Erreur: {error}</div>;

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar for analyses list */}
      <div style={{ 
        width: '350px', 
        borderRight: '1px solid var(--border-color)', 
        overflowY: 'auto',
        background: 'var(--surface-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
          Mes Analyses Nocturnes
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {nodes.map(node => (
            <li 
              key={node.id} 
              onClick={() => handleNodeClick(node)}
              style={{
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
                background: selectedNode?.id === node.id ? 'var(--metro-blue)' : 'transparent',
                color: selectedNode?.id === node.id ? '#fff' : 'inherit',
                transition: 'background 0.2s ease',
              }}
            >
              <div style={{ fontWeight: 500, fontSize: '1.1rem' }}>{node.nm || 'Sans titre'}</div>
            </li>
          ))}
        </ul>
        {nodes.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
            Aucune analyse trouvée.
          </div>
        )}
      </div>

      {/* Main content area for Markdown rendering */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: 'var(--bg-color)' }}>
        {contentLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Chargement du document...</p>
          </div>
        ) : markdownContent ? (
          <div className="markdown-body" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
            <h1 style={{ marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              {selectedNode?.nm}
            </h1>
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', opacity: 0.5 }}>
            <p style={{ fontSize: '1.2rem' }}>Sélectionnez une analyse pour afficher son contenu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
