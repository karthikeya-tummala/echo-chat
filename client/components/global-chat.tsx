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

interface GlobalChatProps {
  socket: Socket | null
}

interface Message {
  sender: string
  message: string
  timeStamp: number
}

export default function GlobalChat({ socket }: GlobalChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!socket) return

    // Listen for global messages
    socket.on("chat:newGlobalMessage", (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    // Listen for user joined/left events
    socket.on("user:joined", (message: string) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "System",
          message,
          timeStamp: Date.now(),
        },
      ])
    })

    socket.on("user:left", (message: string) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "System",
          message,
          timeStamp: Date.now(),
        },
      ])
    })

    return () => {
      socket.off("chat:newGlobalMessage")
      socket.off("user:joined")
      socket.off("user:left")
    }
  }, [socket])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !newMessage.trim()) return

    // Send message to server
    socket.emit("chat:globalMessage", newMessage)

    // Add message to local state
    setMessages((prev) => [
      ...prev,
      {
        sender: socket.id || "You",
        message: newMessage,
        timeStamp: Date.now(),
      },
    ])

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
                    : msg.sender === socket?.id || msg.sender === "You"
                      ? "justify-end"
                      : "justify-start"
                }`}
              >
                {msg.sender !== "System" && msg.sender !== socket?.id && msg.sender !== "You" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{msg.sender.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`px-4 py-2 rounded-lg max-w-[80%] ${
                    msg.sender === "System"
                      ? "bg-gray-100 text-gray-500 text-sm"
                      : msg.sender === socket?.id || msg.sender === "You"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                  }`}
                >
                  {msg.sender !== "System" && (
                    <p className="text-xs opacity-70 mb-1">
                      {msg.sender === socket?.id || msg.sender === "You" ? "You" : msg.sender}
                    </p>
                  )}
                  <p>{msg.message}</p>
                  <p className="text-xs opacity-70 text-right mt-1">{new Date(msg.timeStamp).toLocaleTimeString()}</p>
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
