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
    if (response.matches && response.matches.length > 0) {
      console.log("\n🚥 Pinecone matches length: ", response.matches.length);
      for (let i = 0; i < response.matches.length; i++) {
        const result = response.matches[i]
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
    } else {
      console.log("\n🚥 No matches found");
      res.status(200).json({ answer: "Sorry, I don't have an answer for that." });
      return;
    }

    const messages = [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: 'I want you to act as a document that I am having a conversation with. Your name is "AI Assistant"',
      }, {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: 'You will provide me with answers from the given info. If the answer is not included, say exactly "Hmm, I am not sure." and stop after that'
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: 'Refuse to answer any question not about the context given below.'
      },
      //  {
      //   role: ChatCompletionRequestMessageRoleEnum.System,
      //   content: 'Your goal is to provide helpful, accurate information to customers in a friendly and efficient manner from context given below. You should be able to quickly understand the nature of their question or issue, and provide the best answer possible.',
      // },
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: `Context: ${textString}`,
      },
      // {
      //   role: ChatCompletionRequestMessageRoleEnum.System,
      //   content: 'If you cannot answer, or find a relevant file, don\'t makeup answer just simply apologies and tell why can\'t you give answer. ou can also suggest to contact at support@pensil.in',
      // },
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: 'Mention the source text file name in the answer.'
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