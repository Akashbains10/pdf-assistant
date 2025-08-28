export type UploadProgressHandler = (percent: number) => void

export async function uploadPdfWithProgress(file: File, onProgress?: UploadProgressHandler): Promise<void> {
  const formData = new FormData()
  formData.append("file", file)

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${baseUrl}/v1/assistant/upload`)

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      } else {
        onProgress(0)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100)
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error("Network error during upload"))

    xhr.send(formData)
  })
}

export async function chatWithAssistant({ message }: { message: string }): Promise<{ message?: string; response?: string } | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
  try {
    const res = await fetch(`${baseUrl}/v1/assistant/chat?message=${encodeURIComponent(message)}`)
    if (!res.ok) throw new Error("Chat request failed")
    return await res.json()
  } catch (e) {
    console.error(e)
    return null
  }
} 