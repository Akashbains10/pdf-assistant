import { Message } from "@/components/chat-interface";

export const streamAssistantMessage = async (
    message: Message,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
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