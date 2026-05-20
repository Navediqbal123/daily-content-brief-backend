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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools: [{ google_search: {} }],
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are a content strategist for a US-focused YouTube/Instagram channel in the "${niche}" niche. Search for today's top 3 trending topics in the US related to "${niche}". Return ONLY this JSON format, no extra text, no markdown: {"topics":[{"topic":"topic name","title":"YouTube video title","hook":"First 3 seconds script hook","outline":["point 1","point 2","point 3"],"shorts":"30 second shorts script","hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5"]}]}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

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
