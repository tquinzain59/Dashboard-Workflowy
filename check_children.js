async function run() {
  const WORKFLOWY_API_KEY = '77415177db61774cd14bfe80ad95e85683f48e82';
  
  // First, get "Livraisons en cours" items
  const res = await fetch('https://beta.workflowy.com/api/beta/list-children/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WORKFLOWY_API_KEY}` },
    body: JSON.stringify({ item_id: '80bf43a7-6ad8-11ae-9413-ce411c280c9c' })
  });
  const json = await res.json();
  const deliveries = json.items || [];
  
  for (const item of deliveries) {
    console.log("Delivery:", item.name);
    // Fetch details
    const childRes = await fetch('https://beta.workflowy.com/api/beta/list-children/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WORKFLOWY_API_KEY}` },
      body: JSON.stringify({ item_id: item.id })
    });
    const childJson = await childRes.json();
    for (const child of childJson.items || []) {
       console.log("   Child RAW:", JSON.stringify(child.name));
       console.log("   Child NOTE:", JSON.stringify(child.note));
    }
    console.log("---");
  }
}
run();
