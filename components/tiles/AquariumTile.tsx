import React from 'react';
import { BaseTileProps } from '@/types';
import TileContainer from '../TileContainer';
import { useAquarium } from '@/hooks/useWorkflowy';

export default function AquariumTile(props: BaseTileProps) {
  const { parsedData, loading } = useAquarium(props.id);

  return (
    <TileContainer {...props} expanded={false} onExpandToggle={() => {}}>
      {loading ? (
        <div>
          <div className="skeleton line"></div>
          <div className="skeleton line short"></div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <p style={{margin: '0 0 4px 0', fontSize: '0.9rem'}}>Paramètres ({parsedData?.date || 'N/A'}) :</p>
            <div className="tile-value" style={{fontSize: '1.2rem', lineHeight: '1.4', margin: 0}}>{parsedData?.param || 'Aucune donnée'}</div>
          </div>
          <div>
            <p style={{margin: '0 0 4px 0', fontSize: '0.9rem'}}>Population totale :</p>
            <div className="tile-value" style={{fontSize: '2.5rem', margin: 0}}>{parsedData?.population || 0} <span style={{fontSize: '1rem', color: 'rgba(255,255,255,0.7)'}}>poissons</span></div>
          </div>
        </>
      )}
    </TileContainer>
  );
}
