const { PineconeStore } = require("@langchain/pinecone");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { Pinecone: PineconeClient } = require("@pinecone-database/pinecone");

const initVectorStore = async () => {

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY
  });

  const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY
  });

  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
    namespace: "pdf-assistant",
  });
  return vectorStore;
};

module.exports = { initVectorStore };
