require('dotenv').config();
const { Worker } = require('bullmq');
const { initVectorStore } = require('./vector');
const { CharacterTextSplitter } = require("@langchain/textsplitters");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");


const worker = new Worker(
  "read-pdf",
  async (job) => {
    try {
      const jobData = JSON.parse(job.data);
      const vectorStore = await initVectorStore();

      if (!jobData?.path) {
        throw new Error("No PDF path provided in job data");
      }
      const pdfLoader = new PDFLoader(jobData?.path);
      const pdfData = await pdfLoader.load();

      const textSplitter = new CharacterTextSplitter({
        chunkSize: 300,
        chunkOverlap: 0,
      });

      const texts = await textSplitter.splitDocuments(pdfData);
      await vectorStore.addDocuments(texts);
      console.log("PDF processed and added to vector store");

      return { success: true, pages: pdfData.length };
    } catch (err) {
      console.error("Error processing job:", err.message);
      throw err;
    }
  },
  {
    connection: {
      host: "redis",
      port: 6379,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});
