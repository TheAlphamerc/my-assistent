import type { NextApiRequest, NextApiResponse } from "next";

import { completionStream, openAiCompletion } from "../../services/openai";
import { createEmbeddings } from "@/services/createEmbeddings";
import { ChatCompletionRequestMessageRoleEnum } from "openai";
import { pineconeClient } from "@/services/pinecone/pinecone";

type Data = {
  answer?: string | null | undefined
  extra?: any
} | {
  error?: string
}

const COSINE_SIM_THRESHOLD = 0.7

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const question = req.body.question as string;
  const namespace = req.body.trainedDoc as string;
  const persona = req.body.persona as string;
  const indexName = 'pensil-ai'

  if (!indexName) {
    return res.status(400).json({ error: "index name is not available" });
  } else if (!namespace) {
    return res.status(400).json({ error: "namespace is not available" });

  }

  if (!question) {
    return res.status(400).json({ error: "question must be a string" });
  }

  console.log({ question, namespace, indexName });


  try {
    log("\n🚥 Initiate Pinecone client");
    const client = await pineconeClient();
    log("\n🚥 Pinecone client initiated");
    const vectorOperationsApi = client.Index(indexName);

    const { meanEmbedding } = await createEmbeddings({
      text: question
    });

    const response = await vectorOperationsApi.query({
      queryRequest: {
        namespace: namespace,
        topK: 50,
        includeMetadata: true,
        includeValues: false,
        vector: meanEmbedding
      }
    });
    // console.log("\nPinecone response: ", response);
    var textString = '';
    var matches = 0;

    if (response.matches && response.matches.length > 0) {
      for (let i = 0; i < response.matches.length; i++) {
        const result = response.matches[i]
        const score = result.score ?? 0
        // @ts-ignore
        var filename = result?.metadata["filename"] ?? '';
        const fileText = '';

        const file = `File:"${filename}\n`
        // const file_string = `###\n\"${filename}\"\n\n`;
        if (score < COSINE_SIM_THRESHOLD && i > 0)
          break
        // log("🚥 Match: ", i, ': ', file);
        textString += file
        matches += 1;
      }
    } else {
      log("\n🚥 No matches found");
      return res.status(200).json({ answer: "Sorry, I don't have an answer for that." });
    }

    log("\n🚥 Filtered Pinecone matches length: ", matches);
    const messages = [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: persona ?? 'You are helpful AI assistant, designed to answer the question from given context.',
        // 'You are Pensil AI assistant, designed to answer the question about Pensil community Platform.',
      },
      // {
      //   role: ChatCompletionRequestMessageRoleEnum.System,
      //   content: 'Your goal is to provide helpful, accurate information to customers in a friendly and efficient manner from context given below.',
      // },
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: 'You should be able to quickly understand the nature of their question, and provide the best answer possible in markdown format.',
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: `Context: ${textString}`,
      },
      // {
      //   role: ChatCompletionRequestMessageRoleEnum.System,
      //   content: 'If you cannot answer, or find a relevant file, don\'t makeup answer just simply apologies and tell why can\'t you give answer',
      // },
      // {
      //   role: ChatCompletionRequestMessageRoleEnum.System,
      //   content: 'Refuse to answer any question that iss not about the given context.'
      // },
      //  {
      //   role: ChatCompletionRequestMessageRoleEnum.System,
      //   content: 'Your goal is to provide helpful, accurate information to customers in a friendly and efficient manner from context given below. You should be able to quickly understand the nature of their question or issue, and provide the best answer possible.',
      // },
      // {
      //   role: ChatCompletionRequestMessageRoleEnum.System,
      //   content: 'If you cannot answer, or find a relevant file, don\'t makeup answer just simply apologies and tell why can\'t you give answer. you can also suggest to contact at support@pensil.in',
      // },
      // {
      //   role: ChatCompletionRequestMessageRoleEnum.System,
      //   content: 'Mention the source text file name in the answer.'
      // },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Question: ${question} ?`,
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: `Answer:  ?`,
      }
    ];

    // log("\n🚥 Request: ", messages);
    const resp = await openAiCompletion({ messages });

    log("\n🚥 Response: ");
    res.status(200).json({ answer: resp.message, extra: resp.usage })
  } catch (error) {
    log("error", JSON.parse(JSON.stringify(error)));
    res.status(500).json({ extra: JSON.parse(JSON.stringify(error)) })
  }
}


/**
 * Function to log with timestamp
 * @param {string} message
 * @returns {void}
 */
function log(message?: any, ...optionalParams: any[]): void {
  console.log(`${new Date().toLocaleTimeString(
    'en-US',
    {
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }
  )} - ${message}`, ...optionalParams);
}