import { toast } from "sonner"
import io, { type Socket } from "socket.io-client"

type PeerConnection = RTCPeerConnection
type DataChannel = RTCDataChannel

export class WebRTCManager {
  private peerConnection: PeerConnection | null = null
  private dataChannel: DataChannel | null = null
  private roomId: string | null = null
  private socket: Socket

  constructor(private onMessageReceived: (message: any) => void) {
    this.socket = io("http://localhost:3001")

    this.socket.on("room-created", (roomId: string) => {
      this.roomId = roomId
      toast.success("Room created", { description: `Room ID: ${roomId}` })
    })

    this.socket.on("room-joined", (roomId: string) => {
      this.roomId = roomId
      toast.success("Joined room", { description: `Room ID: ${roomId}` })
    })

    this.socket.on("user-joined", (userId: string) => {
      this.createPeerConnection(userId)
    })

    this.socket.on("offer", async (data: { sdp: RTCSessionDescriptionInit; sender: string }) => {
      await this.handleOffer(data.sdp, data.sender)
    })

    this.socket.on("answer", async (data: { sdp: RTCSessionDescriptionInit; sender: string }) => {
      await this.handleAnswer(data.sdp)
    })

    this.socket.on("ice-candidate", (data: { candidate: RTCIceCandidateInit; sender: string }) => {
      this.handleNewICECandidate(data.candidate)
    })
  }

  async createRoom(): Promise<string> {
    this.socket.emit("create-room")
    return new Promise((resolve) => {
      this.socket.once("room-created", (roomId: string) => {
        resolve(roomId)
      })
    })
  }

  async joinRoom(roomId: string): Promise<void> {
    this.socket.emit("join-room", roomId)
    return new Promise((resolve) => {
      this.socket.once("room-joined", () => {
        resolve()
      })
    })
  }

  private async createPeerConnection(targetUserId: string) {
    this.peerConnection = new RTCPeerConnection()

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("ice-candidate", {
          target: targetUserId,
          candidate: event.candidate,
        })
      }
    }

    this.dataChannel = this.peerConnection.createDataChannel("gameData")
    this.setupDataChannel()

    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)

    this.socket.emit("offer", {
      target: targetUserId,
      sdp: offer,
    })
  }

  private async handleOffer(offer: RTCSessionDescriptionInit, sender: string) {
    this.peerConnection = new RTCPeerConnection()

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("ice-candidate", {
          target: sender,
          candidate: event.candidate,
        })
      }
    }

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel
      this.setupDataChannel()
    }

    await this.peerConnection.setRemoteDescription(offer)
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)

    this.socket.emit("answer", {
      target: sender,
      sdp: answer,
    })
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(answer)
    }
  }

  private async handleNewICECandidate(candidate: RTCIceCandidateInit) {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(candidate)
    }
  }

  private setupDataChannel() {
    if (!this.dataChannel) return

    this.dataChannel.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.onMessageReceived(message)
    }

    this.dataChannel.onopen = () => {
      toast.success("Connected to peer")
    }

    this.dataChannel.onclose = () => {
      toast.error("Disconnected from peer")
    }
  }

  sendMessage(message: any) {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(JSON.stringify(message))
    }
  }

  close() {
    if (this.peerConnection) {
      this.peerConnection.close()
    }
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}

