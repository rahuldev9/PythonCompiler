const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
    const command = containsInputFunction ? `python ${codeFileName} < ${inputFileName}` : `python ${codeFileName}`;

    exec(command, (error, stdout, stderr) => {
        if (error || stderr) {
            const errorMessage = (stderr || error.message).replace(codeFilePath, codeFileName);
            return res.json({ error: errorMessage });
        }
        res.json({ output: stdout });
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
