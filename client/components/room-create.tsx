"use client"

import { useState } from "react"
import type { Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface RoomCreateProps {
  socket: Socket | null
  onRoomCreated: (roomName: string) => void
}

export default function RoomCreate({ socket, onRoomCreated }: RoomCreateProps) {
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const handleCreateRoom = () => {
    if (!socket) return

    setIsCreating(true)

    socket.emit("room:create")

    // Listen for room creation response
    socket.once("room:created", (message: string) => {
      setIsCreating(false)

      // Extract room name from message
      const roomNameMatch = message.match(/room with the name ([A-Z0-9]+)/)
      if (roomNameMatch && roomNameMatch[1]) {
        const roomName = roomNameMatch[1]
        onRoomCreated(roomName)

        toast({
          title: "Room Created",
          description: `Created and joined room: ${roomName}`,
        })
      }
    })

    socket.once("room:failed", (error: string) => {
      setIsCreating(false)
      toast({
        title: "Room Creation Failed",
        description: error,
        variant: "destructive",
      })
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Room</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">Create a new chat room with a randomly generated code.</p>
        <Button onClick={handleCreateRoom} className="w-full" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Room"}
        </Button>
      </CardContent>
    </Card>
  )
}
