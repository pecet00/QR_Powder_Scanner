const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
require("dotenv").config();

const app = express();
const port = 20240;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB
});

db.connect((err) => {
  if (err) {
    console.error('Cannot connect to DB', err);
  } else {
    console.log('Connected to DB');
  }
});

app.post('/save', (req, res) => {
  const data = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).send("Invalid data format. Expected an array.");
  }

  const query = 'INSERT INTO qr_data (Printer, Powder_ID) VALUES ?';
  const values = data.map(item => [item.printer, item.powder]);

  db.query(query, [values], (err, results) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).send('DB Error');
    }

    res.status(200).send('All data saved successfully!');
  });
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.listen(port, () => {
  console.log("Sinterit QR Scanner, by Filip Koszut")
  console.log(`port:${port}`);

});