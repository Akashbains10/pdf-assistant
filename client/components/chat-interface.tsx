"use client"

import { useState } from "react"
import { ChatMessage } from "./chat-message"
import { TypingIndicator } from "./typing-indicator"
import { MessageInput } from "./message-input"
import { UploadModal } from "./upload-modal"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI document assistant. Upload a PDF to get started, and I'll help you analyze, summarize, and answer questions about your document.",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: uploadedFile
          ? `Based on your uploaded PDF "${uploadedFile.name}", I can help answer questions about its content. What would you like to know?`
          : `I understand you're asking about "${inputValue}". Please upload a PDF document first so I can analyze it and provide detailed answers based on the content.`,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleFileUpload = (file: File) => {
    if (file.type === "application/pdf") {
      setUploadedFile(file)
      setShowUploadModal(false)
      const successMessage: Message = {
        id: Date.now().toString(),
        content: `Successfully uploaded "${file.name}". You can now ask me questions about this document!`,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, successMessage])
    }
  }

  return (
    <div className="flex flex-col h-full">
      {messages.length === 1 && !uploadedFile && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Get started with your documents</h2>
            <p className="text-muted-foreground mb-6">
              Upload a PDF document and start asking questions. I'll help you analyze, summarize, and extract insights
              from your content.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Upload Your First Document
            </button>
          </div>
        </div>
      )}

      {(messages.length > 1 || uploadedFile) && (
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          </div>
        </div>
      )}

      <div className="border-border p-4">
        <div className="max-w-4xl mx-auto">
          <MessageInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSendMessage={handleSendMessage}
            onUploadClick={() => setShowUploadModal(true)}
            isLoading={isLoading}
            uploadedFile={uploadedFile}
          />
        </div>
      </div>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileUpload={handleFileUpload}
        uploadedFile={uploadedFile}
      />
    </div>
  )
}
