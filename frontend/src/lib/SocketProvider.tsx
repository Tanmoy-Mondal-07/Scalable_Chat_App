"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./authStore";
import msgpack from "msgpack-lite";

export type Message = {
  conversation_id: string;
  message_ts: any;
  message_id: string;
  sender_id: string;
  content: string;
};

interface SocketProviderProps {
  children?: React.ReactNode;
}

type SendMessagePayload = {
  toUserId: string;
  message: string;
};

interface ISocketContext {
  sendMessage: (payload: SendMessagePayload) => void;
  messages: Message[];
  resetMessages: () => void;
  setMessages: (msgs: Message[]) => void;
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("SocketContext not found");
  return ctx;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const user = useAuthStore((state) => state.user);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const resetMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    ({ toUserId, message }: SendMessagePayload) => {
      const payload = msgpack.encode({
        toUserId,
        message,
      });
      socket?.emit("private:message", payload);
    },
    [socket]
  );

  const onPrivateMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    if (!user) return;

    const _socket = process.env.NEXT_PUBLIC_BACKEND_API ? io(
      `${process.env.NEXT_PUBLIC_BACKEND_API}`, {
      withCredentials: true,
    }) : io()

    _socket.on("private:message", onPrivateMessage);
    setSocket(_socket);

    return () => {
      _socket.off("private:message", onPrivateMessage);
      _socket.disconnect();
    };
  }, [user, onPrivateMessage]);

  return (
    <SocketContext.Provider
      value={{ sendMessage, messages, resetMessages, setMessages }}
    >
      {children}
    </SocketContext.Provider>
  );
};