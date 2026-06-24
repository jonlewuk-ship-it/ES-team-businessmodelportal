// A dedicated, independent HTTP storage bucket for the ES TEAM portal
const KV_BUCKET_URL = "https://kvdb.io/K99b6BBN2x58pC6SUpXN9U/acca_es_workspaces";

// Default pre-seeded markets tailored specifically for the ES/LATAM division
const defaultMarkets = [
  {name:"España", city:"Madrid", code:"es", img:"https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200", url:"https://collaborative-bmc.vercel.app/canvas/nfb5e8rhmzpv0b704d514oxnohw8dwz8", custom:false},
  {name:"Argentina", city:"Buenos Aires", code:"ar", img:"https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1200", url:"#", custom:false},
  {name:"México", city:"CDMX", code:"mx", img:"https://images.unsplash.com/photo-1512813583145-baaa340ef29f?w=1200", url:"#", custom:false}
];

export default async function handler(request, response) {
  try {
    const { method } = request;

    // --- GET: FETCH ES WORKSPACES ---
    if (method === 'GET') {
      const res = await fetch(KV_BUCKET_URL);
      
      if (res.status === 404) {
        await fetch(KV_BUCKET_URL, {
          method: 'POST',
          body: JSON.stringify(defaultMarkets)
        });
        return response.status(200).json(defaultMarkets);
      }

      const data = await res.json();
      return response.status(200).json(data);
    }

    // --- POST: ADD NEW ES WORKSPACE ---
    if (method === 'POST') {
      const newWorkspace = request.body;
      const getRes = await fetch(KV_BUCKET_URL);
      let currentData = getRes.status === 200 ? await getRes.json() : defaultMarkets;

      currentData.push(newWorkspace);
      
      await fetch(KV_BUCKET_URL, {
        method: 'POST',
        body: JSON.stringify(currentData)
      });
      return response.status(200).json(currentData);
    }

    // --- DELETE: REMOVE ES WORKSPACE ---
    if (method === 'DELETE') {
      const { index } = request.query;
      const getRes = await fetch(KV_BUCKET_URL);
      let currentData = getRes.status === 200 ? await getRes.json() : defaultMarkets;

      if (index !== undefined) {
        currentData.splice(parseInt(index, 10), 1);
        await fetch(KV_BUCKET_URL, {
          method: 'POST',
          body: JSON.stringify(currentData)
        });
      }
      return response.status(200).json(currentData);
    }

    return response.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
