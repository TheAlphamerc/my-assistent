import { PineconeClient } from "@pinecone-database/pinecone";
import { VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";

const pinecone = new PineconeClient();

export async function pineconeClient() {
    await pinecone.init({
        environment: process.env.PINECONE_ENV as string,
        apiKey: process.env.PINECONE_API_KEY as string,
    });
    return pinecone;
}

export async function createPineconeIndex(pinecone: PineconeClient, indexName: string) {
    const index = await pinecone.createIndex({
        createRequest: {
            name: indexName,
            dimension: 1536,
        },
    });
    return index;
}
export async function getPineconeIndex(pinecone: PineconeClient, indexName: string) {
    const index = pinecone.Index(indexName);
    return index;

}
export async function getIndexesList() {
    const indexesList = await pinecone.listIndexes();
    return indexesList;
}

export async function fetchFromPinecone(index: VectorOperationsApi, id: string, namespace: string) {
    const fetchResponse = await index.fetch({
        ids: [id],
        namespace: namespace,
    });
    return fetchResponse;
}

export async function queryPinecone(index: VectorOperationsApi, vector: number[], namespace: string) {
    const queryResponse = await index.query({
        queryRequest: {
            namespace: namespace,
            topK: 10,
            includeMetadata: true,
            includeValues: true,
            vector: vector,
        }
    });
    return queryResponse;
}

export async function deletePineconeIndex(pinecone: PineconeClient, indexName: string) {
    await pinecone.deleteIndex({
        indexName: indexName,
    });
}