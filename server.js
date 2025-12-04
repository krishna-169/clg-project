const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API endpoint removed - AI functionality now handled client-side via Puter.js
// This reduces server dependencies and provides direct AI access to users

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
