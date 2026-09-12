const socket = io();
const chess = new Chess();
const boardElement=document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerColor = null;

const renderBoard = () => {
    const board=chess.board();
    boardElement.innerHTML = '';
    board.forEach((row, rowIndex) => {
        row.forEach((square,squareIndex) => {
            const squareElement = document.createElement('div');
            squareElement.classList.add('square',(rowIndex + squareIndex) % 2 === 0 ? 'light' : 'dark');
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;
            if (square) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', square.color === 'w' ? 'white' : 'black');
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerColor === square.color;
                pieceElement.addEventListener('dragstart', (event) => {
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        sourceSquare = {row: rowIndex, col: squareIndex};
                        event.dataTransfer.setData('text/plain', "");
                    }
                });
                pieceElement.addEventListener('dragend', () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener('dragover', (event) => {
                event.preventDefault();
            });

            squareElement.addEventListener('drop', (event) => {
                event.preventDefault(); 
                
            if(draggedPiece) {
                const targetSquare = {row: parseInt(squareElement.dataset.row), col: parseInt(squareElement.dataset.col)};
               handleMove(sourceSquare, targetSquare);
            }
             
            });

             boardElement.appendChild(squareElement);
         });
     });

     if(playerColor === 'b' ){
        boardElement.classList.add('flipped');
    }else{
        boardElement.classList.remove('flipped');
    }
     
};
const handleMove=(source, target) =>{
    const move = { from: String.fromCharCode(97 + source.col) + (8 - source.row),
    to: String.fromCharCode(97 + target.col) + (8 - target.row),
    promotion: 'q'};
    socket.emit('move', move);
};
const getPieceUnicode=(piece)=>{
    const unicodePieces = {
        'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙', // White
        'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟'  // Black
    };
    return unicodePieces[piece.type]|| '' ;
};

socket.on('playerColor', (color) => {
    playerColor = color === 'white' ? 'w' : color === 'black' ? 'b' : null;
    renderBoard();
    console.log(`You are playing as ${color}`);
});
socket.on('spectator', (color) => {
    playerColor = null;
    renderBoard();
    console.log(`You are a spectator`);
});
socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});
socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});
socket.on("invalidMove", (move) => {
    alert(`Invalid move: ${move.from} to ${move.to}`);
});
socket.on("Whitegaya", () => {
    chess.reset();
    draggedPiece = null;
    sourceSquare = null;
     playerColor = 'b';
    renderBoard();
    alert('White player disconnected. Game over.');
});
socket.on("Blackgaya", () => {
    chess.reset();
    draggedPiece = null;
    sourceSquare = null;
     playerColor = 'w';
    renderBoard();  
    alert('Black player disconnected. Game over.');
});  
renderBoard();
