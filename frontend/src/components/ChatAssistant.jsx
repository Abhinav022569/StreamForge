import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css'; 

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am the StreamForge AI. Ask me how to build pipelines!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Connects to your Flask Backend
      const response = await fetch('http://192.168.1.12:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget-container">
      
      {/* 1. CHAT WINDOW PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chat-window"
            // Start slightly smaller and lower
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            // Animate to full size
            animate={{ opacity: 1, scale: 1, y: 0 }}
            // Exit by shrinking back down
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            // Spring animation for "pop" effect
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="flex items-center gap-2">
                  <Sparkles size={18} />
                  <span>StreamForge AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="close-btn">
                <X size={18} />
              </button>
            </div>
            
            {/* Messages Area */}
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-bubble ${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {isLoading && (
                  <div className="message-bubble bot flex items-center gap-2">
                      <Loader2 className="animate-spin" size={14} /> Thinking...
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your question..."
                disabled={isLoading}
              />
              <button 
                onClick={sendMessage} 
                disabled={isLoading || !input.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. TOGGLE BUTTON (Red Cross / Green Icon) */}
      <motion.button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        
        // Hover Interaction
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        
        // Rotate 90 degrees and turn Red when open
        animate={{ 
            rotate: isOpen ? 90 : 0, 
            backgroundColor: isOpen ? '#ef4444' : '#10b981' 
        }}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>

    </div>
  );
};

export default ChatAssistant;