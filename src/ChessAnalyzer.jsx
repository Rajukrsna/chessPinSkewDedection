import React, { useState } from "react";
import { 
  FaChessKnight, 
  FaUpload, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaTimes,
  FaSearch,
  FaFileUpload,
  
} from 'react-icons/fa';
import { 
  MdPushPin, 
  MdGpsFixed, 
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function ChessAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.pgn')) {
      setFile(selectedFile);
      setResult(null);
      setError("");
    } else {
      setError("Please select a valid PGN file");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.pgn')) {
      setFile(droppedFile);
      setResult(null);
      setError("");
    } else {
      setError("Please drop a valid PGN file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("pgn_file", file);
    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to analyze PGN file");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTacticColor = (type) => {
    switch(type) {
      case 'executed': return 'text-green-700 bg-green-50 border-green-200';
      case 'missed': return 'text-red-700 bg-red-50 border-red-200';
      case 'allowed': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getTacticIcon = (tactic) => {
    return tactic === 'pin' ? <MdPushPin className="inline" /> : <MdGpsFixed className="inline" />;
  };

  const getTotalCount = (data, type) => {
    return Object.values(data).reduce((sum, game) => sum + game[type].length, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <FaChessKnight className="mr-3 text-blue-600" />
            Chess Tactics Analyzer
          </h1>
          <p className="text-gray-600">Detect pins and skewers in your chess games</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pgn"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {file ? (
                  <div className="text-green-600">
                    <FaCheckCircle className="text-4xl mb-2 mx-auto" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">Click to choose a different file</p>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <FaFileUpload className="text-4xl mb-2 mx-auto" />
                    <p className="font-medium">Drop your PGN file here or click to browse</p>
                    <p className="text-sm">Supports .pgn files only</p>
                  </div>
                )}
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <AiOutlineLoading3Quarters className="animate-spin h-5 w-5 mr-2" />
                  Analyzing Chess Games...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FaSearch className="mr-2" />
                  Analyze Games
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-xl mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{getTotalCount(result, 'executed')}</div>
                <div className="text-sm text-gray-600">Executed Tactics</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{getTotalCount(result, 'missed')}</div>
                <div className="text-sm text-gray-600">Missed Opportunities</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{getTotalCount(result, 'allowed')}</div>
                <div className="text-sm text-gray-600">Allowed Tactics</div>
              </div>
            </div>

            {/* Game Results */}
            {Object.entries(result).map(([game, data]) => (
              <div key={game} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gray-800 text-white px-6 py-4">
                  <h3 className="text-xl font-semibold">{game.replace("_", " ").toUpperCase()}</h3>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['executed', 'missed', 'allowed'].map((type) => (
                      <div key={type} className={`border rounded-lg p-4 ${getTacticColor(type)}`}>
                        <h4 className="font-semibold text-lg mb-3 capitalize flex items-center">
                          <span className="mr-2">
                            {type === 'executed' ? <FaCheckCircle /> : type === 'missed' ? <FaTimes /> : <FaExclamationTriangle />}
                          </span>
                          {type} ({data[type].length})
                        </h4>
                        
                        {data[type].length === 0 ? (
                          <p className="text-gray-500 italic">No tactics found</p>
                        ) : (
                          <div className="space-y-2">
                            {data[type].map((item, idx) => (
                              <div key={idx} className="bg-white rounded px-3 py-2 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Move {item.move_number}</span>
                                  <span className="flex items-center">
                                    {getTacticIcon(item.tactic)}
                                    <span className="ml-1 capitalize">{item.tactic}</span>
                                  </span>
                                </div>
                                {item.piece && (
                                  <div className="text-gray-600 text-xs mt-1">
                                    Piece: {item.piece}
                                    {item.target && ` → ${item.target}`}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
