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
        max_tokens: 8000,
        messages: [
          {
            role: 'system',
            content: `You are a viral content strategist for top US YouTube and Instagram creators. You write high-performing, emotionally engaging scripts that get millions of views. Your hooks are cinematic and pattern-interrupt style. Your scripts are storytelling-based with strong CTAs. Always return valid JSON only, no markdown, no extra text.`
          },
          {
            role: 'user',
            content: `Create 3 viral content ideas for a US YouTube/Instagram channel in the "${niche}" niche.

For each topic provide:
- A curiosity-driven power title
- A cinematic pattern-interrupt hook (NOT a basic question, make it emotional or shocking, 2-3 sentences)
- 3 content outline points
- A SHORT SCRIPT: exactly 70 words, fast paced, YouTube Shorts/Reels, strong CTA at end. COUNT YOUR WORDS, do not go below 70 words.
- A LONG SCRIPT: minimum 1000 words, do not stop before 1000 words, full professional YouTube video script with cinematic intro, 5 detailed sections with storytelling, examples, and powerful CTA at end. COUNT YOUR WORDS.
- 5 hashtags (mix of broad and niche)

Return ONLY this exact JSON format:
{"topics":[{"topic":"topic name","title":"power video title","hook":"cinematic 2-3 sentence hook","outline":["point 1","point 2","point 3"],"shorts":"exactly 70 word shorts script with CTA","long":"minimum 1000 word full professional YouTube script with CTA","hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5"]}]}`
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
