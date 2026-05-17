import React, { useState, useMemo } from 'react';
import { BaseTileProps } from '@/types';
import TileContainer from '../TileContainer';
import { useAirtableDeliveries, unpack, AirtableDelivery } from '@/hooks/useAirtable';

function getStatusClass(status: string) {
  const s = (status || '').toLowerCase();
  if (s.includes('traité')) return 'status-traité';
  if (s.includes('expédié')) return 'status-expédié';
  if (s.includes('livré')) return 'status-livré';
  if (s.includes('retour')) return 'status-retour';
  if (s.includes('remboursé')) return 'status-remboursé';
  return '';
}

function getTimelineStep(status: string) {
  const s = (status || '').toLowerCase();
  if (s.includes('livré') || s.includes('remboursé')) return 3;
  if (s.includes('expédié') || s.includes('retour')) return 2;
  return 1;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

function formatPrice(num?: number) {
  if (num === undefined || num === null) return '';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(num);
}

const DeliveryCard = ({ data }: { data: AirtableDelivery }) => {
  const [expanded, setExpanded] = useState(false);
  const f = data.fields;
  
  const status = f['État de la Livraison'] || 'Inconnu';
  const statusClass = getStatusClass(status);
  const step = getTimelineStep(status);
  
  const vendor = unpack(f['Nom du Vendeur (lookup)']);
  const platform = unpack(f['Plateforme (lookup)']);
  
  return (
      <div className="delivery-card" onClick={() => setExpanded(!expanded)}>
          <div className="card-header">
              <div className="card-vendor">
                  <span style={{fontSize: '16px'}}>🏪</span> {vendor || 'Inconnu'} {platform && `(${platform})`}
              </div>
              <div className="card-date">{formatDate(f['Date de Commande'])}</div>
          </div>
          
          <div className="card-title">{f['Nom du Produit']} {f['Quantité'] && f['Quantité'] > 1 ? `(x${f['Quantité']})` : ''}</div>
          
          <div className="card-meta">
              <span className={`status-pill ${statusClass}`}>{status}</span>
              <span className="card-price">{formatPrice(f['Prix Total'])}</span>
          </div>
          
          <div className="timeline">
              <div className={`timeline-step ${step >= 1 ? 'active' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-label">Traité</div>
              </div>
              <div className={`timeline-step ${step >= 2 ? 'active' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-label">Expédié</div>
              </div>
              <div className={`timeline-step ${step >= 3 ? 'active' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-label">Livré</div>
              </div>
          </div>
          
          {expanded && (
              <div className="card-details" onClick={e => e.stopPropagation()}>
                  {f['Date de Livraison Prévue'] && (
                      <div className="detail-row"><div className="detail-label">Prévu le :</div><div className="detail-value">{formatDate(f['Date de Livraison Prévue'])}</div></div>
                  )}
                  {f['Date de Livraison Effective'] && (
                      <div className="detail-row"><div className="detail-label">Livré le :</div><div className="detail-value">{formatDate(f['Date de Livraison Effective'])}</div></div>
                  )}
                  {f['Informations de Suivi'] && (
                      <div className="detail-row"><div className="detail-label">Suivi :</div><div className="detail-value">{f['Informations de Suivi']}</div></div>
                  )}
                  {f['Moyen de Paiement'] && (
                      <div className="detail-row"><div className="detail-label">Paiement :</div><div className="detail-value">{f['Moyen de Paiement']}</div></div>
                  )}
                  {f['Numéro de Commande'] && (
                      <div className="detail-row"><div className="detail-label">N° Commande :</div><div className="detail-value">{f['Numéro de Commande']}</div></div>
                  )}
                  {f['Remboursement Attendu'] && (
                      <div className="detail-row"><div className="detail-label">Remboursement :</div><div className="detail-value">{formatPrice(f['Remboursement Attendu'])}</div></div>
                  )}
                  {f['Résumé Automatique (AI)'] && (
                      <div className="detail-row" style={{marginTop: '10px'}}><div className="detail-label">AI Note :</div><div className="detail-value" style={{fontStyle: 'italic', color: 'var(--accent-cyan)'}}>{f['Résumé Automatique (AI)']}</div></div>
                  )}
              </div>
          )}
      </div>
  );
};

export default function DeliveriesTile(props: BaseTileProps) {
  const [expanded, setExpanded] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { deliveries, loading, error } = useAirtableDeliveries(autoRefresh);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
        const f = d.fields;
        const status = f['État de la Livraison'] || '';
        const matchStatus = statusFilter === 'ALL' || status === statusFilter;
        
        const searchLower = search.toLowerCase();
        const matchSearch = search === '' || 
            (f['Nom du Produit'] || '').toLowerCase().includes(searchLower) ||
            (f['Numéro de Commande'] || '').toLowerCase().includes(searchLower) ||
            (unpack(f['Nom du Vendeur (lookup)']) || '').toLowerCase().includes(searchLower);
            
        return matchStatus && matchSearch;
    });
  }, [deliveries, search, statusFilter]);

  const stats = useMemo(() => {
    let totalCount = deliveries.length;
    let activeCount = 0;
    let deliveredCount = 0;
    let totalSpent = 0;
    
    deliveries.forEach(d => {
        const status = (d.fields['État de la Livraison'] || '').toLowerCase();
        if (status.includes('livré') || status.includes('remboursé')) {
            deliveredCount++;
        } else {
            activeCount++;
        }
        if (d.fields['Prix Total']) {
            totalSpent += d.fields['Prix Total'];
        }
    });
    
    return { totalCount, activeCount, deliveredCount, totalSpent };
  }, [deliveries]);

  const exportCSV = () => {
    const headers = ["Numéro de Commande", "Nom du Produit", "Vendeur", "Date", "Prix", "Statut", "Suivi"];
    const rows = filteredDeliveries.map(d => {
        const f = d.fields;
        return [
            f['Numéro de Commande'] || '',
            `"${(f['Nom du Produit'] || '').replace(/"/g, '""')}"`,
            unpack(f['Nom du Vendeur (lookup)']),
            f['Date de Commande'] || '',
            f['Prix Total'] || '',
            f['État de la Livraison'] || '',
            f['Informations de Suivi'] || ''
        ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "livraisons_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TileContainer {...props} expanded={expanded} onExpandToggle={handleExpandToggle}>
      {!expanded && (
        <div style={{ textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {error ? (
            <p style={{ fontSize: '1rem', color: '#ff9800', margin: 0 }}>⚠️ Erreur réseau Airtable</p>
          ) : loading ? (
            <p style={{ fontSize: '1.2rem', margin: 0, opacity: 0.7 }}>Chargement...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                {stats.activeCount > 0 ? `${stats.activeCount} livraisons en cours` : 'Aucune livraison en cours'}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                ({stats.totalCount} au total)
              </p>
            </div>
          )}
        </div>
      )}

      {expanded && (
        <div className="airtable-deliveries-container" style={{ padding: '10px 20px', height: '100%', overflowY: 'auto' }}>
          <div className="stats-grid">
              <div className="stat-card">
                  <div className="stat-title">Total Commandes</div>
                  <div className="stat-value" style={{color: '#fff'}}>{stats.totalCount}</div>
              </div>
              <div className="stat-card">
                  <div className="stat-title">En Cours</div>
                  <div className="stat-value" style={{color: 'var(--accent-orange)'}}>{stats.activeCount}</div>
              </div>
              <div className="stat-card">
                  <div className="stat-title">Livrées</div>
                  <div className="stat-value" style={{color: 'var(--accent-green)'}}>{stats.deliveredCount}</div>
              </div>
              <div className="stat-card">
                  <div className="stat-title">Dépenses Totales</div>
                  <div className="stat-value">{formatPrice(stats.totalSpent)}</div>
              </div>
          </div>
          
          <div className="controls-bar">
              <input 
                  type="text" 
                  className="control-input" 
                  placeholder="🔍 Rechercher produit, commande, vendeur..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
              />
              
              <select className="control-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="ALL">Tous les statuts</option>
                  <option value="Traité">Traité</option>
                  <option value="Expédié">Expédié</option>
                  <option value="Livré">Livré</option>
                  <option value="Retour en cours">Retour en cours</option>
                  <option value="Remboursé">Remboursé</option>
              </select>
              
              <div style={{flex: 1}}></div>
              
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-secondary)'}}>
                  <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
                  Auto-refresh (5m)
              </label>
              
              <button className="btn btn-primary" onClick={exportCSV}>
                  📥 Exporter CSV
              </button>
          </div>
          
          {error && <div style={{color: 'var(--accent-orange)', padding: '20px', textAlign: 'center'}}>{error}</div>}
          
          {loading ? (
              <div className="loader">Chargement des données depuis Airtable...</div>
          ) : (
              <div className="deliveries-grid">
                  {filteredDeliveries.map(d => <DeliveryCard key={d.id} data={d} />)}
                  {filteredDeliveries.length === 0 && (
                      <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)'}}>
                          Aucune livraison trouvée.
                      </div>
                  )}
              </div>
          )}
        </div>
      )}
    </TileContainer>
  );
}
