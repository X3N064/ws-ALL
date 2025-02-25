const socket = io("http://localhost:3000");
const editor = document.getElementById("editor");
const userCount = document.getElementById("user-count");
const userList = document.getElementById("user-list");
const cursorContainer = document.getElementById("cursor-container");

let users = {};
let cursors = {};
let blinkingCursors = {};

// 서버에서 사용자 목록 업데이트
socket.on("update-users", (updatedUsers) => {
    users = updatedUsers;
    userCount.textContent = Object.keys(users).length;
    userList.innerHTML = "";

    Object.entries(users).forEach(([id, user]) => {
        const userIcon = document.createElement("div");
        userIcon.classList.add("user-icon");
        userIcon.style.backgroundColor = user.color;
        userIcon.setAttribute("data-name", user.name);
        userList.appendChild(userIcon);
    });
});

// 문서 입력 시 서버에 전송
editor.addEventListener("input", () => {
    socket.emit("edit-document", editor.innerHTML);
});

// 서버에서 문서 업데이트
socket.on("update-document", (newContent) => {
    editor.innerHTML = newContent;
});

// 타이핑할 때마다 커서 위치 전송
editor.addEventListener("keyup", () => {
    const selection = window.getSelection();
    const position = selection.focusOffset;  // 현재 커서 위치
    socket.emit("typing-cursor", position);
});

// 서버에서 받은 커서 업데이트 (각 사용자의 커서 위치 업데이트)
socket.on("update-cursor", ({ id, position }) => {
    if (!cursors[id]) {
        const cursor = document.createElement("div");
        cursor.classList.add("cursor", "blinking-cursor"); // 깜빡이게 변경
        cursor.style.backgroundColor = users[id]?.color || "#000";
        cursorContainer.appendChild(cursor);
        cursors[id] = cursor;
    }

    const range = document.createRange();
    const selection = window.getSelection();
    
    try {
        range.setStart(editor.childNodes[0], position);
        range.collapse(true);
        const rect = range.getBoundingClientRect();

        cursors[id].style.left = `${rect.left + window.scrollX}px`;
        cursors[id].style.top = `${rect.top + window.scrollY}px`;
    } catch (e) {
        console.error("Cursor position error", e);
    }
});
