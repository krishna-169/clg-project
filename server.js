const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/global-search', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const campusHubSystemPrompt =
      'You are the AI assistant for a web app called "Campus Hub". ' +
      'Campus Hub helps college students with: events, jobs & internships, marketplace (buy/sell items), personal workspace (budget tracker + todo + chat), and feedback/contact. ' +
      'Answer conversationally and clearly. If the user asks about navigating to a page, describe what they can do there (Events, Jobs, Marketplace, Workspace, Feedback). ' +
      'If you do not know something, say you are not sure instead of making it up.';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: campusHubSystemPrompt,
                },
                {
                  text: '\n\nUser question: ' + message,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return res
        .status(response.status || 500)
        .json({ error: 'Gemini API request failed', details: errorText });
    }

    const data = await response.json();
    const text =
      (data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text) ||
      'No response text returned from Gemini.';

    return res.json({ text });
  } catch (err) {
    console.error('Error in /api/global-search:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
