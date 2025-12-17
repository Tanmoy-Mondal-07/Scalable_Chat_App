"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {
  children?: React.ReactNode;
}

type IncomingMessage = {
  from: string;
  message: string;
};

type SendMessagePayload = {
  toUserId: string;
  message: string;
};

interface ISocketContext {
  sendMessage: (payload: SendMessagePayload) => void;
  messages: IncomingMessage[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("SocketContext not found");
  return ctx;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<IncomingMessage[]>([]);

  const sendMessage = useCallback(
    ({ toUserId, message }: SendMessagePayload) => {
      console.log(toUserId, message);
      socket?.emit("private:message", { toUserId, message });
    },
    [socket]
  );

  const onPrivateMessage = useCallback((msg: IncomingMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    const _socket = io('http://localhost:8000', {
      withCredentials: true,
    });

    _socket.on("private:message", onPrivateMessage);

    setSocket(_socket);

    return () => {
      _socket.off("private:message", onPrivateMessage);
      _socket.disconnect();
    };
  }, [onPrivateMessage]);

  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};