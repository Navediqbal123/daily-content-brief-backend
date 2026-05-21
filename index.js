const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/generate', async (req, res) => {
  const { niche } = req.body;

  if (!niche) {
    return res.status(400).json({ error: 'Niche is required' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `You are a content strategist for a US-focused YouTube/Instagram channel in the "${niche}" niche.

Generate 3 highly engaging content ideas for today related to "${niche}" that would perform well for a US audience.

Return ONLY this JSON format, no extra text, no markdown:
{"topics":[{"topic":"topic name","title":"YouTube video title","hook":"First 3 seconds script hook","outline":["point 1","point 2","point 3"],"shorts":"30 second shorts script","hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5"]}]}`
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));
    const text = data.choices?.[0]?.message?.content;

    if (!text) return res.status(500).json({ error: 'No response from AI' });

    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
