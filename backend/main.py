

import sys
import asyncio
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from detect_pins_skewers import analyze_pgn

# Fix for Windows asyncio subprocess issue
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())


app = FastAPI()

# Allow CORS for all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_games(pgn_file: UploadFile = File(...)):
    temp_path = f"temp_{pgn_file.filename}"
    print(temp_path)
    with open(temp_path, "wb") as f:
        f.write(await pgn_file.read())
    result = analyze_pgn(temp_path)
    os.remove(temp_path)
    return JSONResponse(content=result)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
