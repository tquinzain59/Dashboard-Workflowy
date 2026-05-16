async function run() {
  const WORKFLOWY_API_KEY = '77415177db61774cd14bfe80ad95e85683f48e82';
  const res = await fetch('https://beta.workflowy.com/api/beta/list-children/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WORKFLOWY_API_KEY}` },
    body: JSON.stringify({ item_id: '80bf43a7-6ad8-11ae-9413-ce411c280c9c' })
  });
  console.log("Status:", res.status);
  const json = await res.json();
  console.log("Items count:", json.items ? json.items.length : 0);
}
run();
