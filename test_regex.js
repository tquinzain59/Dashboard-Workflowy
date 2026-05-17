const childName = "État : Expédié";
const stateMatch = childName.match(/(?:État|Etat|Statut)\s*:\s*(.*)/i);
console.log(stateMatch);
