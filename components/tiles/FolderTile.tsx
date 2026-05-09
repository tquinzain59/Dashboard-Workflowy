import React, { useState } from 'react';
import { BaseTileProps } from '@/types';
import TileContainer from '../TileContainer';
import { useWorkflowyNode, parseDateFromName } from '@/hooks/useWorkflowy';
import TreeView from '../TreeView';

export default function FolderTile(props: BaseTileProps) {
  const [expanded, setExpanded] = useState(false);
  const { items, loading, fetchNode } = useWorkflowyNode(props.id, false);

  const handleExpandToggle = () => {
    if (props.type === 'jarvis' && props.onJarvisClick) {
      props.onJarvisClick();
      return;
    }
    
    if (!expanded && items.length === 0) {
      fetchNode();
    }
    setExpanded(!expanded);
  };

  const sortedItems = [...items].sort((a, b) => {
    const dateA = parseDateFromName(a.name);
    const dateB = parseDateFromName(b.name);
    if (dateA && dateB) {
      return dateB.getTime() - dateA.getTime();
    }
    return 0;
  });

  return (
    <TileContainer {...props} expanded={expanded} onExpandToggle={handleExpandToggle}>
      {!expanded && (
        <>
          {props.type === 'lecture' && <p>Cliquez pour lire le contenu</p>}
          {props.type === 'jarvis' && <p>Paramètres système & mémoire</p>}
        </>
      )}

      {expanded && props.type === 'lecture' && (
        <div className="tree-container">
          {loading ? (
            <div>
              <div className="skeleton line"></div>
              <div className="skeleton line short"></div>
              <div className="skeleton line"></div>
            </div>
          ) : (
            sortedItems.map((item) => (
              <TreeView key={item.id} item={item} />
            ))
          )}
        </div>
      )}
    </TileContainer>
  );
}
