import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const DarkModeToggle = ({ darkMode, toggleDarkMode }) => {
    const [isFullScreen, setIsFullScreen] = useState(window.innerWidth > 768);

    useEffect(() => {
        const handleResize = () => {
            setIsFullScreen(window.innerWidth > 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <motion.button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                darkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <span className="text-xl">
                {darkMode ? "☀" : "🌙"}
            </span>
            {isFullScreen && (
                <span className="font-semibold">
                    {darkMode ? "Light Mode" : "Dark Mode"}
                </span>
            )}
        </motion.button>
    );
};

const API_BASE = process.env.REACT_APP_API_URL;

const Search = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");
    const [selectedId, setSelectedId] = useState(null);
    const [sort, setSort] = useState("Relevance");
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        return JSON.parse(localStorage.getItem("darkMode")) || false;
    });

    useEffect(() => {
        localStorage.setItem("darkMode", JSON.stringify(darkMode)); 
    }, [darkMode]);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const handleSearch = async () => {
        if (!query.trim()) {  
            setError("Please enter a search query.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await axios.post("${API_BASE}/api/search/", { query });
            setResults(response.data);
        } catch (err) {
            setError("Failed to fetch results. Please try again.");
            console.error(err);
        }
        setLoading(false);
    };


    const fetchSearchHistory = async () => {
        try {
            const response = await axios.get("${API_BASE}/api/history/");
            setHistory(response.data);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
        setShowHistory(!showHistory); 
    };

    const clearHistory = async () => {
        try {
            await axios.delete("${API_BASE}/api/history/"); 
            setHistory([]);
        } catch (error) {
            console.error("Error clearing history:", error);
        }
        setShowHistory(false);
    };
    const filteredResults = results.filter((item) => {
        if (filter === "All") return true;
        return item.source === filter; // Exact match for source
    });

    const sortedResults = [...filteredResults].sort((a, b) => {
        if (sort === "Date") {
            const dateA = new Date(a.date || "1970-01-01");
            const dateB = new Date(b.date || "1970-01-01");
            return dateB - dateA; // Newest first
        } else if (sort === "Relevance") {
            // For relevance, we'll sort by source first (Google results first)
            // and then by title length (shorter titles are often more relevant)
            if (a.source === b.source) {
                return a.title.length - b.title.length;
            }
            return a.source === "Google" ? -1 : 1;
        }
        return 0;
    });

    return (
        <div className={`min-h-screen w-full transition-colors duration-300 ${darkMode ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <motion.h1 
                        className="text-4xl font-bold mb-4 md:mb-0 text-center md:text-left"
                        animate={{ 
                            scale: [1, 1.1, 1],
                            transition: { duration: 2, repeat: Infinity }
                        }}
                    >
                        AI Search Tool
                    </motion.h1>
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={fetchSearchHistory}
                            className={`px-4 py-2 rounded-xl shadow-lg font-semibold transition-all flex items-center gap-2 ${
                                darkMode 
                                    ? "bg-gray-700 hover:bg-gray-600 text-white" 
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="text-xl">
                                {showHistory ? "📚" : "📖"}
                            </span>
                            <span className="hidden sm:inline">
                                {showHistory ? "Hide History" : "View History"}
                            </span>
                            <span className="sm:hidden">
                                {showHistory ? "Hide" : "History"}
                            </span>
                        </motion.button>
                        <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                    </div>
                </div>

                {/* History Section */}
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`mb-8 p-6 rounded-xl shadow-lg ${
                            darkMode ? "bg-gray-800" : "bg-white"
                        }`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className={`text-xl font-semibold ${
                                darkMode ? "text-white" : "text-gray-900"
                            }`}>
                                Recent Searches
                            </h2>
                            <motion.button
                                onClick={clearHistory}
                                className={`px-3 py-1 rounded-lg text-sm ${
                                    darkMode 
                                        ? "bg-red-600 hover:bg-red-700 text-white" 
                                        : "bg-red-500 hover:bg-red-600 text-white"
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Clear All
                            </motion.button>
                        </div>
                        {history.length === 0 ? (
                            <p className={`text-center py-4 ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                            }`}>
                                No search history yet
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {history.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                                            darkMode 
                                                ? "hover:bg-gray-700" 
                                                : "hover:bg-gray-100"
                                        }`}
                                        onClick={() => {
                                            setQuery(item.query);
                                            setShowHistory(false);
                                            handleSearch();
                                        }}
                                    >
                                        <p className={`font-medium ${
                                            darkMode ? "text-white" : "text-gray-900"
                                        }`}>
                                            {item.query}
                                        </p>
                                        <p className={`text-sm ${
                                            darkMode ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                            {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Search Section */}
                <div className="max-w-3xl mx-auto mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <motion.input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search AI Trends, Tech News, etc..."
                            className={`w-full p-4 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                                darkMode 
                                    ? "bg-gray-800 text-white placeholder-gray-400" 
                                    : "bg-white text-gray-900 placeholder-gray-500"
                            }`}
                            whileFocus={{ scale: 1.02 }}
                        />
                        <motion.button
                            onClick={handleSearch}
                            className={`w-full sm:w-auto px-6 py-4 rounded-xl shadow-lg font-semibold transition-all ${
                                darkMode 
                                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Search
                        </motion.button>
                    </div>
                </div>

                {/* Filter and Sort Section */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                    <select 
                        className={`p-3 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                            darkMode 
                                ? "bg-gray-800 text-white" 
                                : "bg-white text-gray-900"
                        }`}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="All">All Sources</option>
                        <option value="Google">Google</option>
                        <option value="YouTube">YouTube</option>
                    </select>

                    <select 
                        className={`p-3 rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                            darkMode 
                                ? "bg-gray-800 text-white" 
                                : "bg-white text-gray-900"
                        }`}
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="Relevance">Sort by Relevance</option>
                        <option value="Date">Sort by Date (Newest First)</option>
                    </select>
                </div>

                {/* Status Messages */}
                {loading && (
                    <div className="text-center mb-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-blue-500">Loading results...</p>
                    </div>
                )}
                {error && (
                    <div className="text-center mb-4">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}

                {/* Results Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedResults.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className={`text-xl ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                No results found. Try a different search query.
                            </p>
                        </div>
                    ) : (
                        sortedResults.map((item) => (
                            <motion.div
                                key={item.link}
                                layoutId={item.link}
                                className={`rounded-xl shadow-lg overflow-hidden transition-all ${
                                    darkMode 
                                        ? "bg-gray-800 hover:bg-gray-700" 
                                        : "bg-white hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedId(item)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {item.thumbnail && (
                                    <div className="relative w-full h-48 overflow-hidden">
                                        <img 
                                            src={item.thumbnail} 
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/400x200?text=No+Image";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>
                                )}
                                <div className="p-6">
                                    <h2 className={`text-xl font-semibold mb-2 ${
                                        darkMode ? "text-white" : "text-gray-900"
                                    }`}>
                                        {item.title}
                                    </h2>
                                    <p className={`mb-4 ${
                                        darkMode ? "text-gray-300" : "text-gray-600"
                                    }`}>
                                        {item.description}
                                    </p>
                                    <p className={`text-sm ${
                                        darkMode ? "text-gray-400" : "text-gray-500"
                                    }`}>
                                        {item.source} | {item.date}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Modal for Selected Result */}
                <AnimatePresence>
                    {selectedId && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                            onClick={() => setSelectedId(null)}
                        >
                            <motion.div 
                                className={`w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden ${
                                    darkMode ? "bg-gray-800" : "bg-white"
                                }`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                {selectedId.thumbnail && (
                                    <div className="relative w-full h-64 overflow-hidden">
                                        <img 
                                            src={selectedId.thumbnail} 
                                            alt={selectedId.title}
                                            className="w-full h-full object-cover"
                                            loading="eager"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/800x400?text=No+Image";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                    </div>
                                )}
                                <div className="p-8">
                                    <h2 className={`text-2xl font-bold mb-4 ${
                                        darkMode ? "text-white" : "text-gray-900"
                                    }`}>
                                        {selectedId.title}
                                    </h2>
                                    <p className={`mb-6 ${
                                        darkMode ? "text-gray-300" : "text-gray-600"
                                    }`}>
                                        {selectedId.description}
                                    </p>
                                    <p className={`text-sm mb-6 ${
                                        darkMode ? "text-gray-400" : "text-gray-500"
                                    }`}>
                                        {selectedId.source} | {selectedId.date}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <a 
                                            href={selectedId.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className={`font-semibold hover:underline ${
                                                darkMode ? "text-blue-400" : "text-blue-600"
                                            }`}
                                        >
                                            View More →
                                        </a>
                                        <motion.button
                                            onClick={() => setSelectedId(null)}
                                            className={`px-4 py-2 rounded-lg font-semibold ${
                                                darkMode 
                                                    ? "bg-red-600 hover:bg-red-700 text-white" 
                                                    : "bg-red-500 hover:bg-red-600 text-white"
                                            }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Close
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Search;
