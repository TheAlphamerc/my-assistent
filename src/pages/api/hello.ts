// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { setCookie } from '@/lib/cookies'
import { createEmbeddings } from '@/services/createEmbeddings'
import { completion, openAiCompletion } from '@/services/openai'
import { fetchFromPinecone, getIndexesList, getPineconeIndex, pineconeClient, queryPinecone } from '@/services/pinecone/pinecone'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'

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
  const indexName = 'pensil-ai'

  if (!indexName) {
    res.status(400).json({ error: "index name is not available" });
    return;
  } else if (!namespace) {
    res.status(400).json({ error: "namespace is not available" });
    return;
  }

  if (!question) {
    res.status(400).json({ error: "question must be a string" });
    return;
  }

  console.log({ question, namespace, indexName });


  const client = await pineconeClient();
  try {
    const vectorOperationsApi = client.Index(indexName);
    const { meanEmbedding } = await createEmbeddings({
      text: question
    });

    const response = await vectorOperationsApi.query({
      queryRequest: {
        namespace: namespace,
        topK: 10,
        includeMetadata: true,
        includeValues: false,
        vector: meanEmbedding
      }
    });
    // console.log("\nPinecone response: ", response);
    var textString = '';
    if (response.matches) {
      console.log("\n🚥 Pinecone matches length: ", response.matches.length);
      for (let i = 0; i < response.matches.length; i++) {
        const result = response.matches[i]
        const fileChunkId = result.id
        const score = result.score ?? 0
        // @ts-ignore
        var filename = result?.metadata["filename"] ?? '';
        const fileText = '';

        const file = `###\nFile:"${filename}\n`
        // const file_string = `###\n\"${filename}\"\n\n`;
        if (score < COSINE_SIM_THRESHOLD && i > 0)
          break
        console.log("\n🚥 Match: ", i, ': ', file);
        textString += file
      }
    }


    const prompt =
      `You are Pensil AI assistant, designed to answer the question about Pensil community Platform.\n` +
      `You can answer questions about Pensil and its features by giving Answer to the question based on the context given below.\n\n` +
      `Context: ${textString} \n\n` +
      `Try to answer answer the question from given context as concisely as possible,\n` +
      `If you cannot answer, or find a relevant file, then simply apologies and tell why can't you give answer .\n` +
      `You can also suggest to contact at support@pensil.in. \n\n` +
      `Question: ${question} ?\n` +
      `Answer (in markdown):`

    const messages = [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: 'You are a Pensil chatbot designed to assist customers with any questions or concerns they may have about our Pensil community Platform.',
      }, {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: 'Your goal is to provide helpful, accurate information to customers in a friendly and efficient manner from context given below. You should be able to quickly understand the nature of their question or issue, and provide the best answer possible.',
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: `Context: ${textString}`,
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: 'If you cannot answer, or find a relevant file, don\'t makeup answer just simply apologies and tell why can\'t you give answer. ou can also suggest to contact at support@pensil.in',
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: 'Don\'t mention the source text file name in the answer.'
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Question: ${question} ?`,
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: `Answer : ${question} ?`,
      }
    ];
    const resp = await openAiCompletion({ messages });


    res.status(200).json({ answer: resp.message, extra: resp.usage })
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ extra: error })
  }
}