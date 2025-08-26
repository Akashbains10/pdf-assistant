"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, X } from "lucide-react"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onFileUpload: (file: File) => void
  uploadedFile: File | null
}

export function UploadModal({ isOpen, onClose, onFileUpload, uploadedFile }: UploadModalProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  if (!isOpen) return null

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files[0]) {
      onFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-background border-border rounded-2xl p-8 max-w-md w-full mx-4 border shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Upload PDF Document</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragOver ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <p className="text-foreground font-medium mb-1">Drop your PDF here</p>
              <p className="text-muted-foreground text-sm">or click to browse files</p>
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onFileUpload(file)
              }}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium cursor-pointer hover:bg-primary/90 transition-all duration-200"
            >
              Choose File
            </label>
          </div>
        </div>

        {uploadedFile && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Current file: <span className="text-foreground font-medium">{uploadedFile.name}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
