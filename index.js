const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the MenuItem schema directly in index.js
const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true }
});

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

// POST /menu endpoint
app.post('/menu', async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).send(menuItem);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// GET /menu endpoint
app.get('/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({});
    res.status(200).send(menuItems);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// PUT /menu/:id endpoint
app.put('/menu/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!menuItem) {
      return res.status(404).send({ error: 'MenuItem not found' });
    }
    res.send(menuItem);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// DELETE /menu/:id endpoint
app.delete('/menu/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).send({ error: 'MenuItem not found' });
    }
    res.send({ message: 'MenuItem deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
