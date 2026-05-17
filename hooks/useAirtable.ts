import { useState, useEffect, useMemo, useCallback } from 'react';



export interface AirtableDelivery {
  id: string;
  fields: {
    'Numéro de Commande'?: string;
    'Nom du Produit'?: string;
    'Quantité'?: number;
    'Date de Commande'?: string;
    'Prix Total'?: number;
    'Moyen de Paiement'?: string;
    'État de la Livraison'?: string;
    'Date de Livraison Prévue'?: string;
    'Date de Livraison Effective'?: string;
    'Informations de Suivi'?: string;
    'Remboursement Attendu'?: number;
    'Résumé Automatique (AI)'?: string;
    'Nom du Vendeur (lookup)'?: string[];
    'Plateforme (lookup)'?: string[];
  };
}

export function unpack(value: any): string {
  if (Array.isArray(value) && value.length > 0) return value[0];
  return value || '';
}

async function fetchAllRecords(): Promise<AirtableDelivery[]> {
  let records: AirtableDelivery[] = [];
  let offset: string | null = null;
  do {
    const fetchUrl = offset ? `/api/airtable?offset=${offset}` : `/api/airtable`;
    const response = await fetch(fetchUrl, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Erreur de connexion au proxy Airtable');
    const data = await response.json();
    records = [...records, ...(data.records || [])];
    offset = data.offset;
  } while (offset);
  return records;
}

export function useAirtableDeliveries(autoRefresh: boolean = false) {
  const [deliveries, setDeliveries] = useState<AirtableDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const records = await fetchAllRecords();
      records.sort((a, b) => {
          const dateA = a.fields['Date de Commande'] ? new Date(a.fields['Date de Commande']).getTime() : 0;
          const dateB = b.fields['Date de Commande'] ? new Date(b.fields['Date de Commande']).getTime() : 0;
          return dateB - dateA;
      });
      setDeliveries(records);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadData();
      }, 5 * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  return { deliveries, loading, error, reload: loadData };
}
