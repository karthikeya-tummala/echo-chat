"use client"

import type React from "react"

import { useState } from "react"
import type { Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface RoomJoinProps {
  socket: Socket | null
  onRoomJoined: (roomName: string) => void
}

export default function RoomJoin({ socket, onRoomJoined }: RoomJoinProps) {
  const [roomCode, setRoomCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const { toast } = useToast()

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !roomCode.trim()) return

    setIsJoining(true)

    // Convert to uppercase as the server expects uppercase room codes
    const formattedRoomCode = roomCode.toUpperCase()

    socket.emit("room:join", { roomName: formattedRoomCode })

    // Listen for room join response
    socket.once("room:joined", () => {
      setIsJoining(false)
      onRoomJoined(formattedRoomCode)
    })

    socket.once("room:failed", (error: string) => {
      setIsJoining(false)
      toast({
        title: "Room Join Failed",
        description: error,
        variant: "destructive",
      })
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join a Room</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoinRoom}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input placeholder="Enter room code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={isJoining || !roomCode.trim()}>
              {isJoining ? "Joining..." : "Join Room"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
