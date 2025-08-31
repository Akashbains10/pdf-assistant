import { axios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export const uploadPdf = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/assistant/upload', formData);
};

export const useUploadPdf = () => {
    return useMutation({
        mutationKey:['upload-pdf'],
        mutationFn: uploadPdf
    })
}