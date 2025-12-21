import { create } from "zustand";

export type Conversation = {
    conversation_id: string;
    peer_id: string;
    last_message: string;
    last_message_at: string;
};

interface ConversationState {
    conversations: Conversation[];

    setConversations: (data: Conversation[]) => void;

    updateLastMessage: (
        conversationId: string,
        message: string,
        timestamp?: string
    ) => void;

    clearConversations: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
    conversations: [],

    setConversations: (data) =>
        set(() => ({
            conversations: data,
        })),

    updateLastMessage: (conversationId, message, timestamp) =>
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.conversation_id === conversationId
                    ? {
                        ...c,
                        last_message: message,
                        last_message_at: timestamp ?? new Date().toISOString(),
                    }
                    : c
            ),
        })),

    clearConversations: () =>
        set(() => ({
            conversations: [],
        })),
}));