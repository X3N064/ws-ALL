const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const animals = ["코끼리", "사자", "호랑이", "펭귄", "여우", "늑대", "토끼", "부엉이"];
const colors = ["#FF5733", "#33FF57", "#5733FF", "#FF33A1", "#33A1FF", "#A1FF33"];

let documentContent = "";
let users = {}; 

io.on("connection", (socket) => {
    const randomName = `익명의 ${animals[Math.floor(Math.random() * animals.length)]}`;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    users[socket.id] = {
        name: randomName,
        color: randomColor,
        cursorPosition: 0,
        mousePosition: { x: 0, y: 0 }
    };

    socket.emit("load-document", { content: documentContent, users });
    io.emit("update-users", users);

    socket.on("edit-document", (newContent) => {
        documentContent = newContent;
        socket.broadcast.emit("update-document", newContent);
    });

    // 입력할 때 커서 위치를 지속적으로 업데이트
    socket.on("typing-cursor", (position) => {
        users[socket.id].cursorPosition = position;
        io.emit("update-cursor", { id: socket.id, position });
    });

    socket.on("update-mouse", (position) => {
        users[socket.id].mousePosition = position;
        socket.broadcast.emit("update-mouse", { id: socket.id, position });
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("update-users", users);
    });
});

server.listen(3000, () => {
    console.log("서버 실행 중: http://localhost:3000");
});
