import { Client, Storage, Query } from 'node-appwrite';

const CHUNK_SIZE = 100;

function isOlderThanRetention(isoString, retentionDays) {
  try {
    const created = new Date(isoString).getTime();
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    return created < cutoff;
  } catch {
    return false;
  }
}

function matchesAnyPrefix(name, prefixes) {
  return prefixes.some((p) => typeof name === 'string' && name.startsWith(p));
}

export default async ({ req, res, log, error }) => {
  try {
    const {
      APPWRITE_ENDPOINT,
      APPWRITE_PROJECT_ID,
      APPWRITE_API_KEY,
      STORAGE_RETENTION_API_KEY,
      APPWRITE_BUCKET_ID,
      RETENTION_DAYS = '7',
      PREFIX_CLIENT_UPLOADS = 'client-uploads/',
      PREFIX_NOTARIZED = 'notarized-docs/',
      DRY_RUN = 'false'
    } = process.env;

    const effectiveApiKey = STORAGE_RETENTION_API_KEY || APPWRITE_API_KEY;
    const missing = [];
    if (!APPWRITE_ENDPOINT) missing.push('APPWRITE_ENDPOINT');
    if (!APPWRITE_PROJECT_ID) missing.push('APPWRITE_PROJECT_ID');
    if (!effectiveApiKey) missing.push('STORAGE_RETENTION_API_KEY or APPWRITE_API_KEY');
    if (!APPWRITE_BUCKET_ID) missing.push('APPWRITE_BUCKET_ID');
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Respect 0 as a valid value; only fallback to 7 when undefined or NaN
    const parsedRetention = Number(RETENTION_DAYS);
    const retentionDays = Number.isFinite(parsedRetention) && !Number.isNaN(parsedRetention) ? parsedRetention : 7;
    const dryRun = String(DRY_RUN).toLowerCase() === 'true';
    const prefixes = [PREFIX_CLIENT_UPLOADS, PREFIX_NOTARIZED];

    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(effectiveApiKey);

    const storage = new Storage(client);

    let totalExamined = 0;
    let totalDeleted = 0;
    let cursor = undefined;

    while (true) {
      const queries = [Query.limit(CHUNK_SIZE)];
      if (cursor) queries.push(Query.cursorAfter(cursor));
      const filesResponse = await storage.listFiles(APPWRITE_BUCKET_ID, queries);
      const files = filesResponse.files || [];

      if (!Array.isArray(files) || files.length === 0) break;

      for (const f of files) {
        totalExamined += 1;
        const fileId = f.$id || f.id;
        const name = f.name || '';
        const createdAt = f.$createdAt || f.createdAt;

        const inScope = matchesAnyPrefix(name, prefixes);
        const expired = isOlderThanRetention(createdAt, retentionDays);

        if (inScope && expired) {
          if (dryRun) {
            log(`[DRY_RUN] Would delete: ${name} (${fileId}), createdAt=${createdAt}`);
          } else {
            try {
              await storage.deleteFile(APPWRITE_BUCKET_ID, fileId);
              totalDeleted += 1;
              log(`Deleted: ${name} (${fileId}), createdAt=${createdAt}`);
            } catch (e) {
              error(`Delete failed for ${name} (${fileId}): ${e?.message || e}`);
            }
          }
        }
      }

      if (files.length < CHUNK_SIZE) break;
      const last = files[files.length - 1];
      cursor = last?.$id || last?.id;
      if (!cursor) break;
    }

    const summary = { ok: true, examined: totalExamined, deleted: totalDeleted, retentionDays, dryRun };
    log(JSON.stringify(summary));
    return res.json(summary);
  } catch (e) {
    const payload = { ok: false, error: e?.message || String(e) };
    error(payload.error);
    return res.json(payload, 500);
  }
};


