import { Client, Users, Storage, Query } from 'node-appwrite';

// Input JSON: { clientEmail: string, files: [{ fileId: string, name: string }] }
export default async ({ req, res, log, error }) => {
  try {
    const raw = typeof req.payload === 'string' && req.payload.length > 0 ? req.payload : (typeof req.body === 'string' ? req.body : '{}');
    const { clientEmail, files } = JSON.parse(raw);
    if (!clientEmail || !Array.isArray(files) || files.length === 0) {
      return res.json({ error: 'clientEmail and files[] required' }, 400);
    }

    const apiKey = process.env.APPWRITE_API_KEY;
    const bucketId = process.env.BUCKET_ID;
    const notaryTeamId = process.env.NOTARY_TEAM_ID;
    if (!apiKey || !bucketId || !notaryTeamId) {
      return res.json({ error: 'Function env missing: APPWRITE_API_KEY / BUCKET_ID / NOTARY_TEAM_ID' }, 500);
    }

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(apiKey);

    const users = new Users(client);
    const storage = new Storage(client);

    // Find the client userId by email
    const list = await users.list([Query.equal('email', clientEmail)]);
    const userId = list.users?.[0]?.$id;
    if (!userId) return res.json({ error: 'Client user not found' }, 404);

    const results = [];
    for (const f of files) {
      const permissions = [
        `read:user:${userId}`, // Client can read
        `read:team:${notaryTeamId}`, // Notaries can read/download
        `write:team:${notaryTeamId}`, // Notaries can write
        `update:team:${notaryTeamId}`, // Notaries can update
        `delete:team:${notaryTeamId}`, // Notaries can delete
      ];
      const updated = await storage.updateFile(bucketId, f.fileId, undefined, permissions);
      results.push({ fileId: f.fileId, ok: !!updated.$id });
    }

    return res.json({ ok: true, results });
  } catch (e) {
    error(e?.message || String(e));
    return res.json({ error: 'grant failed' }, 500);
  }
};


