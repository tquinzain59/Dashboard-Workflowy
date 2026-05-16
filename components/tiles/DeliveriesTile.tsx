import React, { useState } from 'react';
import { BaseTileProps } from '@/types';
import TileContainer from '../TileContainer';
import { useDeliveries } from '@/hooks/useWorkflowy';

export default function DeliveriesTile(props: BaseTileProps) {
  const [expanded, setExpanded] = useState(false);
  const { deliveries, loading, error, totalItems } = useDeliveries(props.id, expanded);

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };
  
  const getStatusIcon = (state: string) => {
    const s = state.toLowerCase();
    if (s.includes('livré') || s.includes('reçus') || s.includes('traité')) return '✅';
    if (s.includes('expédié') || s.includes('en cours')) return '🚚';
    if (s.includes('retour') || s.includes('rembours')) return '🔄';
    return '📦';
  };

  const activeDeliveries = deliveries.filter(d => !d.state.toLowerCase().includes('livré') && !d.state.toLowerCase().includes('reçus'));

  return (
    <TileContainer {...props} expanded={expanded} onExpandToggle={handleExpandToggle}>
      {!expanded && (
        <div style={{ textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {error ? (
            <p style={{ fontSize: '1rem', color: '#ff9800', margin: 0 }}>⚠️ Erreur réseau</p>
          ) : loading ? (
            <p style={{ fontSize: '1.2rem', margin: 0, opacity: 0.7 }}>Chargement...</p>
          ) : (
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
               {totalItems > 0 ? `${totalItems} livraisons` : 'Aucune livraison'}
            </p>
          )}
        </div>
      )}

      {expanded && (
        <div className="deliveries-container" style={{ padding: '10px', height: '100%', overflowY: 'auto' }}>
          {error ? (
             <div style={{ textAlign: 'center', padding: '20px', color: '#ff9800' }}>⚠️ Une erreur réseau est survenue. Workflowy limite peut-être les requêtes, réessayez plus tard.</div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>Chargement des détails...</div>
          ) : deliveries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>Aucune donnée trouvée</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {deliveries.filter(d => !d.state.toLowerCase().includes('livré') && !d.state.toLowerCase().includes('reçus')).length === 0 && deliveries.length > 0 && (
                <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', color: '#4caf50' }}>
                  Toutes les livraisons sont terminées ! 🎉
                </div>
              )}
              {deliveries.filter(d => !d.state.toLowerCase().includes('livré') && !d.state.toLowerCase().includes('reçus')).map(d => {
                const isCompleted = d.state.toLowerCase().includes('livré') || d.state.toLowerCase().includes('reçus');
                const isReturn = d.state.toLowerCase().includes('retour') || d.state.toLowerCase().includes('rembours');
                let borderColor = '#ff9800'; // warning/orange for in transit
                if (isCompleted) borderColor = '#4caf50'; // green for completed
                if (isReturn) borderColor = '#f44336'; // red for return
                
                return (
                  <div key={d.id} style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '16px', 
                    borderRadius: '8px',
                    borderLeft: `5px solid ${borderColor}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1.15rem' }}>{d.site}</strong>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
                        📅 {d.orderDate}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '1rem', marginBottom: '12px', color: '#e0e0e0', lineHeight: '1.4' }}>
                      {d.description}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{getStatusIcon(d.state)}</span>
                        <span><b>État:</b> <span style={{ color: borderColor, fontWeight: 500 }}>{d.state || 'Inconnu'}</span></span>
                      </span>
                      
                      {d.expectedDelivery && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.1rem' }}>⏱️</span>
                          <span><b>Prévu le:</b> {d.expectedDelivery}</span>
                        </span>
                      )}
                      
                      {d.price && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.1rem' }}>💰</span>
                          <span><b>Prix:</b> {d.price}</span>
                        </span>
                      )}
                      
                      {d.tracking && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.1rem' }}>📍</span>
                          <span><b>Suivi:</b> {d.tracking}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </TileContainer>
  );
}
