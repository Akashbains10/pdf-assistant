"use client"

import { Bot } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="group max-w-4xl mx-auto  flex space-x-3">
      <div className="h-8 w-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
