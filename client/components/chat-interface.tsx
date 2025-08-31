"use client"

import { useState, useEffect, useRef } from "react"
import { ChatMessage } from "./chat-message"
import { TypingIndicator } from "./typing-indicator"
import { MessageInput } from "./message-input"
import { UploadModal } from "./upload-modal"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot } from "lucide-react"
import { streamAssistantMessage } from "@/utils/streamAssistantMessage"
import { useUploadPdf } from "@/apis/uploadPdf"
import { useChatWithAssistant } from "@/apis/chatwithAssistant"

export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { refetch } = useChatWithAssistant({
    message: inputValue,
    config: {enabled: false}
  });

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const { mutate: uploadMutate, isPending } = useUploadPdf()

  const [isProcessingPDF, setIsProcessingPDF] = useState(false)
  const stopStreamingRef = useRef<boolean>(false)

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" })

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom()
    }, 100)
    return () => clearTimeout(timeout)
  }, [messages, isLoading])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return
    stopStreamingRef.current = false

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    // setInputValue("")
    setIsLoading(true)

    try {
      const simulated = await new Promise<{ content: string }>((resolve) => {
        const base = uploadedFile
          ? `Based on your uploaded PDF "${uploadedFile.name}", here's a helpful response to your question: "${userMessage.content}".`
          : `I understand you're asking: "${userMessage.content}". Upload a PDF so I can answer using your document's content.`
        setTimeout(() => resolve({ content: base }), 650)
      })

      const { data: assistantResponse } = await refetch();

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: assistantResponse?.message,
        timestamp: new Date(),
      }
      await streamAssistantMessage(assistantMessage, setMessages, {
        stopRef: stopStreamingRef,
      })
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, something went wrong.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") return

    setUploadedFile(file)
    setShowUploadModal(false)
    setIsProcessingPDF(true)
    setUploadProgress(0)

    uploadMutate(file, {
      onSuccess: async () => {
        await new Promise((r) => setTimeout(r, 1500)) // simulate processing
        setIsProcessingPDF(false)

        // push assistant success message into chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content:
              "🎉 Your PDF is ready! You can now ask me questions about it. Example questions:\n\n•  What is this document about?\n•  Summarize the main points\n•  Find information about [topic]",
            role: "assistant",
            timestamp: new Date(),
          },
        ])

      },
      onError: (error) => {
        console.error(error)
        setUploadedFile(null)
        setIsProcessingPDF(false)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: "There was an issue uploading your PDF. Please try again.",
            role: "assistant",
            timestamp: new Date(),
          },
        ])
      },
    })
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)]">
      {/* PDF Processing Loader */}
      {isProcessingPDF && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg text-center">
            <svg
              className="mx-auto h-12 w-12 text-primary animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 
                0 0 5.373 0 12h4zm2 
                5.291A7.962 7.962 0 014 
                12H0c0 3.042 1.135 
                5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-foreground">Processing PDF</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              We're preparing your document for chat. This may take a moment.
            </p>
          </div>
        </div>
      )}

      {/* Welcome State (only if no messages yet and no PDF uploaded) */}
      {messages.length === 0 && !uploadedFile && !isProcessingPDF && (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
              <Bot className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Welcome to PDF AI Assistant</h3>
            <p className="text-muted-foreground leading-relaxed">
              Upload a PDF document to get started. I'll help you analyze and answer questions about
              its content.
            </p>
          </div>
        </div>
      )}

      {/* Chat Section (after first message or after PDF ready) */}
      {(messages.length > 0 || uploadedFile) && !isProcessingPDF && (
        <div className="pb-28">
          <div className="h-full flex flex-col">
            <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background p-4 z-50">
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
