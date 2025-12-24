"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, MoreVertical, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { axiosInstance } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import { useSocket } from "@/lib/SocketProvider";

function Page() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user);
  if (!user) router.push("/")
  const params = useParams<{ id: string }>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { sendMessage, messages, resetMessages, setMessages } = useSocket();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  useEffect(() => {
    resetMessages();
    const fetchHistory = async () => {
      try {
        const response = await axiosInstance.post('/chat/messages', {
          receiverId: params.id
        });
        setMessages(response.data.data.reverse());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [params.id, resetMessages, setMessages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim()) return;

    sendMessage({
      toUserId: params.id,
      message,
    });
    setMessage("");
  };

  if (!user || !messages) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">

      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm italic">
              Syncing messages...
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <motion.div
                    key={msg.message_id || index}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex flex-col gap-1.5 ${isMe ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${isMe
                          ? "bg-primary text-primary-foreground rounded-br-none font-medium"
                          : "bg-muted/50 backdrop-blur-sm border border-border/40 text-foreground rounded-bl-none"
                          }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 px-1 uppercase font-semibold">
                        {new Date(msg.message_ts).toLocaleString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 p-6 bg-background z-50">
        <form
          onSubmit={handleSend}
          className="max-w-4xl mx-auto flex items-center gap-3 bg-muted/30 p-2 pl-4 rounded-[24px] border border-border/50 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300"
        >
          {/* <Button type="button" variant="ghost" size="icon" className="text-muted-foreground shrink-0 rounded-full hover:bg-background">
            <Paperclip size={20} />
          </Button> */}

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message..."
            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 text-[15px] h-10"
          />

          <Button
            type="submit"
            disabled={!message.trim()}
            className="rounded-full h-10 w-10 p-0 shrink-0 shadow-lg shadow-primary/20 transition-transform active:scale-90"
          >
            <Send size={18} className="ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Page;