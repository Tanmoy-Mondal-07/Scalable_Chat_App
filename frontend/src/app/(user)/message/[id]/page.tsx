"use client";

import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/authStore';
import { useSocket } from '@/lib/SocketProvider';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function Page() {
  const user = useAuthStore((state) => state.user);
  const params = useParams<{ id: string }>();

  const { sendMessage, messages, resetMessages } = useSocket();
  const [message, setMessage] = useState("");

  useEffect(() => {
    resetMessages();
  }, [params.id, resetMessages]);

  if (!user) return null;

  return (
    <div>
      <div>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message..."
        />
        <button
          onClick={() =>
            sendMessage({
              toUserId: params.id,
              message,
            })
          }
        >
          Send
        </button>
      </div>

      <div>
        {messages.map((e) => (
          <li key={e.message_id}>{e.content}</li>
        ))}
      </div>
    </div>
  );
}

export default Page;