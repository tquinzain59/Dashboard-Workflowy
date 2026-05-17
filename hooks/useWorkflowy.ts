import { useState, useEffect } from 'react';
import { WorkflowyNode, ExpensesData, DeliveryData } from '@/types';

export const parseDateFromName = (name: string): Date | null => {
  if (!name) return null;
  const rawName = name.replace(/<[^>]+>/g, '');
  let match = rawName.match(/📅\s*(\d{4}-\d{2}-\d{2})/);
  if (match) return new Date(match[1]);
  match = rawName.match(/📅\s*(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) return new Date(`${match[3]}-${match[2]}-${match[1]}`);
  return null;
};

export function useWorkflowyNode(nodeId: string, autoFetch: boolean = true) {
  const [items, setItems] = useState<WorkflowyNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNode = async (id: string = nodeId, retries = 1): Promise<WorkflowyNode[]> => {
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
      setLoading(false);
      return data;
    } catch (err: any) {
      if (retries > 0) {
        // Wait 1 second before retrying
        await new Promise(r => setTimeout(r, 1000));
        return fetchNode(id, retries - 1);
      }
      setError(err.message);
      setLoading(false);
      return [];
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
            paramVal = valJson.items.map((i: any) => {
              return i.name.replace(/<[^>]+>/g, '')
                           .replace(/&lt;/g, '<')
                           .replace(/&gt;/g, '>')
                           .replace(/&amp;/g, '&');
            }).join(", ");
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

export function useExpenses(nodeId: string) {
  const { items, loading } = useWorkflowyNode(nodeId, true);
  const [parsedData, setParsedData] = useState<ExpensesData | null>(null);

  useEffect(() => {
    async function parseData() {
      if (!items || items.length === 0) return;
      
      // Sort to get the latest date entry
      const sortedDates = [...items].sort((a: any, b: any) => b.createdAt - a.createdAt);
      const latestDate = sortedDates[0];
      
      const res = await fetch('/api/workflowy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: latestDate.id }) });
      const json = await res.json();
      const logs = json.items || [];
      
      let data: ExpensesData = {
        date: latestDate.name.replace(/<[^>]+>/g, '') // "📅 2026-05-07" ou "2026-05-07"
      };
      
      for (const log of logs) {
        const text = log.name.replace(/<[^>]+>/g, ''); // Remove HTML
        
        // Match OpenRouter
        if (text.includes("OpenRouter")) {
          const dailyMatch = text.match(/Daily:\s*([\d.]+\$)/);
          const weeklyMatch = text.match(/Weekly:\s*([\d.]+\$)/);
          const monthlyMatch = text.match(/Monthly:\s*([\d.]+\$)/);
          data.openRouter = {
            daily: dailyMatch ? dailyMatch[1] : '--',
            weekly: weeklyMatch ? weeklyMatch[1] : '--',
            monthly: monthlyMatch ? monthlyMatch[1] : '--',
          };
        }
        
        // Match DeepSeek
        if (text.includes("DeepSeek")) {
          const soldeMatch = text.match(/Solde:\s*([\d.]+\$)/);
          const aujourdHuiMatch = text.match(/Aujourd'hui:\s*([\d.]+\$)/);
          const appelsMatch = text.match(/Appels:\s*(\d+)/);
          const tokensMatch = text.match(/Tokens:\s*([\w\d]+)/);
          data.deepSeek = {
            solde: soldeMatch ? soldeMatch[1] : '--',
            aujourdHui: aujourdHuiMatch ? aujourdHuiMatch[1] : '--',
            appels: appelsMatch ? appelsMatch[1] : '--',
            tokens: tokensMatch ? tokensMatch[1] : '--',
          };
        }
        
        // Match Total
        if (text.includes("Total aujourd'hui")) {
          const totalMatch = text.match(/Total aujourd'hui:\s*([\d.]+\$)/);
          if (totalMatch) {
            data.totalAujourdHui = totalMatch[1];
          }
        }
      }
      
      setParsedData(data);
    }
    
    if (items.length > 0 && !parsedData) {
      parseData();
    }
  }, [items, parsedData]);

  return { parsedData, loading: loading || (!parsedData && items.length > 0) };
}

export function useDeliveries(nodeId: string, shouldFetchDetails: boolean) {
  const { items, loading: rootLoading, error } = useWorkflowyNode(nodeId, true);
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      if (!items || items.length === 0 || !shouldFetchDetails) {
        return;
      }
      setLoading(true);
      
      const results: DeliveryData[] = [];
      for (const item of items) {
         let name = item.name.replace(/<[^>]+>/g, '').replace(/^•\s*/, '').trim();
         
         const parts = name.split(' - ');
         const orderDate = parts[0]?.trim() || '';
         const site = parts[1]?.trim() || '';
         const description = parts.slice(2).join(' - ').trim() || '';
         
         let state = '';
         let expectedDelivery = '';
         let price = '';
         let tracking = '';
         
         let success = false;
         let retries = 2;

         while (!success && retries >= 0) {
           try {
             // Artificial delay to prevent rate limiting
             await new Promise(r => setTimeout(r, 600));

             const res = await fetch('/api/workflowy', { 
               method: 'POST', 
               headers: { 'Content-Type': 'application/json' }, 
               body: JSON.stringify({ item_id: item.id }) 
             });

             if (!res.ok) throw new Error('Erreur réseau Workflowy Details');
             
             const json = await res.json();
             const children = json.items || [];
             success = true;
             
             for (const child of children) {
               const rawText = child.name + (child.note ? ' ' + child.note : '');
               let childName = rawText.replace(/<[^>]+>/g, '')
                                      .replace(/&nbsp;/g, ' ')
                                      .replace(/&amp;/g, '&')
                                      .replace(/&lt;/g, '<')
                                      .replace(/&gt;/g, '>')
                                      .replace(/&#201;/g, 'É')
                                      .replace(/&Eacute;/gi, 'É')
                                      .replace(/^→\s*/, '')
                                      .replace(/^📬\s*/, '')
                                      .trim();
               
               const stateMatch = childName.match(/(?:État|Etat|Statut)\s*:\s*(.*)/i);
               const deliveryMatch = childName.match(/(?:Livraison prévue|Prévu(?:e)?)\s*:\s*(.*)/i);
               const priceMatch = childName.match(/(?:Prix|Montant)\s*:\s*(.*)/i);
               const trackingMatch = childName.match(/(?:Tracking|Suivi)\s*:\s*(.*)/i);
  
               if (stateMatch) {
                 state = stateMatch[1].trim();
               } else if (deliveryMatch) {
                 expectedDelivery = deliveryMatch[1].trim();
               } else if (priceMatch) {
                 price = priceMatch[1].trim();
               } else if (trackingMatch) {
                 tracking = trackingMatch[1].trim();
               } else if (childName.toLowerCase().includes('retour') || childName.toLowerCase().includes('rembours')) {
                 if (!state) state = childName; 
               }
             }
           } catch(e) {
             console.error("Failed to fetch delivery details, retrying...", e);
             retries--;
             if (retries < 0) {
               console.error("Given up on fetching details for item", item.id);
             }
           }
         }
         
         results.push({
           id: item.id,
           orderDate,
           site,
           description,
           state,
           expectedDelivery,
           price,
           tracking
         });
      }
      
      setDeliveries(results);
      setLoading(false);
    }
    
    if (items.length > 0 && shouldFetchDetails && deliveries.length === 0) {
      fetchDetails();
    }
  }, [items, rootLoading, shouldFetchDetails]);
  
  return { deliveries, loading: rootLoading || loading, error, totalItems: items.length };
}

