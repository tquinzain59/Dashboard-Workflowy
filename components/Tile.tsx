"use client";

import React, { useState, useEffect } from 'react';
import TreeView from './TreeView';

interface TileProps {
  id: string;
  name: string;
  color: string;
  type: string;
  onJarvisClick?: () => void;
}

export default function Tile({ id, name, color, type, onJarvisClick }: TileProps) {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsedInfo, setParsedInfo] = useState<any>(null);

  // Extract icon and title from name (e.g. "🤖 Jarvis")
  const iconMatch = name.match(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/);
  const icon = iconMatch ? iconMatch[0] : '';
  const title = iconMatch ? name.replace(icon, '').trim() : name;

  const fetchData = async () => {
    setLoading(true);
    try {
      if (type === 'weather') {
        const res = await fetch('/api/weather');
        const data = await res.json();
        setParsedInfo(data);
      } else if (type === 'calendar') {
        const res = await fetch('/api/google/calendar');
        if (res.ok) {
          const data = await res.json();
          setParsedInfo(data);
        } else setParsedInfo({ error: 'Non connecté' });
      } else if (type === 'gmail') {
        const res = await fetch('/api/google/gmail');
        if (res.ok) {
          const data = await res.json();
          setParsedInfo(data);
        } else setParsedInfo({ error: 'Non connecté' });
      } else {
        const res = await fetch('/api/workflowy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: id })
        });
        const json = await res.json();
        const items = json.items || [];
        setData(items);

        // Parse specific data for special tile types
        if (type === 'aquarium') {
          await parseAquarium(items);
        } else if (type === 'finances') {
          await parseFinances(items);
        } else if (type === 'citations') {
          parseCitations(items);
        }
      }
    } catch (e) {
      console.error("Failed to fetch data for tile", id);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (type !== 'lecture' && type !== 'jarvis') {
      fetchData(); // Fetch right away for tiles that need to show summaries
    }
  }, [type]);

  const handleExpand = () => {
    if (type === 'jarvis') {
      if (onJarvisClick) onJarvisClick();
      return;
    }
    
    if (!expanded && data.length === 0) {
      fetchData();
    }
    setExpanded(!expanded);
  };

  const parseAquarium = async (items: any[]) => {
    try {
      let dateStr = "";
      let paramVal = "Aucun paramètre trouvé";
      let totalPop = 0;

      const popNode = items.find((i: any) => i.name.includes("Population actuelle"));
      const paramNode = items.find((i: any) => i.name.includes("Paramètres"));

      if (paramNode) {
        const paramRes = await fetch('/api/workflowy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: paramNode.id }) });
        const paramJson = await paramRes.json();
        const dates = paramJson.items || [];
        if (dates.length > 0) {
          dates.sort((a: any, b: any) => b.createdAt - a.createdAt);
          const latestDate = dates[0];
          dateStr = latestDate.name.replace(/<[^>]+>/g, '');

          const valRes = await fetch('/api/workflowy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: latestDate.id }) });
          const valJson = await valRes.json();
          if (valJson.items && valJson.items.length > 0) {
            paramVal = valJson.items.map((i: any) => i.name.replace(/<[^>]+>/g, '')).join(", ");
          }
        }
      }

      if (popNode) {
        const popRes = await fetch('/api/workflowy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: popNode.id }) });
        const popJson = await popRes.json();
        const species = popJson.items || [];

        for (const sp of species) {
          const spRes = await fetch('/api/workflowy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: sp.id }) });
          const spJson = await spRes.json();
          if (spJson.items && spJson.items.length > 0) {
            const countMatch = spJson.items[0].name.replace(/<[^>]+>/g, '').match(/\d+/);
            if (countMatch) {
              totalPop += parseInt(countMatch[0], 10);
            }
          }
        }
      }

      setParsedInfo({
        param: paramVal,
        date: dateStr,
        population: totalPop
      });
    } catch (e) {
      console.error("Erreur parseAquarium", e);
    }
  };

  const parseFinances = async (items: any[]) => {
    try {
      const mouvementsNode = items.find((i: any) => i.name.toLowerCase().includes("mouvements"));
      if (mouvementsNode) {
        const res = await fetch('/api/workflowy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: mouvementsNode.id }) });
        const json = await res.json();
        const mouvs = json.items || [];
        
        // Take the last 5 items
        const last5 = mouvs.slice(-5).map((m: any) => m.name.replace(/<[^>]+>/g, ''));
        
        setParsedInfo((prev: any) => ({
          ...prev,
          mouvements: last5
        }));
      }
    } catch (e) {
      console.error("Erreur parseFinances", e);
    }
  };

  const parseCitations = (items: any[]) => {
    if (items.length > 0) {
      const latestItem = items.reduce((prev, current) => (prev.createdAt > current.createdAt) ? prev : current);
      setParsedInfo({
        quote: latestItem.name.replace(/<[^>]+>/g, '')
      });
    }
  };

  return (
    <div 
      className={`tile ${expanded ? 'expanded' : ''}`} 
      style={{ backgroundColor: expanded ? 'var(--bg-color)' : color }}
      onClick={!expanded ? handleExpand : undefined}
    >
      <div className="tile-header">
        <div className="tile-header-left">
          <span className="tile-icon">{icon}</span>
          <h2 className="tile-title">{title}</h2>
        </div>
        {expanded && (
          <button className="close-expand-btn" onClick={(e) => { e.stopPropagation(); setExpanded(false); }}>
            ×
          </button>
        )}
      </div>

      <div className="tile-content">
        {!expanded && (
          <>
            {type === 'lecture' && <p>Cliquez pour lire le contenu</p>}
            {type === 'jarvis' && <p>Paramètres système & mémoire</p>}
            {type === 'aquarium' && (
              <div>
                {loading ? (
                  <div>
                    <div className="skeleton line"></div>
                    <div className="skeleton line short"></div>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{margin: '0 0 4px 0', fontSize: '0.9rem'}}>Paramètres ({parsedInfo?.date || 'N/A'}) :</p>
                      <div className="tile-value" style={{fontSize: '1.2rem', lineHeight: '1.4', margin: 0}}>{parsedInfo?.param || 'Aucune donnée'}</div>
                    </div>
                    <div>
                      <p style={{margin: '0 0 4px 0', fontSize: '0.9rem'}}>Population totale :</p>
                      <div className="tile-value" style={{fontSize: '2rem', margin: 0}}>{parsedInfo?.population || 0} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>poissons</span></div>
                    </div>
                  </>
                )}
              </div>
            )}
            {type === 'finances' && (
              <div>
                {loading ? (
                  <div>
                    <div className="skeleton line"></div>
                    <div className="skeleton line short"></div>
                    <div className="skeleton line"></div>
                  </div>
                ) : (
                  <>
                    <p style={{margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 500}}>5 derniers mouvements :</p>
                    {parsedInfo?.mouvements && parsedInfo.mouvements.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                        {parsedInfo.mouvements.map((m: string, i: number) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: '0.9rem' }}>Aucun mouvement trouvé.</p>
                    )}
                  </>
                )}
              </div>
            )}
            {type === 'citations' && (
              <div>
                {loading ? <div className="skeleton line"></div> : (
                  <blockquote style={{margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)'}}>
                    "{parsedInfo?.quote || 'Aucune citation'}"
                  </blockquote>
                )}
              </div>
            )}
            {type === 'weather' && (
              <div>
                {loading ? <div className="skeleton line"></div> : (
                  <>
                    <p style={{margin: '0 0 8px 0', fontSize: '0.9rem'}}>Température actuelle :</p>
                    <div className="tile-value" style={{fontSize: '2rem'}}>{parsedInfo?.temperature || '--'}°C</div>
                    <div className="tile-date">Vent : {parsedInfo?.windspeed || '--'} km/h</div>
                  </>
                )}
              </div>
            )}
            {type === 'calendar' && (
              <div>
                {loading ? <div className="skeleton line"></div> : parsedInfo?.error ? <p style={{fontSize:'0.9rem', color:'red'}}>⚠️ Veuillez vous connecter avec Google en haut à droite.</p> : (
                  <>
                    <p style={{margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 500}}>Prochains RDV :</p>
                    {parsedInfo && parsedInfo.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                        {parsedInfo.map((ev: any) => {
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
              </div>
            )}
            {type === 'gmail' && (
              <div>
                {loading ? <div className="skeleton line"></div> : parsedInfo?.error ? <p style={{fontSize:'0.9rem', color:'red'}}>⚠️ Veuillez vous connecter avec Google en haut à droite.</p> : (
                  <>
                    <p style={{margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 500}}>Derniers e-mails :</p>
                    {parsedInfo && parsedInfo.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                        {parsedInfo.map((msg: any) => (
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
              </div>
            )}
          </>
        )}

        {expanded && type === 'lecture' && (
          <div className="tree-container">
            {loading ? (
              <div>
                <div className="skeleton line"></div>
                <div className="skeleton line short"></div>
                <div className="skeleton line"></div>
              </div>
            ) : (
              data.map((item) => (
                <TreeView key={item.id} item={item} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
