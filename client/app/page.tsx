"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [chatKey, setChatKey] = useState(0)

  const handleNewChat = () => {
    setChatKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-foreground">PDF Assistant</h1>
              <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">AI Powered</div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleNewChat}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                New Chat
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <ChatInterface key={chatKey} />
      </main>
    </div>
  )
}
