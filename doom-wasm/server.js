const express = require("express")
const http = require("http")
const socketIo = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

const rooms = new Map()

io.on("connection", (socket) => {
  console.log("A user connected")

  socket.on("create-room", () => {
    const roomId = Math.random().toString(36).substring(7)
    rooms.set(roomId, { creator: socket.id })
    socket.join(roomId)
    socket.emit("room-created", roomId)
  })

  socket.on("join-room", (roomId) => {
    const room = rooms.get(roomId)
    if (room) {
      socket.join(roomId)
      socket.to(room.creator).emit("user-joined", socket.id)
      socket.emit("room-joined", roomId)
    } else {
      socket.emit("error", "Room not found")
    }
  })

  socket.on("offer", (data) => {
    socket.to(data.target).emit("offer", {
      sdp: data.sdp,
      sender: socket.id,
    })
  })

  socket.on("answer", (data) => {
    socket.to(data.target).emit("answer", {
      sdp: data.sdp,
      sender: socket.id,
    })
  })

  socket.on("ice-candidate", (data) => {
    socket.to(data.target).emit("ice-candidate", {
      candidate: data.candidate,
      sender: socket.id,
    })
  })

  socket.on("disconnect", () => {
    console.log("A user disconnected")
    // Remove the room if the creator disconnects
    for (const [roomId, room] of rooms.entries()) {
      if (room.creator === socket.id) {
        rooms.delete(roomId)
        break
      }
    }
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`)
})

