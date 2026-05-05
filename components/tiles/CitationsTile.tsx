import React from 'react';
import { BaseTileProps } from '@/types';
import TileContainer from '../TileContainer';
import { useCitations } from '@/hooks/useWorkflowy';

export default function CitationsTile(props: BaseTileProps) {
  const { quote, loading } = useCitations(props.id);

  return (
    <TileContainer {...props} expanded={false} onExpandToggle={() => {}}>
      {loading ? (
        <div className="skeleton line"></div>
      ) : (
        <blockquote style={{margin: 0, fontStyle: 'italic', color: 'rgba(255,255,255,0.8)'}}>
          "{quote || 'Aucune citation'}"
        </blockquote>
      )}
    </TileContainer>
  );
}
