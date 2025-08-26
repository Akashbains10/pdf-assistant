"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Upload } from "lucide-react"

interface MessageInputProps {
  inputValue: string
  setInputValue: (value: string) => void
  onSendMessage: () => void
  onUploadClick: () => void
  isLoading: boolean
  uploadedFile: File | null
}

export function MessageInput({
  inputValue,
  setInputValue,
  onSendMessage,
  onUploadClick,
  isLoading,
  uploadedFile,
}: MessageInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-xl border border-border">
      <Button
        onClick={onUploadClick}
        variant="outline"
        size="sm"
        className="border-border hover:bg-accent hover:text-accent-foreground bg-transparent"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploadedFile ? "Change PDF" : "Upload"}
      </Button>

      <div className="flex-1 relative">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your document..."
          className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent pr-12"
          disabled={isLoading}
        />
        <Button
          onClick={onSendMessage}
          disabled={!inputValue.trim() || isLoading}
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
