var TIME_PER_FRAME = 33; //this equates to 30 fps

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

document.addEventListener("mouseup", Game_MouseUp, false);
document.addEventListener("mousemove", Game_MouseMove, false);


var g_scale = 3.0;
var g_width = 408;
var g_height = 408;
var g_ox = 4;
var g_oy = 4;

var Team = {
    white: 0,
    black: 1
}

var MoveType = {
    closed: -1,
    open: 0,
    attack: 1,
    check: 3,
    upgrade: 4,
};

var PieceType = {
    empty: 0,
    pawn: 1,
    knight: 2,
    bishop: 3,
    rook: 4,
    queen: 5,
    king: 6,
};

var g_bsize = 8;
var g_piece_count = g_bsize * 4;
var g_tsize = 16;

var GRID_EMPTY = -1;

function Grid() {
    this.size = g_bsize;
    this.m = new Array();

    this.clear = function() {
        for (i = 0; i < this.size * this.size; i++) {
            this.m[i] = GRID_EMPTY;
        }
    }

    this.get = function(x, y) {
        if (x < 0 || y < 0 || x >= this.size || y >= this.size) {
            return -1;
        }
        return this.m[x + y * this.size];
    }

    this.set = function(x, y, v) {
        if (x < 0 || y < 0 || x >= this.size || y >= this.size) {
            return;
        }

        this.m[x + y * this.size] = v;
    }
}

function Piece(x, y) {
    this.type = PieceType.none;
    this.moved = false;
    this.team = Team.white;

    this.moves = new Grid();
    this.moves.clear();

    this.x = x;
    this.y = y;
}


var g_imagePaths = ["img/tileset.png"];


var g_assetsLoaded = 0;
var g_images = new Array();
var g_assetsTotal = g_imagePaths.length;

var g_selectedX = -1;
var g_selectedY = -1;
var g_mouseX = 0;
var g_mouseY = 0;

var g_turn = Team.black;
var g_check = [0, 0];
var g_board = new Grid();
var g_pieces = new Array();


Game_Start();

var g_loop = setInterval(Game_Loop, TIME_PER_FRAME);


function Game_MouseMove(event) {

    var x = event.x;
    var y = event.y;

    x -= g_canvas.offsetLeft;
    y -= g_canvas.offsetTop;

    x /= g_scale;
    y /= g_scale;

    g_mouseX = x;
    g_mouseY = y;
}


function Game_MouseUp(event) {
    var x = event.x;
    var y = event.y;

    x -= g_canvas.offsetLeft;
    y -= g_canvas.offsetTop;

    x /= g_scale;
    y /= g_scale;

    var tx = Math.floor((x - g_ox) / g_tsize);
    var ty = Math.floor((y - g_oy) / g_tsize);

    console.log("x: " + x + " y: " + y);

    if (g_selectedX == -1) {
        if (g_board.get(tx, ty) != GRID_EMPTY) {
            var pieceIndex = g_board.get(tx, ty);


            if (g_pieces[pieceIndex].team == g_turn) {
                if (g_check[g_pieces[pieceIndex].team] == 1) {
                    if (g_pieces[pieceIndex].type == PieceType.king) {
                        g_selectedX = tx;
                        g_selectedY = ty;
                    }
                } else {
                    g_selectedX = tx;
                    g_selectedY = ty;
                }
            }
        }
    } else {
        if (!(tx == g_selectedX && ty == g_selectedY)) {
            var pieceIndex = g_board.get(g_selectedX, g_selectedY);

            var move = g_pieces[pieceIndex].moves.get(tx, ty);
            if (move != MoveType.closed) {

                if (move == MoveType.upgrade) {
                    g_pieces[pieceIndex].type = PieceType.queen;
                } else if (move == MoveType.attack) {
                    g_board.get(tx, ty).type = PieceType.none;

                }

                g_board.set(tx, ty, g_board.get(g_selectedX, g_selectedY));
                g_board.set(g_selectedX, g_selectedY, -1);

                g_pieces[pieceIndex].moved = true;
                g_pieces[pieceIndex].x = tx;
                g_pieces[pieceIndex].y = ty;

                g_selectedX = -1;
                g_selectedY = -1;

                Game_ChangeTurn();
            }
        } else {
            g_selectedX = -1;
            g_selectedY = -1;
        }

    }
}


function Game_Loaded() {
    if (g_assetsLoaded == g_assetsTotal) {
        return true;
    } else {
        return false;
    }
}

function Game_AssetLoadHandler() {
    g_assetsLoaded += 1;
}


function Game_Loop() {
    Game_ClearCanvas();

    if (Game_Loaded()) {
        Game_Tick();
        Game_Draw();
    }
}

function Game_Reset() {
    g_selectedX = -1;
    g_selectedY = -1;

    g_board.clear();

    for (var i = 0; i < g_piece_count; i++) {
        var y = Math.floor(i / g_bsize);

        if (y >= 2) {
            y += 4;
        }

        var x = i % g_bsize;
        g_pieces[i] = new Piece(x, y);
        g_board.set(x, y, i);
    }


    /* white pieces */
    g_pieces[0].type = PieceType.rook;
    g_pieces[1].type = PieceType.knight;
    g_pieces[2].type = PieceType.bishop;
    g_pieces[3].type = PieceType.queen;
    g_pieces[4].type = PieceType.king;
    g_pieces[5].type = PieceType.bishop;
    g_pieces[6].type = PieceType.knight;
    g_pieces[7].type = PieceType.rook;

    for (var i = 0; i < g_board.size; i++) {
        g_pieces[8 + i].type = PieceType.pawn;
    }


    /* black pieces */
    for (var i = 0; i < g_bsize; i++) {
        g_pieces[i + g_board.size * 2].type = PieceType.pawn;
        g_pieces[i + g_board.size * 2].team = Team.black;
    }

    g_pieces[0 + g_board.size * 3].type = PieceType.rook;
    g_pieces[1 + g_board.size * 3].type = PieceType.knight;
    g_pieces[2 + g_board.size * 3].type = PieceType.bishop
    g_pieces[3 + g_board.size * 3].type = PieceType.queen;
    g_pieces[4 + g_board.size * 3].type = PieceType.king;
    g_pieces[5 + g_board.size * 3].type = PieceType.bishop;
    g_pieces[6 + g_board.size * 3].type = PieceType.knight;
    g_pieces[7 + g_board.size * 3].type = PieceType.rook;

    for (var i = 0; i < g_bsize; i++) {
        g_pieces[i + g_board.size * 3].team = Team.black;
    }

    g_turn = Team.black;
    Game_ChangeTurn();

}

function Game_Start() {
    g_ctx.imageSmoothingEnabled = false;

    for (var i = 0; i < g_assetsTotal; i++) {
        g_images[i] = new Image();
        g_images[i].ready = false;
        g_images[i].onload = Game_AssetLoadHandler;
        g_images[i].src = g_imagePaths[i];
    }

    Game_Reset();
}

function Game_ChangeTurn() {
  var turn_field = document.getElementById("turn-field");

    if (g_turn == Team.white) {
        g_turn = Team.black;

        turn_field.innerHTML = "Black Turn";
        turn_field.className = "turn-field-black";
    } else {
        g_turn = Team.white;
        turn_field.innerHTML = "White Turn";
        turn_field.className = "turn-field-white";
    }


    Game_CalculateMoves();
}

function Game_CalculateMoves() {
    for (var i = 0; i < g_piece_count; i++) {
        g_pieces[i].moves.clear();

        if (g_pieces[i].type == PieceType.none) {
            continue;
        }

        var x = g_pieces[i].x;
        var y = g_pieces[i].y;

        if (g_pieces[i].type == PieceType.pawn) {
            var forward = 1;

            if (g_pieces[i].team == Team.black) {
                forward = -1;
            }

            /* movement */
            if (g_board.get(x, y + forward) == GRID_EMPTY) {
                /* reward queen for reaching edge of board */
                if (y + forward == 0 || y + forward == g_board.size - 1) {
                    g_pieces[i].moves.set(x, y + forward, MoveType.upgrade)
                } else {
                    g_pieces[i].moves.set(x, y + forward, MoveType.open)
                }

                if (!g_pieces[i].moved && g_board.get(x, y + forward * 2) == GRID_EMPTY) {
                    g_pieces[i].moves.set(x, y + forward * 2, MoveType.open)
                }
            }

            /* attacking */
            if (g_board.get(x + 1, y + forward) != GRID_EMPTY) {
                if (g_pieces[g_board.get(x + 1, y + forward)].team != g_pieces[i].team) {
                    g_pieces[i].moves.set(x + 1, y + forward, MoveType.attack)
                }
            }
            if (g_board.get(x - 1, y + forward) != GRID_EMPTY) {
                if (g_pieces[g_board.get(x - 1, y + forward)].team != g_pieces[i].team) {
                    g_pieces[i].moves.set(x - 1, y + forward, MoveType.attack)
                }
            }
        }

        if (g_pieces[i].type == PieceType.king) {
            /* all four diagonal directions around piece */
            for (var d = 0; d < 4; d++) {
                var dx, dy;
                if (d == 0) {
                    dx = 1;
                    dy = 1;
                }
                if (d == 1) {
                    dx = -1;
                    dy = 1;
                }
                if (d == 2) {
                    dx = -1;
                    dy = -1;
                }
                if (d == 3) {
                    dx = 1;
                    dy = -1;
                }

                var sx = x + dx;
                var sy = y + dy;

                /* diagonal */
                if (sx < g_board.size && sx >= 0 && sy < g_board.size && sy >= 0) {
                    if (g_board.get(sx, sy) == GRID_EMPTY) {
                        g_pieces[i].moves.set(sx, sy, MoveType.open);
                    } else if (g_pieces[g_board.get(sx, sy)].team != g_pieces[i].team) {
                        g_pieces[i].moves.set(sx, sy, MoveType.attack);
                    }
                }

                /* horizontal */
                if (sx < g_board.size && sx >= 0) {
                    if (g_board.get(sx, y) == GRID_EMPTY) {
                        g_pieces[i].moves.set(sx, y, MoveType.open);
                    } else if (g_pieces[g_board.get(sx, y)].team != g_pieces[i].team) {
                        g_pieces[i].moves.set(sx, y, MoveType.attack);
                    }
                }


                /* vertical */
                if (sy < g_board.size && sy >= 0) {
                    if (g_board.get(x, sy) == GRID_EMPTY) {
                        g_pieces[i].moves.set(x, sy, MoveType.open);
                    } else if (g_pieces[g_board.get(x, sy)].team != g_pieces[i].team) {
                        g_pieces[i].moves.set(x, sy, MoveType.attack);
                    }
                }
            }
        }


        if (g_pieces[i].type == PieceType.bishop || g_pieces[i].type == PieceType.queen) {
            /* all four diagonal directions around piece */
            for (var d = 0; d < 4; d++) {
                var dx, dy;
                if (d == 0) {
                    dx = 1;
                    dy = 1;
                }
                if (d == 1) {
                    dx = -1;
                    dy = 1;
                }
                if (d == 2) {
                    dx = -1;
                    dy = -1;
                }
                if (d == 3) {
                    dx = 1;
                    dy = -1;
                }

                var sx = x + dx;
                var sy = y + dy;

                while (sx < g_board.size && sy < g_board.size && sx >= 0 && sy >= 0) {
                    if (g_board.get(sx, sy) == GRID_EMPTY) {
                        g_pieces[i].moves.set(sx, sy, MoveType.open)
                    } else {
                        if (g_pieces[g_board.get(sx, sy)].team != g_pieces[i].team) {
                            g_pieces[i].moves.set(sx, sy, MoveType.attack)
                        }

                        break;
                    }

                    sx += dx;
                    sy += dy;
                }
            }
        }

        if (g_pieces[i].type == PieceType.rook || g_pieces[i].type == PieceType.queen) {
            /* all four directions around piece */
            for (var d = 0; d < 4; d++) {
                var dx, dy;
                if (d == 0) {
                    dx = 1;
                    dy = 0;
                }
                if (d == 1) {
                    dx = -1;
                    dy = 0;
                }
                if (d == 2) {
                    dx = 0;
                    dy = 1;
                }
                if (d == 3) {
                    dx = 0;
                    dy = -1;
                }

                var sx = x + dx;
                var sy = y + dy;

                while (sx < g_board.size && sy < g_board.size && sx >= 0 && sy >= 0) {
                    if (g_board.get(sx, sy) == GRID_EMPTY) {
                        g_pieces[i].moves.set(sx, sy, MoveType.open)
                    } else {
                        if (g_pieces[g_board.get(sx, sy)].team != g_pieces[i].team) {
                            g_pieces[i].moves.set(sx, sy, MoveType.attack)
                        }
                        break;
                    }

                    sx += dx;
                    sy += dy;
                }
            }
        }


        /*
       ==o=o==
       =o===o=
       ===X===
       =o===o=
       ==o=o==
       */

        if (g_pieces[i].type == PieceType.knight) {
            /* rotate through quadrants around piece */
            for (var d = 0; d < 4; d++) {
                var dx, dy;
                if (d == 0) {
                    dx = 1;
                    dy = 1;
                }
                if (d == 1) {
                    dx = -1;
                    dy = 1;
                }
                if (d == 2) {
                    dx = -1;
                    dy = -1;
                }
                if (d == 3) {
                    dx = 1;
                    dy = -1;
                }

                /* two possible moves per quadrant (transpositions) */
                for (var j = 0; j < 2; j++) {
                    var sx = 2;
                    var sy = 1;

                    if (j == 1) {
                        sx = 1;
                        sy = 2;
                    }

                    sx *= dx;
                    sy *= dy;

                    sx += x;
                    sy += y;

                    if (g_board.get(sx, sy) == GRID_EMPTY) {
                        g_pieces[i].moves.set(sx, sy, MoveType.open)
                    } else {
                        if (g_pieces[g_board.get(sx, sy)].team != g_pieces[i].team) {
                            g_pieces[i].moves.set(sx, sy, MoveType.attack)
                        }
                    }
                }
            }
        }
    }

    g_check = [0, 0];

    /* find check */
    for (var i = 0; i < g_piece_count; i++) {
        if (g_pieces[i].type == PieceType.king) {
            var cx = g_pieces[i].x;
            var cy = g_pieces[i].y;

            /* check and see if any pieces are attacking the king */
            for (var j = 0; j < g_piece_count; j++) {
                var move = g_pieces[j].moves.get(cx, cy);

                if (move == MoveType.attack) {
                    g_pieces[j].moves.set(cx, cy, MoveType.check);
                    g_check[g_pieces[i].team] = 1
                }
            }
        }
    }
}


function Game_ClearCanvas() {
    g_ctx.fillStyle = '#7E0603';

    g_ctx.beginPath();
    g_ctx.rect(0, 0, g_width, g_height);
    g_ctx.closePath();

    g_ctx.fill();
}


function Game_Tick() {

}


function Game_Draw() {
    g_ctx.scale(g_scale, g_scale);

    g_ctx.strokeStyle = "#000000";
    g_ctx.strokeWidth = 2;
    g_ctx.beginPath();
    g_ctx.rect(g_ox, g_oy, g_bsize * g_tsize, g_bsize * g_tsize);
    g_ctx.closePath();
    g_ctx.stroke();


    /* draw game board */
    for (var y = 0; y < g_bsize; y++) {
        for (var x = 0; x < g_bsize; x++) {
            var tile = (y % 2) == 1;

            if (x % 2 == 0) {
                tile = !tile;
            }

            g_ctx.drawImage(g_images[0], 0, g_tsize * tile, g_tsize, g_tsize, g_ox + x *

                g_tsize, g_oy + y * g_tsize, g_tsize, g_tsize);

            var pieceIndex = g_board.get(x, y);

            /* debug piece movement */

            if (g_selectedX != -1) {
                var movePieceIndex = g_board.get(g_selectedX, g_selectedY);

                var move = g_pieces[movePieceIndex].moves.get(x, y)

                if (move != MoveType.closed) {

                    if (move == MoveType.open) {
                        g_ctx.strokeStyle = "#FFFFFF";
                    } else if (move == MoveType.attack) {
                        g_ctx.strokeStyle = "#FFFF00";
                    } else if (move == MoveType.check) {
                        g_ctx.strokeStyle = "#FF0000";
                    }

                    g_ctx.strokeWidth = 1;
                    g_ctx.beginPath();
                    g_ctx.rect(g_ox + (x * g_tsize), g_oy + (y * g_tsize), g_tsize, g_tsize);
                    g_ctx.closePath();
                    g_ctx.stroke();
                }
            }
        }
    }

    /* draw pieces on top */
    for (var y = 0; y < g_bsize; y++) {
        for (var x = 0; x < g_bsize; x++) {
            var pieceIndex = g_board.get(x, y);

            if (pieceIndex != -1) {
                var piece = g_pieces[pieceIndex].type;
                var team = g_pieces[pieceIndex].team;

                var dx = g_ox + x * g_tsize;
                var dy = g_oy + y * g_tsize;

                if (x == g_selectedX && y == g_selectedY) {
                    dx = g_mouseX - g_tsize / 2;
                    dy = g_mouseY - g_tsize / 2;
                } else {
                    if (piece == PieceType.king && g_check[g_turn]) {
                        g_ctx.strokeStyle = "#FF0000";

                        g_ctx.strokeWidth = 1;
                        g_ctx.beginPath();
                        g_ctx.rect(g_ox + (x * g_tsize), g_oy + (y * g_tsize), g_tsize, g_tsize);
                        g_ctx.closePath();
                        g_ctx.stroke();
                    }


                }

                g_ctx.drawImage(g_images[0], g_tsize * piece, g_tsize * team, g_tsize, g_tsize, dx, dy, g_tsize, g_tsize);
            }
        }
    }


    g_ctx.scale(1.0 / g_scale, 1.0 / g_scale);

}
