"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, X } from "lucide-react"

export function PDFUpload() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find((file) => file.type === "application/pdf")

    if (pdfFile) {
      handleFileUpload(pdfFile)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      handleFileUpload(file)
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    // Simulate upload process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setUploadedFile(file)
    setIsUploading(false)
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  if (uploadedFile) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{uploadedFile.name}</p>
              <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 p-3 bg-accent/10 rounded-lg">
          <p className="text-sm text-accent-foreground">
            ✓ PDF uploaded successfully! You can now ask questions about your document below.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={`p-8 border-2 border-dashed transition-all duration-200 ${
        isDragOver ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Upload className={`h-8 w-8 ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
        </div>

        <h3 className="text-lg font-medium text-foreground mb-2">
          {isUploading ? "Uploading..." : "Upload your PDF document"}
        </h3>

        <p className="text-muted-foreground mb-6">Drag and drop your PDF here, or click to browse</p>

        <div className="space-y-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
            disabled={isUploading}
          />
          <label htmlFor="pdf-upload">
            <Button className="cursor-pointer" disabled={isUploading} asChild>
              <span>{isUploading ? "Processing..." : "Choose PDF File"}</span>
            </Button>
          </label>

          <p className="text-xs text-muted-foreground">Supports PDF files up to 10MB</p>
        </div>
      </div>
    </Card>
  )
}
