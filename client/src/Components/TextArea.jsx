import React, { useState, useRef } from "react";
import SharePopup from "./SharePopup";
import SplashScreen from "./SplashScreen";

const Textarea = ({ initialCode }) => {
  const filename = "temp_script.py";
  const [code, setCode] = useState(initialCode || 'print("Code With CodePy!!!")\n');

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [showShare, setShowShare] = useState(false);


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
      const response = await fetch(
        `${process.env.REACT_APP_BASE_API_URL}/run`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, input }),
        }
      );

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
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans grid grid-rows-[auto_1fr_auto] gap-6">
      <SplashScreen/>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Python Compiler</h1>
        <button
          onClick={runCode}
          disabled={loading}
          className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-md ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Running..." : "Run Code"}
        </button>
      </div>
      <SharePopup
        visible={showShare}
        onClose={() => setShowShare(false)}
        code={code}
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold text-white-400 mb-1 pl-1">
              {filename}
            </div>

            <div className="relative w-full h-64 font-mono text-sm rounded-xl overflow-hidden border border-gray-700 shadow-sm">
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
                      dangerouslySetInnerHTML={{
                        __html: htmlLine || "\u00A0",
                      }}
                    />
                  );
                })}
              </pre>

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
                spellCheck="false"
              />
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Provide input (if needed)..."
            className="w-full h-28 p-4 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {output && (
            <button
              onClick={() => setShowShare(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md"
            >
              Share
            </button>
          )}
        </div>

        <div className="w-full h-full">
          <div
            className={`w-full h-full p-4 bg-black rounded-xl border border-gray-700 font-mono text-sm whitespace-pre-wrap min-h-[100px] shadow-sm overflow-y-auto max-h-[500px] ${
              /(Error|Traceback|Exception)/.test(output || "")
                ? "text-red-500"
                : "text-green-400"
            }`}
          >
            {output}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Textarea;
