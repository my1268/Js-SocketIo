import express from "express";
import http from "http";
import SocketIo from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpserver = http.createServer(app);
const wsServer = SocketIo(httpserver);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
    return publicRooms;
  });
} // sids = 개인방, rooms = 개인방, 공개방

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    // socket.onAny 모든 event를 console에 보이게함
    console.log(`Socket Event = ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName); //socket.join 들어갈때 사용 roomName = input.value
    done(); //showRoom()
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); //socket.to 자신말고 모든 이에게 보이게 함.
    wsServer.sockets.emit("room_change", publicRooms());
    // 알림창으로 모두 알려줌.
    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) =>
        socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
      ); // welcome, bye 뒷 부분 socket.nickname으로 nickname붙여주기
    }); //forEach의 괄호는 내가 만듬 첨에 s붙이기
    socket.on("disconnect", () => {
      wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
      socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
      done();
    });
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
  }); //nickname부분 어려운듯
});

httpserver.listen(3000, handleListen);
