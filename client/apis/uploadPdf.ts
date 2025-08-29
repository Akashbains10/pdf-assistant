import { axios } from "@/lib/axios"
import { useMutation } from "@tanstack/react-query";

export const uploadPdf = (payload: File | null) => {
    const formData = new FormData();
   if (payload) formData.append('file', payload)
    return axios.post('/assistant/upload', formData)
}

export const useUploadPdf = () => {
    return useMutation({
        mutationKey:['upload-pdf'],
        mutationFn: uploadPdf
    })
}