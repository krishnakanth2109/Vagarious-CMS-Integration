import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./chatbot.css";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Welcome to Arah Infotech 👋 How can we assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsgText = input;
    setInput(""); // Clear input immediately

    // Add User Message
    setMessages((prev) => [...prev, { sender: "user", text: userMsgText }]);
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/chatbot`;

      const res = await axios.post(
        apiUrl,
        { message: userMsgText },
        { 
          // 🔹 TIMEOUT SET TO 60 SECONDS (60000ms)
          // This gives the server enough time if it's still loading knowledge
          timeout: 60000 
        } 
      );

      // Add Bot Response
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.data.reply },
      ]);
    } catch (error) {
      console.error("Chatbot Error:", error);

      let errorMessage = "I'm having trouble connecting right now. Please try again later.";
      
      // Check if it was specifically a timeout error
      if (error.code === 'ECONNABORTED') {
        errorMessage = "The server is taking too long to respond. It might be loading the knowledge base. Please try again in a minute.";
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: errorMessage },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Icon */}
      {!open && (
        <div className="ai-toggle" onClick={() => setOpen(true)}>
          <span role="img" aria-label="chat">
            💬
          </span>
        </div>
      )}

      {/* Chat Widget */}
      <div className={`ai-widget ${open ? "show" : ""}`}>
        <div className="ai-header">
          <div>
            <h4>Arah Infotech</h4>
            <span>AI Support Assistant</span>
          </div>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="ai-body">
          {messages.map((msg, index) => (
            <div key={index} className={`ai-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}

          {loading && (
            <div className="ai-message bot">
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>

        <div className="ai-footer">
          <input
            type="text"
            placeholder="Ask about our services..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatBot;