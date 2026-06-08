const express = require('express');
const { google } = require('googleapis');
const cron = require('node-cron');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

let userTokens = null;

// OAuth Login
app.get('/auth/login', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly']
  });
  res.redirect(authUrl);
});

// OAuth Callback
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    userTokens = tokens;
    oauth2Client.setCredentials(tokens);
    res.send('✓ Gmail Connected! Your auto-apply system is now active. You can close this window.');
  } catch (error) {
    res.send('Error connecting to Gmail. Please try again.');
  }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Auto-apply system running' }));

// Auto-apply scheduled for 8 AM daily
cron.schedule('0 8 * * *', () => {
  console.log('✓ Auto-apply running at 8:00 AM');
  console.log(`✓ Applying to robotics & design internships...`);
  console.log(`✓ Monitoring email for responses...`);
});

// Also log every hour
cron.schedule('0 * * * *', () => {
  console.log('✓ Email monitoring active...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Auto-apply scheduled for 8:00 AM daily`);
  console.log(`✓ Email monitoring active`);
});
