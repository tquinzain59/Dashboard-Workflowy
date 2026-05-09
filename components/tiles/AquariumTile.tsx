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
            <p style={{margin: '0 0 8px 0', fontSize: '0.9rem'}}>Paramètres ({parsedData?.date || 'N/A'}) :</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {parsedData?.param ? (
                parsedData.param.split(',').map((p, i) => (
                  <span key={i} style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.95rem',
                    fontWeight: 500
                  }}>
                    {p.trim()}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '1rem' }}>Aucune donnée</span>
              )}
            </div>
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
