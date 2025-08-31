import { axios } from "@/lib/axios"
import { useQuery } from "@tanstack/react-query";

type TChatWithAssistantResponse = {
    message: string
    docs: any[]
}

export const chatwithAssistant = (message: string): Promise<TChatWithAssistantResponse> => {
    console.log("Sending message to assistant:", message);
    return axios.get('/assistant/chat', {
        params: {
            message
        }
    })
}

type UseChatWithAssistantOptions = {
    config?: any
    message: string
}

export const useChatWithAssistant = ({config, message}: UseChatWithAssistantOptions) => {
    return useQuery({
        queryKey: ['chatWithAssistant', message],
        queryFn: () => chatwithAssistant(message),
        ...config
    })
}