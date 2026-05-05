import { useState, useEffect } from 'react';
import { WorkflowyNode } from '@/types';

export function useWorkflowyNode(nodeId: string, autoFetch: boolean = true) {
  const [items, setItems] = useState<WorkflowyNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNode = async (id: string = nodeId): Promise<WorkflowyNode[]> => {
    setLoading(true);
    try {
      const res = await fetch('/api/workflowy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: id })
      });
      if (!res.ok) throw new Error('Erreur réseau Workflowy');
      const json = await res.json();
      const data = json.items || [];
      setItems(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchNode();
    }
  }, [nodeId, autoFetch]);

  return { items, loading, error, fetchNode };
}

export function useAquarium(nodeId: string) {
  const { items, loading, fetchNode } = useWorkflowyNode(nodeId, true);
  const [parsedData, setParsedData] = useState<{ param: string, date: string, population: number } | null>(null);

  useEffect(() => {
    async function parseData() {
      if (!items || items.length === 0) return;

      let dateStr = "";
      let paramVal = "Aucun paramètre trouvé";
      let totalPop = 0;

      const popNode = items.find((i) => i.name.includes("Population actuelle"));
      const paramNode = items.find((i) => i.name.includes("Paramètres"));

      if (paramNode) {
        const datesRes = await fetch('/api/workflowy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: paramNode.id }) });
        const datesJson = await datesRes.json();
        const dates = datesJson.items || [];
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

      setParsedData({ param: paramVal, date: dateStr, population: totalPop });
    }

    if (items.length > 0 && !parsedData) {
      parseData();
    }
  }, [items, parsedData]);

  return { parsedData, loading: loading || (!parsedData && items.length > 0) };
}

export function useFinances(nodeId: string) {
  const { items, loading } = useWorkflowyNode(nodeId, true);
  const [mouvements, setMouvements] = useState<string[]>([]);

  useEffect(() => {
    async function parseData() {
      if (!items || items.length === 0) return;
      const mouvementsNode = items.find((i) => i.name.toLowerCase().includes("mouvements"));
      if (mouvementsNode) {
        const res = await fetch('/api/workflowy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: mouvementsNode.id }) });
        const json = await res.json();
        const mouvs = json.items || [];
        const last5 = mouvs.slice(-5).map((m: any) => m.name.replace(/<[^>]+>/g, ''));
        setMouvements(last5);
      }
    }
    if (items.length > 0 && mouvements.length === 0) {
      parseData();
    }
  }, [items, mouvements.length]);

  return { mouvements, loading: loading || (mouvements.length === 0 && items.length > 0) };
}

export function useCitations(nodeId: string) {
  const { items, loading } = useWorkflowyNode(nodeId, true);
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    if (items && items.length > 0) {
      const latestItem = items.reduce((prev, current) => (prev.createdAt > current.createdAt) ? prev : current);
      setQuote(latestItem.name.replace(/<[^>]+>/g, ''));
    }
  }, [items]);

  return { quote, loading };
}
