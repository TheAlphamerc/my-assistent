import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable"; // to handle file uploads

import { TextEmbedding } from "../../types/file";
import extractTextFromFile from "../../services/extractTextFromFile";
import { createEmbeddings } from "../../services/createEmbeddings";
import { pineconeClient } from "@/services/pinecone/pinecone";

// Disable the default body parser to handle file uploads
export const config = { api: { bodyParser: false } };

type Data = {
  text?: string;
  meanEmbedding?: number[];
  chunks?: TextEmbedding[];
  error?: string;
};

// This function receives a file as a multipart form and returns the text extracted fom the file and the OpenAI embedding for that text
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Create a formidable instance to parse the request as a multipart form
  const form = new formidable.IncomingForm();
  // @ts-ignore
  form.maxFileSize = 30 * 1024 * 1024; // Set the max file size to 30MB

  try {
    const { fields, files } = await new Promise<{
      fields: Fields;
      files: Files;
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
        } else {
          resolve({ fields, files } as { fields: Fields; files: Files });
        }
      });
    });
    const file = files.file;
    if (!file || Array.isArray(file) || file.size === 0) {
      res.status(400).json({ error: "Invalid or missing file" });
      return;
    }

    const text = await extractTextFromFile({
      filepath: file.filepath,
      filetype: file.mimetype ?? "",
    });

    const { meanEmbedding, chunks } = await createEmbeddings({
      text,
    });

    var vector = [];
    for (var i = 0; i < chunks.length; i++) {
      vector.push({
        id: file.filepath
      });
    }

    const pinecone = await pineconeClient();
    const index = pinecone.Index("pensil-ai");
    const upsertResponse = await index.upsert({
      upsertRequest: {
        vectors: [
          {
            id: "vec1",
            values: [0.1, 0.2, 0.3, 0.4],
            metadata: {
              genre: "drama",
            },
          },
          {
            id: "vec2",
            values: [0.1, 0.2, 0.3, 0.4],
            metadata: {
              genre: "comedy",
            },
          },
        ],
        namespace: "example-namespace",
      },
    });


    res.status(200).json({ text, meanEmbedding, chunks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  } finally {
    // Always send a response, even if it is empty
    res.end();
  }
}
