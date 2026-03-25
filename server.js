const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://timecube64_db_user:0555992797@cluster0.lzngg0h.mongodb.net/fingerprintDB?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Mongoose Schema & Model
const fingerprintSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  fingerprint: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const Fingerprint = mongoose.model('Fingerprint', fingerprintSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Routes

// GET all fingerprints
app.get('/api/fingerprints', async (req, res) => {
  try {
    const fingerprints = await Fingerprint.find().sort({ createdAt: -1 });
    res.json({ success: true, data: fingerprints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - add new fingerprint
app.post('/api/fingerprints', async (req, res) => {
  const { username, fingerprint } = req.body;

  if (!username || !fingerprint) {
    return res.status(400).json({ success: false, message: 'Username and fingerprint are required.' });
  }

  try {
    const newEntry = new Fingerprint({ username, fingerprint });
    await newEntry.save();
    res.status(201).json({ success: true, data: newEntry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE - remove fingerprint by ID
app.delete('/api/fingerprints/:id', async (req, res) => {
  try {
    const deleted = await Fingerprint.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Entry not found.' });
    }
    res.json({ success: true, message: 'Entry deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📱 Mobile access: Find your IP and use http://<your-ip>:${PORT}`);
});