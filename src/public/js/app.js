const socket = io();
const welcome = document.querySelector("#welcome");
const room = document.querySelector("#room");
const form = welcome.querySelector("form");

room.hidden = true;
let roomName;

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const nameForm = room.querySelector("#name");
  const msgForm = room.querySelector("#msg");
  nameForm.addEventListener("submit", formNameParse);
  msgForm.addEventListener("submit", formMsgParse);
};

const formRoomParse = (e) => {
  e.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
};
form.addEventListener("submit", formRoomParse);

const formNameParse = (e) => {
  e.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
};

const formMsgParse = (e) => {
  e.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
};

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
};

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} someone room in`); //socket.nickname
});
socket.on("bye", (out, newCount) => {
  //socket.nickname
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${out} someone room out`);
});
socket.on("new_message", addMessage);
