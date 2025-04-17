const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");
require('dotenv').config();
const app = express();
app.use(cors({
    origin: `${process.env.FRONTEND_URL}`, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
  }));
app.use(bodyParser.json());
console.log(process.env.FRONTEND_URL)
const codeStorage = {}; 


app.post("/run", (req, res) => {
  const { code, input } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided!" });
  }

  const codeFileName = "temp_script.py";
  const inputFileName = "temp_input.txt";
  const codeFilePath = path.join(__dirname, codeFileName);
  const inputFilePath = path.join(__dirname, inputFileName);

  fs.writeFileSync(codeFilePath, code);
  fs.writeFileSync(inputFilePath, input || "");

  const containsInputFunction = /input\s*\(/.test(code);
  const command = containsInputFunction
    ? `python ${codeFileName} < ${inputFileName}`
    : `python ${codeFileName}`;

  exec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      const errorMessage = (stderr || error.message).replace(codeFilePath, codeFileName);
      return res.json({ error: errorMessage });
    }
    res.json({ output: stdout });
  });
});


app.post("/save", (req, res) => {
  const { code } = req.body;
  console.log(codeStorage)
  if (!code) {
    return res.status(400).json({ error: "No code provided!" });
  }

  const id = nanoid(8); 
  codeStorage[id] = code;
  res.json({ id });
});

app.get("/code/:id", (req, res) => {
  const code = codeStorage[req.params.id];

  if (!code) {
    return res.status(404).json({ error: "Code not found." });
  }

  res.json({ code });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
