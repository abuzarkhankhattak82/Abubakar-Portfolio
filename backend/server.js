const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Path to the data file
const DATA_FILE = path.join(__dirname, 'data', 'portfolio.json');

// Helper to read data
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading data file:', error);
    return {
      name: 'Muhammad Abubakar',
      institute: 'Aleena Institute of Medical Sciences',
      bio: 'A passionate healthcare professional...',
      certificates: [
        'Community Action For Disaster Response',
        'Basic Community Safety Online Training',
        'Certificate of Achievement',
        'Dispenser & Pharmacy Technician'
      ],
      degreeYear: '2025'
    };
  }
}

// Helper to write data
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// API routes
app.get('/api/portfolio', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/api/portfolio', (req, res) => {
  const newData = req.body;
  // Validate required fields (optional)
  if (!newData.name || !newData.institute || !newData.bio || !newData.certificates || !Array.isArray(newData.certificates)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }
  writeData(newData);
  res.json({ message: 'Portfolio updated successfully', data: newData });
});

// Fallback: serve index.html for any other route (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
