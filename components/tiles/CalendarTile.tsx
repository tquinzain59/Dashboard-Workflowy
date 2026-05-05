import React from 'react';
import { BaseTileProps } from '@/types';
import TileContainer from '../TileContainer';
import { useGoogleCalendar } from '@/hooks/useGoogle';

export default function CalendarTile(props: BaseTileProps) {
  const { events, loading, error } = useGoogleCalendar();

  return (
    <TileContainer {...props} expanded={false} onExpandToggle={() => {}}>
      {loading ? (
        <div className="skeleton line"></div>
      ) : error ? (
        <p style={{fontSize:'0.9rem', color:'#ff9999'}}>⚠️ {error}</p>
      ) : (
        <>
          <p style={{margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 500}}>Prochains RDV :</p>
          {events && events.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.6', color: '#fff' }}>
              {events.map((ev) => {
                const date = new Date(ev.start?.dateTime || ev.start?.date || Date.now());
                return (
                  <li key={ev.id}>
                    <strong>{date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</strong> - {ev.summary}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p style={{fontSize:'0.9rem'}}>Aucun événement prévu.</p>
          )}
        </>
      )}
    </TileContainer>
  );
}
