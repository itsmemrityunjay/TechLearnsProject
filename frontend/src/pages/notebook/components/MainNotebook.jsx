import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import axios from 'axios';
import Select from "react-select";
import { FaPlay, FaSave, FaFolderOpen, FaCog, FaJs, FaPython, FaCode, FaHtml5, FaJava } from 'react-icons/fa';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { useAuth } from '../../../context/AuthContext';

const MainNotebook = ({ notebookId }) => {
    const { currentUser } = useAuth();
    const editorRef = useRef(null);

    // State for editor and notebook
    const [code, setCode] = useState('// Start coding here');
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [title, setTitle] = useState('Untitled Notebook');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [theme, setTheme] = useState('vs-dark');
    const [isPublic, setIsPublic] = useState(false);
    const [tags, setTags] = useState([]);
    const [inputFile, setInputFile] = useState('');

    // UI state
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typewriterIndex, setTypewriterIndex] = useState(0);

    // Options for language selector
    const options = [
        { value: "javascript", label: <div className="flex items-center"><FaJs className="mr-2" /> JavaScript</div> },
        { value: "python", label: <div className="flex items-center"><FaPython className="mr-2" /> Python</div> },
        { value: "cpp", label: <div className="flex items-center"><FaCode className="mr-2" /> C++</div> },
        { value: "java", label: <div className="flex items-center"><FaJava className="mr-2" /> Java</div> },
        { value: "html", label: <div className="flex items-center"><FaHtml5 className="mr-2" /> HTML</div> }
    ];

    const customStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: '#1e293b',
            borderColor: state.isFocused ? "#f99e1c" : "#475569",
            boxShadow: state.isFocused ? "0 0 0 1px #f99e1c" : "none",
            "&:hover": {
                borderColor: "#f99e1c",
            },
            color: 'white'
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "#334155" : "#1e293b",
            color: "white",
            "&:hover": {
                backgroundColor: "#334155",
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: "#1e293b",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
        }),
        singleValue: (base) => ({
            ...base,
            color: "white",
        }),
        input: (base) => ({
            ...base,
            color: "white",
        }),
    };

    // Handle editor mount
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    // Load notebook if ID exists
    useEffect(() => {
        if (notebookId) {
            fetchNotebook();
        }
    }, [notebookId]);

    // Fetch notebook from database
    const fetchNotebook = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to access this notebook');
                return;
            }

            const response = await axios.get(`/api/notebooks/${notebookId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const notebook = response.data;
            setTitle(notebook.title);
            setCode(notebook.content);
            setLanguage(notebook.language);
            setIsPublic(notebook.isPublic);
            setTags(notebook.tags || []);
            setError(null);
        } catch (err) {
            console.error('Error loading notebook:', err);
            setError('Failed to load notebook');
        } finally {
            setLoading(false);
        }
    };

    // Handle language change
    const handleLanguageChange = (selectedOption) => {
        setLanguage(selectedOption.value);
    };

    // Execute code
    const handleRun = async () => {
        setLoading(true);
        setOutput('Running code...');
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to run code');
                setOutput('Error: Authentication required to run code');
                return;
            }

            const currentCode = editorRef.current ? editorRef.current.getValue() : code;

            // For HTML, skip backend execution and just show in iframe
            if (language === 'html') {
                setOutput(currentCode);
                setLoading(false);
                return;
            }

            console.log(`Executing ${language} code (length: ${currentCode.length} chars)`);

            // Increase timeout to 30 seconds for longer executions
            const response = await axios.post('/api/execute', {
                language,
                code: currentCode,  // CHANGED: using 'code' instead of 'content' to match backend expectation
                stdin: inputFile
            }, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 30000 // 30 second timeout
            });

            console.log("Execution response:", response.data);

            // Handle the response
            if (response.data.output !== undefined) {
                setOutput(response.data.output);
            } else {
                setOutput('Code executed successfully with no output');
            }

            setSuccessMessage('Code executed successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Execution error:', err);

            let errorMessage = 'Failed to execute code';

            if (err.response?.status === 500) {
                console.error('API error details:', err.response.data);
                errorMessage = 'Server error: The code execution service encountered a problem';
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Execution timed out. Your code took too long to run.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setOutput(`Error: ${errorMessage}`);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Save notebook
    const handleSave = async () => {
        if (!currentUser) {
            setError('Please login to save your code');
            return;
        }

        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication error. Please login again.');
                return;
            }

            const currentCode = editorRef.current ? editorRef.current.getValue() : code;

            const notebookData = {
                title,
                content: currentCode,
                language,
                isPublic,
                tags
            };

            let response;

            if (notebookId) {
                // Update existing notebook
                response = await axios.put(`/api/notebooks/${notebookId}`, notebookData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccessMessage('Notebook updated successfully');
            } else {
                // Create new notebook
                response = await axios.post('/api/notebooks', notebookData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccessMessage('Notebook created successfully');
                // Set the new ID if provided
                if (response.data._id) {
                    window.history.replaceState(null, '', `/notebook/${response.data._id}`);
                }
            }

            setError(null);
        } catch (err) {
            console.error('Error saving notebook:', err);
            setError('Failed to save notebook');
        } finally {
            setSaving(false);
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    };

    // Handle code clear
    const handleDelete = () => {
        if (confirm('Are you sure you want to clear your code? This cannot be undone.')) {
            setCode('// Start coding here');
            setOutput('');
        }
    };

    // Toggle theme
    const handleThemeChange = () => {
        setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark');
    };

    // Sample code initialization
    useEffect(() => {
        if (code === '// Start coding here') {
            const sampleCode = getTemplateBySample(language);
            startTypewriter(sampleCode);
        }
    }, [language]);

    // Get language template
    const getTemplateBySample = (lang) => {
        switch (lang) {
            case 'javascript':
                return `// JavaScript Sample
function greet(name) {
  return 'Hello, ' + name;
}

console.log(greet('World'));`;
            case 'python':
                return `# Python Sample
def greet(name):
    return f"Hello, {name}"

print(greet("World"))`;
            case 'java':
                return `// Java Sample
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
            case 'cpp':
                return `// C++ Sample
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`;
            case 'html':
                return `<!DOCTYPE html>
<html>
<head>
    <title>HTML Sample</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
        }
        h1 {
            color: navy;
        }
    </style>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is a simple HTML page.</p>
</body>
</html>`;
            default:
                return `// Start coding here`;
        }
    };

    // Typewriter effect function
    const typeWriterEffect = (text, index = 0) => {
        if (index < text.length) {
            setCode((prevCode) => prevCode + text.charAt(index));
            setTypewriterIndex(index + 1);
        } else {
            setIsTyping(false);
        }
    };

    const startTypewriter = (text) => {
        setCode('');
        setIsTyping(true);
        let index = 0;
        setTypewriterIndex(index);
        const typingInterval = setInterval(() => {
            typeWriterEffect(text, index);
            index++;
            if (index >= text.length) {
                clearInterval(typingInterval);
            }
        }, 15); // Faster typing speed
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Header Section */}
            <header className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-[#012a3e] to-[#01273b] shadow-lg">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-wide">💻 TechLeaRNS Notebook</h1>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 focus:outline-none focus:border-[#f99e1c]"
                        placeholder="Notebook Title"
                    />
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-[#f99e1c] rounded-lg hover:bg-[#e08e15] shadow-md transition-all duration-300"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                                Running
                            </>
                        ) : (
                            <>
                                <FaPlay className="mr-2" /> Run
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-all duration-300"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                                Saving
                            </>
                        ) : (
                            <>
                                <FaSave className="mr-2" /> Save
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleDelete}
                        className="flex items-center px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 shadow-md transition-all duration-300"
                    >
                        <RiDeleteBin5Line className="mr-2" /> Clear
                    </button>

                    <button
                        onClick={handleThemeChange}
                        className="flex items-center px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 shadow-md transition-all duration-300"
                    >
                        <FaCog className="mr-2" /> Theme
                    </button>
                </div>
            </header>

            {/* Error/Success Messages */}
            {error && (
                <div className="bg-red-600/80 text-white px-6 py-2">
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="float-right text-white/80 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-600/80 text-white px-6 py-2">
                    {successMessage}
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-1 flex-col lg:flex-row">
                {/* Code Editor Section */}
                <section className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold">Code Editor</h2>
                            <p className="text-sm text-gray-400">Write your code below</p>
                        </div>
                        <div className="flex justify-center items-center">
                            <div className="w-64">
                                <Select
                                    options={options}
                                    onChange={handleLanguageChange}
                                    styles={customStyles}
                                    value={options.find(option => option.value === language)}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="h-[500px] bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            onChange={(value) => setCode(value)}
                            theme={theme}
                            options={{
                                minimap: { enabled: true },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                wordWrap: 'on'
                            }}
                            onMount={handleEditorDidMount}
                        />
                    </div>
                </section>

                {/* Right Panel - Input & Output */}
                <div className="w-full lg:w-1/3 flex flex-col">
                    {/* Input Section */}
                    <aside className="p-6 bg-gray-800 border-l border-gray-700">
                        <h2 className="text-lg font-semibold mb-4">Input</h2>
                        <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                            <textarea
                                className="w-full bg-gray-800 text-gray-200 p-2 rounded border border-gray-600 focus:outline-none focus:border-[#f99e1c]"
                                rows={5}
                                placeholder="Enter input for your program..."
                                value={inputFile}
                                onChange={(e) => setInputFile(e.target.value)}
                            ></textarea>
                            <p className="mt-2 text-sm text-gray-400">
                                Add input data for stdin
                            </p>
                        </div>
                    </aside>

                    {/* Output Section */}
                    <aside className="flex-1 p-6 bg-gray-800 border-l border-t border-gray-700">
                        <h2 className="text-lg font-semibold mb-4">Output</h2>
                        <div className="bg-gray-700 p-4 rounded-lg shadow-md h-[300px] overflow-auto">
                            {loading ? (
                                <div className="text-center text-[#f99e1c] flex items-center justify-center h-full">
                                    <div className="w-6 h-6 border-2 border-t-transparent border-[#f99e1c] rounded-full animate-spin mr-2"></div>
                                    Running your code...
                                </div>
                            ) : language === 'html' && output ? (
                                <iframe
                                    srcDoc={output}
                                    className="w-full h-full border-0"
                                    title="HTML Output"
                                    sandbox="allow-scripts"
                                ></iframe>
                            ) : (
                                <pre className="whitespace-pre-wrap text-sm text-gray-200">{output || 'No output yet. Run your code to see results.'}</pre>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default MainNotebook;