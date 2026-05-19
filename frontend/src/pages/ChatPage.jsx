import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    const currentInput = input;

    setInput("");

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/chatbot/ask/",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: currentInput,
          }),
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Backend error",
        },
      ]);
    }
  };

  return (
    <div className="chat-page">
      <h1>AI Mentor</h1>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.role}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) =>
          setInput(e.target.value)
        }
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}