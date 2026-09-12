const express= require('express');
const socket=require('socket.io');  
const http=require('http');
const{Chess}= require('chess.js');
const path=require('path');

const app= express();

const server= http.createServer(app);
const io= socket(server);

const chess= new Chess();
const initialFen= chess.fen();

let players={};
let currentPlayer='white';

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index',{title: 'Chess Game'});
});

io.on("connection", (uniqueSocket) => {
    console.log('New client connected'); 
    if(!players.white){
        players.white= uniqueSocket.id;
        uniqueSocket.emit('playerColor', 'white');
    }
    else if(!players.black){
        players.black= uniqueSocket.id;
        uniqueSocket.emit('playerColor', 'black');
    }else{
        players.spectator= uniqueSocket.id;
        uniqueSocket.emit('spectator', 'spectator');
    }
    uniqueSocket.on("disconnect", () => {
        if(players.white===uniqueSocket.id){
            delete players.white;
            chess.reset();
            io.emit('Whitegaya');
        }else if(players.black===uniqueSocket.id){
            delete players.black;
            chess.reset();
            io.emit('Blackgaya');
        }
    });
    uniqueSocket.on("move", (move) => {
        try{ if(chess.turn()==='w' && uniqueSocket.id!==players.white)return;   
            if(chess.turn()==='b' && uniqueSocket.id!==players.black) return;{
            const result= chess.move(move);
            if(result){
                currentPlayer= chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen());
            }else{
                uniqueSocket.emit("invalidMove", move);
            }
        }}
        catch(err){
            console.error(err);
            uniqueSocket.emit("invalidMove", move);
        }});
       
});

const port= 3002;
server.listen(port, () => {
    console.log(`Server is running on localhost:${port}`);
});