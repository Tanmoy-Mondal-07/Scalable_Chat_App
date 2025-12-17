"use client";
import { useState } from "react";
import { useSocket } from "../lib/SocketProvider";

export default function Page() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");

  return (
    <div>
      <div>
        <input
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message..."
        />
        <button
          onClick={(e) => sendMessage({
            toUserId: "1",
            message
          })}
        >
          Send
        </button>
      </div>
      <div>
        {messages.map((e, index) => (
          <li key={index}>{e.message}</li>
        ))}
      </div>
    </div>
  );
}