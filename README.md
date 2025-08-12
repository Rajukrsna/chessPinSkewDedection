# Chess Pins & Skewers Detection System

A full-stack application that analyzes chess games in PGN format to detect tactical motifs like pins and skewers using Stockfish engine and python-chess library.

## Features

- 🔍 **Tactical Analysis**: Detects pins and skewers in chess games
- 📊 **Classification**: Categorizes tactics as executed, missed, or allowed
- 🎨 **Modern UI**: React frontend with drag-and-drop file upload
- ⚡ **FastAPI Backend**: High-performance Python backend with chess engine integration
- 📈 **Visual Results**: Clean, organized display of analysis results

## Tech Stack

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **React Icons** for professional iconography
- Drag-and-drop file upload

### Backend
- **FastAPI** for API development
- **Python-chess** for chess game analysis
- **Stockfish** chess engine for move evaluation
- **CORS** support for frontend integration

## Project Structure

```
chess/
├── src/                    # React frontend
│   ├── App.jsx
│   ├── ChessAnalyzer.jsx
│   ├── main.jsx
│   └── index.css
├── backend/                # Python backend
│   ├── main.py            # FastAPI application
│   ├── detect_pins_skewers.py  # Chess analysis logic
│   ├── games.pgn          # Sample chess games
│   ├── requirements.txt
│   └── README.md
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Stockfish chess engine

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set Stockfish path (optional)
export STOCKFISH_PATH=/path/to/stockfish

# Start FastAPI server
uvicorn main:app --reload
```

### Stockfish Installation
1. Download Stockfish from [stockfishchess.org](https://stockfishchess.org/download/)
2. Extract to your preferred location
3. Update the path in `detect_pins_skewers.py` or set `STOCKFISH_PATH` environment variable

## Usage

1. Start both frontend (`npm run dev`) and backend (`uvicorn main:app --reload`)
2. Open http://localhost:5173 in your browser
3. Upload a PGN file using drag-and-drop or file picker
4. Click "Analyze Games" to process the chess games
5. View results showing executed, missed, and allowed tactical motifs

## Analysis Categories

- **Executed**: Tactics that were successfully played in the game
- **Missed**: Opportunities that could have been played but weren't
- **Allowed**: Tactics that the opponent could execute due to the move played

## Sample Output

```json
{
  "game_1": {
    "executed": [
      {"move_number": 16, "tactic": "pin"},
      {"move_number": 24, "tactic": "skewer"}
    ],
    "missed": [
      {"move_number": 12, "tactic": "pin"}
    ],
    "allowed": [
      {"move_number": 18, "tactic": "skewer"}
    ]
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License

## Author

Rajukrsna - Chess enthusiast and developer
