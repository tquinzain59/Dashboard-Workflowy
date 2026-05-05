import React from 'react';
import { BaseTileProps } from '@/types';
import TileContainer from '../TileContainer';
import { useFinances } from '@/hooks/useWorkflowy';

export default function FinancesTile(props: BaseTileProps) {
  const { mouvements, loading } = useFinances(props.id);

  return (
    <TileContainer {...props} expanded={false} onExpandToggle={() => {}}>
      {loading ? (
        <div>
          <div className="skeleton line"></div>
          <div className="skeleton line short"></div>
          <div className="skeleton line"></div>
        </div>
      ) : (
        <>
          <p style={{margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 500}}>5 derniers mouvements :</p>
          {mouvements && mouvements.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.6', color: '#fff' }}>
              {mouvements.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.9rem' }}>Aucun mouvement trouvé.</p>
          )}
        </>
      )}
    </TileContainer>
  );
}
