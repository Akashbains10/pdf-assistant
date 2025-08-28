"use client"

import { useState } from "react"
import { ChatMessage } from "./chat-message"
import { TypingIndicator } from "./typing-indicator"
import { MessageInput } from "./message-input"
import { UploadModal } from "./upload-modal"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef } from "react";
import { Bot } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { uploadPdfWithProgress } from "@/lib/api"


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
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const [isProcessingPDF, setIsProcessingPDF] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const stopStreamingRef = useRef<boolean>(false)
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, isLoading])

  const streamAssistantMessage = async (
    message: Message,
    options?: {
      delayBetweenChars?: number;
      delayAfterComplete?: number;
      chunkSize?: number;
      stopRef?: React.RefObject<boolean>;
    }
  ) => {
    const streamId = `${message.id}-streaming`;
    const typingSpeed = options?.delayBetweenChars ?? 5;
    const pauseAfterTyping = options?.delayAfterComplete ?? 500;
    const chunkSize = options?.chunkSize ?? 4;
    const stopRef = options?.stopRef;

    setMessages(prev => [...prev, { ...message, id: streamId, content: "" }]);

    let content = "";
    let i = 0;

    while (i < message.content.length) {
      if (stopRef?.current) break;

      const chunk = message.content.slice(i, i + chunkSize);
      content += chunk;
      i += chunkSize;

      setMessages(prev =>
        prev.map(msg => (msg.id === streamId ? { ...msg, content } : msg))
      );

      await new Promise(resolve => setTimeout(resolve, typingSpeed));
    }

    setMessages(prev =>
      prev.map(msg => (msg.id === streamId ? { ...msg, id: `${Date.now()}-final` } : msg))
    );

    await new Promise(r => setTimeout(r, pauseAfterTyping));
  }

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
    setInputValue("")
    setIsLoading(true)
    setIsStreaming(true)

    try {
      const simulated = await new Promise<{ content: string }>((resolve) => {
        const base = uploadedFile
          ? `Based on your uploaded PDF "${uploadedFile.name}", here's a helpful response to your question: "${userMessage.content}". Let me know if you'd like a summary or to search for a specific topic.`
          : `I understand you're asking: "${userMessage.content}". Upload a PDF so I can answer using your document's content. Meanwhile, I can still provide general guidance.`
        setTimeout(() => resolve({ content: base }), 650)
      })

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: simulated.content,
        timestamp: new Date(),
      }
      await streamAssistantMessage(assistantMessage, {
        stopRef: stopStreamingRef,
      })
    } catch (err) {
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
      setIsStreaming(false)
    }
  }

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      await uploadPdfWithProgress(file, (p) => setUploadProgress(p))
    },
    onMutate: async (file) => {
      setUploadedFile(file)
      setShowUploadModal(false)
      setIsProcessingPDF(true)
      setUploadProgress(0)
    },
    onError: (error) => {
      console.error(error)
      setUploadedFile(null)
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
    onSuccess: async () => {
      await new Promise((r) => setTimeout(r, 500))
    },
    onSettled: () => {
      setIsProcessingPDF(false)
      setUploadProgress(0)
    },
  })

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") return
    uploadMutation.mutate(file)
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)]">
      {isProcessingPDF && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-md mx-auto px-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-foreground truncate pr-3">
                  Uploading {uploadedFile?.name}
                </div>
                <div className="text-xs text-muted-foreground tabular-nums">{uploadProgress}%</div>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-150 ease-linear"
                  style={{
                    width: `${uploadProgress}%`,
                    background: "repeating-linear-gradient(45deg, hsl(var(--primary)) 0, hsl(var(--primary)) 10px, hsl(var(--primary)/.8) 10px, hsl(var(--primary)/.8) 20px)",
                  }}
                />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Please keep this tab open while your document uploads.
              </div>
            </div>
          </div>
        </div>
      )}

      {messages.length === 1 && !uploadedFile && (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
              <Bot className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">
                {uploadedFile
                  ? isProcessingPDF
                    ? "Processing your PDF..."
                    : "Ready to help!"
                  : "Welcome to PDF AI Assistant"}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {uploadedFile
                  ? isProcessingPDF
                    ? "Please wait while I analyze your document. Once complete, you can ask questions about the content."
                    : "I can answer questions about your PDF document. Try asking about specific topics, summaries, or details from the content."
                  : "Upload a PDF document to get started. I'll help you analyze and answer questions about its content."}
              </p>
            </div>
            {uploadedFile && !isProcessingPDF && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Example questions:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• "What is this document about?"</p>
                  <p>• "Summarize the main points"</p>
                  <p>• "Find information about [topic]"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(messages.length > 1 || uploadedFile) && (
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
