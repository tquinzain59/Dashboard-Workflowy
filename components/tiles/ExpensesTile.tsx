import React from 'react';
import { BaseTileProps } from '@/types';
import TileContainer from '../TileContainer';
import { useExpenses } from '@/hooks/useWorkflowy';

export default function ExpensesTile(props: BaseTileProps) {
  const { parsedData, loading } = useExpenses(props.id);

  return (
    <TileContainer {...props} expanded={false} onExpandToggle={() => {}}>
      {loading ? (
        <div>
          <div className="skeleton line"></div>
          <div className="skeleton line short"></div>
          <div className="skeleton line"></div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#fff' }}>
          {parsedData?.date && (
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
              Dépenses du : <strong>{parsedData.date.replace('📅 ', '')}</strong>
            </div>
          )}
          
          {parsedData?.openRouter && (
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>🌐 OpenRouter</p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.9rem' }}>
                <span>Daily: <strong>{parsedData.openRouter.daily}</strong></span>
                <span>Weekly: <strong>{parsedData.openRouter.weekly}</strong></span>
              </div>
            </div>
          )}
          
          {parsedData?.deepSeek && (
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>🤖 DeepSeek Direct</p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                <span>Solde: <strong>{parsedData.deepSeek.solde}</strong></span>
                <span>Auj.: <strong>{parsedData.deepSeek.aujourdHui}</strong></span>
                <span>Tokens: <strong>{parsedData.deepSeek.tokens}</strong></span>
              </div>
            </div>
          )}
          
          {parsedData?.totalAujourdHui && (
            <div style={{ marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                💰 Total aujourd'hui: {parsedData.totalAujourdHui}
              </span>
            </div>
          )}
          
          {!parsedData?.openRouter && !parsedData?.deepSeek && !parsedData?.totalAujourdHui && (
             <p style={{ fontSize: '0.9rem' }}>Aucune donnée de dépense récente.</p>
          )}
        </div>
      )}
    </TileContainer>
  );
}
