import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    // Accept both GET with query params and POST with JSON body
    const params = method === "POST" ? req.body : req.query;
    const { op = "put", key, contentType = "application/json" } = params || {};

    if (!key) {
      return res.status(400).json({ error: "Missing 'key' parameter" });
    }

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

    let command;
    if (op === "put") {
      command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
    } else if (op === "get") {
      command = new GetObjectCommand({ Bucket: bucket, Key: key });
    } else {
      return res.status(400).json({ error: "Invalid 'op' parameter. Use 'put' or 'get'." });
    }

    const url = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 minutes
    return res.status(200).json({ url });
  } catch (err) {
    console.error("Presign error:", err);
    return res.status(500).json({ error: "Failed to presign URL" });
  }
}