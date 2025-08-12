# Chess Pins and Skewers Detection Backend

This FastAPI backend analyzes chess games in PGN format to detect pins and skewers using Stockfish and python-chess.

## Files
- `main.py`: FastAPI app with `/analyze` endpoint for PGN upload and analysis.
- `detect_pins_skewers.py`: Logic for detecting pins/skewers and classifying them as executed, missed, or allowed.
- `requirements.txt`: Python dependencies.
- `games.pgn`: Place your 5 sample games here.

## Setup
1. Install Python 3.8+ and [Stockfish](https://stockfishchess.org/download/). Ensure `stockfish` is in your PATH or update the path in `detect_pins_skewers.py`.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend:
   ```bash
   uvicorn main:app --reload
   ```

## Usage
- POST a PGN file to `/analyze` endpoint.
- Returns JSON with detected pins/skewers for each game.

## Example Output
```
{
  "game_1": {
    "executed": [ ... ],
    "missed": [ ... ],
    "allowed": [ ... ]
  },
  ...
}
```

## Notes
- Make sure Stockfish is installed and accessible.
- You can use any 5 PGN games for testing.
