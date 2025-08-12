import chess
import chess.pgn
import chess.engine
import json
import os
from collections import defaultdict


def detect_pins(board, color):
    pins = []
    king_square = board.king(color)
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece and piece.color == color and piece.piece_type != chess.KING:
            if board.is_pinned(color, square):
                pins.append({
                    "square": chess.square_name(square),
                    "piece": piece.symbol(),
                    "pinned_to": chess.square_name(king_square)
                })
    return pins

def pin_set(board, color):
    # Unique signature per pinned piece square
    return {chess.square_name(item["square"]) if isinstance(item["square"], int) else item["square"] for item in (
        {"square": chess.parse_square(p["square"]) if isinstance(p["square"], str) else p["square"]} or p for p in detect_pins(board, color)
    )}



# Improved skewer detection: only count true skewers (front piece can move and expose rear piece to capture)
def detect_skewers(board, attacker_color):
    skewers = []
    sliding_types = [chess.BISHOP, chess.ROOK, chess.QUEEN]
    high_value = {chess.QUEEN: 9, chess.ROOK: 5, chess.BISHOP: 3, chess.KNIGHT: 3, chess.PAWN: 1}
    # Directions as (df, dr)
    directions = [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)]
    already_reported = set()
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece and piece.color == attacker_color and piece.piece_type in sliding_types:
            for df, dr in directions:
                ray = []
                f = chess.square_file(square)
                r = chess.square_rank(square)
                while True:
                    f += df
                    r += dr
                    if not (0 <= f < 8 and 0 <= r < 8):
                        break
                    sq = chess.square(f, r)
                    target_piece = board.piece_at(sq)
                    if target_piece:
                        ray.append((sq, target_piece))
                        if len(ray) == 2:
                            first, second = ray
                            # Both must be enemy pieces
                            if (first[1].color != attacker_color and second[1].color != attacker_color):
                                # First must be higher value than second
                                if high_value.get(first[1].piece_type, 0) > high_value.get(second[1].piece_type, 0):
                                    # Check if the sliding piece attacks the front piece
                                    if board.is_attacked_by(attacker_color, first[0]):
                                        # Simulate moving the front piece away
                                        legal_skewer = False
                                        # Generate legal moves for the front piece's color without mutating original board
                                        sim_board = board.copy(stack=False)
                                        sim_board.turn = first[1].color
                                        for move in sim_board.legal_moves:
                                            if move.from_square == first[0]:
                                                sim_board.push(move)
                                                # After moving, is the rear piece attacked by the sliding piece?
                                                if sim_board.is_attacked_by(attacker_color, second[0]):
                                                    legal_skewer = True
                                                    sim_board.pop()
                                                    break
                                                sim_board.pop()
                                        if legal_skewer:
                                            # Avoid double-counting
                                            key = (square, first[0], second[0])
                                            if key not in already_reported:
                                                skewers.append({
                                                    "from": chess.square_name(square),
                                                    "front": chess.square_name(first[0]),
                                                    "behind": chess.square_name(second[0]),
                                                    "piece": piece.symbol(),
                                                    "front_piece": first[1].symbol(),
                                                    "behind_piece": second[1].symbol()
                                                })
                                                already_reported.add(key)
                            break
                        elif len(ray) > 2:
                            break
    return skewers

def skewer_set(board, color):
    # Unique signature per (from, front, behind)
    out = set()
    for s in detect_skewers(board, color):
        out.add((s["from"], s["front"], s["behind"]))
    return out

def analyze_pgn(pgn_path):
    stockfish_path = os.getenv("STOCKFISH_PATH", "D:/stockfish/stockfish-windows-x86-64-avx2.exe")
    engine = chess.engine.SimpleEngine.popen_uci(stockfish_path)
    results = {}
    try:
        with open(pgn_path) as pgn:
            for game_idx in range(1, 6):
                game = chess.pgn.read_game(pgn)
                if not game:
                    break
                board = game.board()
                executed, missed, allowed = [], [], []
                move_number = 1
                for move in game.mainline_moves():
                    moving_color = board.turn
                    opponent_color = not moving_color

                    # Before state snapshots
                    pins_before_set = pin_set(board, moving_color)
                    skewers_before_set = skewer_set(board, moving_color)
                    opp_pins_before = pin_set(board, opponent_color)
                    opp_skewers_before = skewer_set(board, opponent_color)

                    # Engine best move
                    info = engine.analyse(board, chess.engine.Limit(depth=10))
                    pv = info.get("pv", [])
                    best_move = pv[0] if pv else None

                    # Missed
                    if best_move and best_move != move and best_move in board.legal_moves:
                        b_best = board.copy(stack=False)
                        b_best.push(best_move)
                        pins_best_set = pin_set(b_best, moving_color)
                        skewers_best_set = skewer_set(b_best, moving_color)
                        if len(pins_best_set - pins_before_set) > 0:
                            missed.append({"move_number": move_number, "tactic": "pin"})
                        if len(skewers_best_set - skewers_before_set) > 0:
                            missed.append({"move_number": move_number, "tactic": "skewer"})

                    # Play actual move
                    board.push(move)

                    # Executed (newly created only)
                    pins_after_set = pin_set(board, moving_color)
                    skewers_after_set = skewer_set(board, moving_color)
                    if len(pins_after_set - pins_before_set) > 0:
                        executed.append({"move_number": move_number, "tactic": "pin"})
                    if len(skewers_after_set - skewers_before_set) > 0:
                        executed.append({"move_number": move_number, "tactic": "skewer"})

                    # Allowed (opponent gained new opportunities due to the move)
                    opp_pins_after = pin_set(board, opponent_color)
                    opp_skewers_after = skewer_set(board, opponent_color)
                    if len(opp_pins_after - opp_pins_before) > 0:
                        allowed.append({"move_number": move_number, "tactic": "pin"})
                    if len(opp_skewers_after - opp_skewers_before) > 0:
                        allowed.append({"move_number": move_number, "tactic": "skewer"})

                    move_number += 1
                results[f"game_{game_idx}"] = {
                    "executed": executed,
                    "missed": missed,
                    "allowed": allowed
                }
    finally:
        engine.quit()
    return results
