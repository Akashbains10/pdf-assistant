const express = require('express');
const OpenAI = require('openai');
const upload = require('../storage');
const { initVectorStore } = require('../vector');
const { Queue } = require('bullmq');

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const queue = new Queue('read-pdf', {
  connection: {
    host: 'redis', // replace this with env if not using docker
    port: process.env.REDIS_PORT || 6379,
  },
});

// ================= Upload PDF =================
router.post('/upload', upload.single('file'), async (req, res) => {
  const counts = await queue.getJobCounts();
  console.log('Current job counts:', counts);

  await queue.add('add-pdf', JSON.stringify({
    originalname: req.file.originalname,
    filename: req.file.filename,
    destination: req.file.destination,
    path: req.file.path,
  }));

  res.json({ filePath: `/uploads/${req.file.filename}` });
});

// ================= Chat with PDF =================
router.get('/chat', async (req, res) => {
  try {
    const query = req.query.message;

    const vectorStore = await initVectorStore();
    const retriever = vectorStore.asRetriever({ k: 2 });
    const result = await retriever.invoke(query);

    const systemPrompt = `
      You are a helpful assistant. Use the provided PDF file context 
      to answer the user query as accurately as possible. If the answer 
      is not in the context, say you don't know instead of making things up.
      
      Context:
      ${JSON.stringify(result)}
    `;

    const assistantResponse = await client.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
    });

    return res.json({
      message: assistantResponse.choices[0].message.content,
      docs: result,
    });
  } catch (err) {
    console.error('Error in /chat:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
