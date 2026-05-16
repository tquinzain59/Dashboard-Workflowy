async function run() {
  const res = await fetch('http://localhost:3000/api/workflowy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_id: '80bf43a7-6ad8-11ae-9413-ce411c280c9c' })
  });
  const json = await res.json().catch(e => ({ error: "json parse error" }));
  console.log(json);
}
run();
