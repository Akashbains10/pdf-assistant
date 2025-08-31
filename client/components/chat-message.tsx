"use client"

import { Bot, User } from "lucide-react";
import moment from "moment";


interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`group max-w-4xl mx-auto ${message.role !== "user" ? "bg-muted/30" : ""}`}>
      <div className="px-6 py-4">
        <div className="flex items-start gap-4">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-card-foreground"
            }`}
          >
            {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>

          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium text-foreground">
              {message.role === "user" ? "You" : "AI Assistant"}
            </div>
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">{message.content}</div>
            <div className="text-xs text-muted-foreground">{moment(message.timestamp).format("LT")}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
