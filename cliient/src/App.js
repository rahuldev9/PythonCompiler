import React, { useState, useRef } from "react";

function App() {
  const filename = "temp_script.py";
  const [code, setCode] = useState(
    'print("Python Life!")\n'
  );
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);

  const textareaRef = useRef(null);
  const ghostRef = useRef(null);

  const PYTHON_KEYWORDS = [
    "def",
    "return",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "break",
    "continue",
    "pass",
    "class",
    "import",
    "from",
    "as",
    "try",
    "except",
    "finally",
    "raise",
    "with",
    "lambda",
    "global",
    "nonlocal",
    "assert",
    "yield",
    "del",
    "in",
    "is",
    "not",
    "and",
    "or",
    "True",
    "False",
    "None",
    "print",
    "input",
  ];

  const escapeHTML = (str) =>
    str.replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );

  const runCode = async () => {
    setLoading(true);
    setOutput("Running...");

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_API_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, input }),
      });

      const data = await response.json();
      setOutput(data.output || data.error);
    } catch (error) {
      setOutput("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentLine = () => {
    const textarea = textareaRef.current;
    const pos = textarea.selectionStart;
    const beforeCursor = textarea.value.substring(0, pos);
    const line = beforeCursor.split("\n").length - 1;
    setCurrentLine(line);
  };

  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    // Comment/uncomment selected lines
    if (e.key === "/" && e.ctrlKey) {
      e.preventDefault();
      const lines = value.substring(start, end).split("\n");
      const commented = lines.map((line) =>
        line.trim().startsWith("#") ? line.replace(/^\s*#/, "") : "# " + line
      );
      const before = value.substring(0, start);
      const after = value.substring(end);
      const newCode = before + commented.join("\n") + after;
      setCode(newCode);
      return;
    }

    // Handle Enter key with indentation
    if (e.key === "Enter") {
      const before = value.substring(0, start);
      const after = value.substring(end);
      const lines = before.split("\n");
      const lastLine = lines[lines.length - 1];

      let indent = "";
      const match = lastLine.match(/^(\s*)/);
      if (match) indent = match[1];
      if (lastLine.trim().endsWith(":")) indent += "    ";

      e.preventDefault();
      const newCode = before + "\n" + indent + after;
      setCode(newCode);
      setTimeout(() => {
        const pos = start + 1 + indent.length;
        textarea.selectionStart = textarea.selectionEnd = pos;
        updateCurrentLine();
      }, 0);
      return;
    }

    // Auto-close brackets/quotes
    const pairs = { "(": ")", "{": "}", "[": "]", '"': '"', "'": "'" };
    if (pairs[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const closing = pairs[e.key];
      const newCode =
        value.slice(0, start) + e.key + closing + value.slice(end);
      setCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-400">
          🔥 Python Online Compiler
        </h1>
        <button
          onClick={runCode}
          className={`px-5 py-2 rounded-md font-medium transition-all duration-200 ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
          disabled={loading}
        >
          {loading ? "Running..." : "Run Code"}
        </button>
      </div>

      <div className="text-left text-sm font-semibold text-yellow-400 mb-1 pl-1">
        {filename}
      </div>

      {/* Code Editor */}
      <div className="relative w-full h-64 mb-4 font-mono text-sm rounded-lg overflow-hidden border border-gray-700">
        {/* Line Numbers */}
        <div className="absolute top-0 left-0 h-full bg-gray-800 text-gray-400 px-2 py-2 text-right select-none z-10">
          {code.split("\n").map((_, i) => (
            <div
              key={i}
              className={`h-5 leading-5 ${
                i === currentLine ? "text-white" : ""
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Ghost Layer */}
        <pre
          ref={ghostRef}
          className="absolute top-0 left-10 right-0 bottom-0 p-2 text-white whitespace-pre-wrap break-words overflow-hidden bg-transparent z-0 pointer-events-none"
          aria-hidden="true"
        >
          {code.split("\n").map((line, i) => {
            const htmlLine = escapeHTML(line).replace(
              new RegExp(`\\b(${PYTHON_KEYWORDS.join("|")})\\b`, "g"),
              '<span class="keyword">$1</span>'
            );
            return (
              <div
                key={i}
                className={`h-5 leading-5 ${
                  i === currentLine ? "bg-gray-700 rounded-sm" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: htmlLine || "\u00A0" }}
              />
            );
          })}
        </pre>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onClick={updateCurrentLine}
          onKeyUp={updateCurrentLine}
          onKeyDown={handleKeyDown}
          onScroll={(e) => {
            ghostRef.current.scrollTop = e.target.scrollTop;
          }}
          placeholder="Write your Python code here..."
          className="absolute top-0 left-10 right-0 bottom-0 p-2 bg-transparent text-white resize-none focus:outline-none z-10"
          style={{ lineHeight: "1.25rem" }}
        />
      </div>

      {/* Input Area */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Provide input (if needed)..."
        className="w-full h-28 p-4 mb-4 rounded-lg bg-gray-800 border border-gray-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div
        className={`w-full p-4 bg-black rounded-lg border border-gray-700 font-mono text-sm whitespace-pre-wrap min-h-[100px] ${
          /(Error|Traceback|Exception)/.test(output || "")
            ? "text-red-500"
            : "text-green-400"
        }`}
      >
        {output}
      </div>
    </div>
  );
}

export default App;
