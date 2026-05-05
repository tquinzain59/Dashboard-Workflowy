import React from 'react';
import { BaseTileProps } from '@/types';
import TileContainer from '../TileContainer';
import { useGmail } from '@/hooks/useGoogle';

export default function GmailTile(props: BaseTileProps) {
  const { messages, loading, error } = useGmail();

  return (
    <TileContainer {...props} expanded={false} onExpandToggle={() => {}}>
      {loading ? (
        <div className="skeleton line"></div>
      ) : error ? (
        <p style={{fontSize:'0.9rem', color:'#ff9999'}}>⚠️ {error}</p>
      ) : (
        <>
          <p style={{margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 500}}>Derniers e-mails :</p>
          {messages && messages.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.4', color: '#fff' }}>
              {messages.map((msg) => (
                <li key={msg.id} style={{marginBottom: '8px'}}>
                  <strong>{msg.from}</strong>:<br/>{msg.subject}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{fontSize:'0.9rem'}}>Aucun message important.</p>
          )}
        </>
      )}
    </TileContainer>
  );
}
