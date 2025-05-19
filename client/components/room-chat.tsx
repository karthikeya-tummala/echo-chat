"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Socket } from "socket.io-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RoomChatProps {
  socket: Socket | null
  roomName: string
}

interface Message {
  room: string
  sender: string
  message: string
  timestamp: number
}

export default function RoomChat({ socket, roomName }: RoomChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!socket) return

    // Listen for new messages
    socket.on("room:newMessage", (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    // Listen for message history
    socket.on("room:history", (history: Message[]) => {
      setMessages(history.reverse())
    })

    // Listen for user joined/left events
    socket.on("room:userJoined", (message: string) => {
      setMessages((prev) => [
        ...prev,
        {
          room: roomName,
          sender: "System",
          message,
          timestamp: Date.now(),
        },
      ])
    })

    socket.on("room:userLeft", (message: string) => {
      setMessages((prev) => [
        ...prev,
        {
          room: roomName,
          sender: "System",
          message,
          timestamp: Date.now(),
        },
      ])
    })

    // Listen for errors
    socket.on("room:failed", (error: string) => {
      toast({
        title: "Room Error",
        description: error,
        variant: "destructive",
      })
    })

    socket.on("room:messageError", (error: string) => {
      toast({
        title: "Message Error",
        description: error,
        variant: "destructive",
      })
    })

    return () => {
      socket.off("room:newMessage")
      socket.off("room:history")
      socket.off("room:userJoined")
      socket.off("room:userLeft")
      socket.off("room:failed")
      socket.off("room:messageError")
    }
  }, [socket, roomName, toast])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !newMessage.trim() || !roomName) return

    // Send message to server
    socket.emit("room:message", {
      roomName,
      message: newMessage,
    })

    setNewMessage("")
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${
                  msg.sender === "System"
                    ? "justify-center"
                    : msg.sender === socket?.id
                      ? "justify-end"
                      : "justify-start"
                }`}
              >
                {msg.sender !== "System" && msg.sender !== socket?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{msg.sender.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`px-4 py-2 rounded-lg max-w-[80%] ${
                    msg.sender === "System"
                      ? "bg-gray-100 text-gray-500 text-sm"
                      : msg.sender === socket?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                  }`}
                >
                  {msg.sender !== "System" && (
                    <p className="text-xs opacity-70 mb-1">{msg.sender === socket?.id ? "You" : msg.sender}</p>
                  )}
                  <p>{msg.message}</p>
                  <p className="text-xs opacity-70 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
