"use client"

import { useState, useEffect } from "react"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GlobalChat from "@/components/global-chat"
import RoomChat from "@/components/room-chat"
import RoomJoin from "@/components/room-join"
import RoomCreate from "@/components/room-create"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ChatApp() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io("http://localhost:3000")

    socketInstance.on("connect", () => {
      setConnected(true)
      toast({
        title: "Connected",
        description: `Connected with ID: ${socketInstance.id}`,
      })
    })

    socketInstance.on("disconnect", () => {
      setConnected(false)
      setCurrentRoom(null)
      toast({
        title: "Disconnected",
        description: "Lost connection to server",
        variant: "destructive",
      })
    })

    socketInstance.on("connect_error", (error) => {
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive",
      })
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [toast])

  const handleRoomJoined = (roomName: string) => {
    setCurrentRoom(roomName)
    toast({
      title: "Room Joined",
      description: `You joined room: ${roomName}`,
    })
  }

  const handleLeaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit("room:leave", { roomName: currentRoom })
      setCurrentRoom(null)
    }
  }

  return (
    <main className="container mx-auto p-4 max-w-5xl">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Socket.IO Chat</span>
            {connected ? (
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Connected: {socket?.id}
              </span>
            ) : (
              <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Disconnected</span>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {connected && (
        <Tabs defaultValue={currentRoom ? "room" : "global"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">Global Chat</TabsTrigger>
            <TabsTrigger value="room">Room Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="global">
            <GlobalChat socket={socket} />
          </TabsContent>
          <TabsContent value="room">
            {currentRoom ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Room: {currentRoom}</h3>
                  <Button variant="destructive" onClick={handleLeaveRoom}>
                    Leave Room
                  </Button>
                </div>
                <RoomChat socket={socket} roomName={currentRoom} />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <RoomCreate socket={socket} onRoomCreated={handleRoomJoined} />
                    <RoomJoin socket={socket} onRoomJoined={handleRoomJoined} />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
      <Toaster />
    </main>
  )
}
