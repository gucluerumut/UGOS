import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export default async function handler(req, res) {
  try {
    const { deviceId, prefix } = req.query || {};

    const region = process.env.AWS_REGION;
    const bucket = process.env.S3_BUCKET;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const endpoint = process.env.S3_ENDPOINT; // optional for R2/MinIO

    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      return res.status(500).json({ error: "S3 environment variables are not configured" });
    }

    const s3 = new S3Client({
      region,
      endpoint: endpoint || undefined,
      credentials: { accessKeyId, secretAccessKey },
    });

    const effectivePrefix = prefix || (deviceId ? `backups/${deviceId}/` : "backups/");

    const command = new ListObjectsV2Command({ Bucket: bucket, Prefix: effectivePrefix });
    const resp = await s3.send(command);

    const items = (resp.Contents || []).map((o) => ({
      key: o.Key,
      size: o.Size,
      lastModified: o.LastModified,
    }));

    // Sort descending by lastModified
    items.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    return res.status(200).json({ items });
  } catch (err) {
    console.error("List error:", err);
    return res.status(500).json({ error: "Failed to list backups" });
  }
}