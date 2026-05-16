async function run() {
  const WORKFLOWY_API_KEY = '77415177db61774cd14bfe80ad95e85683f48e82';
  const res = await fetch('https://beta.workflowy.com/api/beta/list-children/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WORKFLOWY_API_KEY}` },
    body: JSON.stringify({ item_id: 'dd614930-5f64-80b3-359f-5c0596ab3f7e' }) // Utiles
  });
  const json = await res.json();
  const node = json.items.find(i => i.name.includes("Livraisons"));
  console.log("Livraisons node ID:", node ? node.id : "Not Found");
}
run();
