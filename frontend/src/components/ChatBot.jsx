import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, X, Mic, MicOff, Volume2 } from "lucide-react";
import stringSimilarity from "string-similarity";
import { chatbotResponses, keywordMapping } from "../data/chatbotData";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "🎙️ Hi! I’m SmartBot — your voice-enabled SmartCollab assistant. Ask me anything!"
    }
  ]);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // 🔍 Fuzzy match logic
  const getBestMatchResponse = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    const allKeys = Object.keys(chatbotResponses);

    for (const key in keywordMapping) {
      if (keywordMapping[key].some((alt) => lowerQuery.includes(alt))) {
        return chatbotResponses[key];
      }
    }

    const bestMatch = stringSimilarity.findBestMatch(lowerQuery, allKeys);
    const { target, rating } = bestMatch.bestMatch;
    if (rating > 0.45) return chatbotResponses[target];

    const allAlternatives = [];
    for (const key in keywordMapping) {
      keywordMapping[key].forEach((alt) => allAlternatives.push({ alt, key }));
    }

    const bestAltMatch = stringSimilarity.findBestMatch(
      lowerQuery,
      allAlternatives.map((a) => a.alt)
    );
    if (bestAltMatch.bestMatch.rating > 0.5) {
      const matchedKey = allAlternatives.find(
        (a) => a.alt === bestAltMatch.bestMatch.target
      )?.key;
      if (matchedKey) return chatbotResponses[matchedKey];
    }

    return null;
  };

  // 🎙️ Handle speech input
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Sorry, your browser doesn’t support voice recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // 🗣️ Speak bot response aloud with Indian female voice
  const speakResponse = (text) => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1.0;
    utterance.pitch = 1;

    // Select Indian female voice
    const voices = window.speechSynthesis.getVoices();
    const indianFemaleVoice = voices.find(
      (v) =>
        v.lang === "en-IN" &&
        (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira"))
    );

    if (indianFemaleVoice) {
      utterance.voice = indianFemaleVoice;
    }

    setSpeaking(true);
    utterance.onend = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = (customText = null) => {
    const messageText = customText || input;
    if (!messageText.trim()) return;

    const userMsg = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMsg]);

    const response = getBestMatchResponse(messageText);
    const botReply = response
      ? response
      : "Hmm 🤔 I didn’t quite catch that. Try asking about SmartCollab’s features, pricing, or who it’s made for!";

    const botMsg = { sender: "bot", text: botReply };
    setTimeout(() => {
      setMessages((prev) => [...prev, botMsg]);
      speakResponse(botReply);
    }, 600);

    setInput("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load voices to prevent empty list
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl hover:scale-110 transition-transform"
      >
        {isOpen ? <X size={22} /> : <Bot size={22} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 animate-slide-up">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 font-semibold text-center">
            SmartCollab Assistant 🤖
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm transition-all duration-300 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex items-center bg-white dark:bg-gray-900">
            <button
              onClick={listening ? stopListening : startListening}
              className={`p-2 rounded-full mr-2 ${
                listening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
              title={listening ? "Stop Listening" : "Speak"}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              placeholder="Type or speak..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none"
            />

            <button
              onClick={() => handleSend()}
              className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              title="Send Message"
            >
              <Send size={16} />
            </button>

            <button
              onClick={() => speakResponse("SmartCollab is ready to assist you.")}
              disabled={speaking}
              className="ml-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title="Play Welcome"
            >
              <Volume2 size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
