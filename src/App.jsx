import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMic, FiImage, FiUser, FiLoader } from 'react-icons/fi';
import { RiGeminiLine } from 'react-icons/ri';
import './App.css';
import { useSelector, useDispatch } from 'react-redux';
import { 
  addHistory, 
  deleteHistory, 
  localHistory, 
  setChatIndex, 
  toggleNewChat, 
  updateHistory 
} from './features/promptSlice';
import { run } from './config/gemini.js';

function App() {
  const [input, setInput] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const allHistory = useSelector(state => state.prompt.historyArr);
  const newChat = useSelector(state => state.prompt.newChat);
  const chatIndex = useSelector(state => state.prompt.chatIndex);
  const dispatch = useDispatch();

  // Animation variants
  const chatVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0 }
  };

  const bubbleVariants = {
    user: { x: 50, opacity: 0 },
    model: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1 }
  };

  // Handler functions
  const handleAdd = (conv) => dispatch(addHistory(conv));
  const handleUpdate = (conv) => dispatch(updateHistory(conv));
  const handleDelete = (index) => dispatch(deleteHistory(index));
  const handleChat = () => dispatch(toggleNewChat(false));
  const handleChatIndex = (index) => dispatch(setChatIndex(index));
  const handleAllHistory = () => {
    const history = JSON.parse(localStorage.getItem("historyArr"));
    if (history) dispatch(localHistory(history));
  };

  useEffect(() => {
    handleAllHistory();
    inputRef.current?.focus();
  }, []);

  // Robust response formatting
  const formatResponse = (text) => {
    if (text === undefined || text === null) return "";
    
    const safeText = typeof text === 'string' ? text : JSON.stringify(text);
    
    try {
      return safeText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
        .replace(/\n/g, '<br>');
    } catch (error) {
      console.error("Error formatting response:", error);
      return safeText;
    }
  };

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("historyArr", JSON.stringify(allHistory));
  }, [allHistory]);

  // Handle chat index changes
  useEffect(() => {
    if (chatIndex >= 0) {
      setConversationHistory([...allHistory[chatIndex]]);
    }
  }, [chatIndex, allHistory]);

  // Handle new chat
  useEffect(() => {
    if (newChat) {
      setConversationHistory([]);
      handleChat();
      handleChatIndex(-1);
    }
  }, [newChat]);

  // Auto-scroll and manage history
  useEffect(() => {
    if (conversationHistory.length === 1) {
      handleAdd(conversationHistory);
    }
    
    if (bottomRef.current) {
      setTimeout(() => {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [conversationHistory]);

  // Main chat function with proper response handling
  const handleRun = async () => {
    if (input.trim() === "") return;
    
    const prompt = input;
    setInput("");
    
    // Add user message
    setConversationHistory(prev => [
      ...prev,
      { role: "user", parts: [{ text: prompt }] }
    ]);
    
    setLoading(true);
    
    try {
      const result = await run(conversationHistory, prompt);
      
      // Handle both the object and string response cases
      const responseText = result?.response || result;
      
      // Add AI response
      setConversationHistory(prev => [
        ...prev,
        { 
          role: "model", 
          parts: [{ 
            text: typeof responseText === 'string' ? responseText : JSON.stringify(responseText) 
          }] 
        }
      ]);
      
      if (conversationHistory.length > 1) {
        handleUpdate(conversationHistory);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setConversationHistory(prev => [
        ...prev,
        { role: "model", parts: [{ text: "Sorry, I encountered an error. Please try again." }] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Suggested prompts
  const suggestions = [
    {
      text: "Compare the differences between pickleball and tennis",
      icon: <RiGeminiLine className="text-purple-500" />
    },
    {
      text: "Recommend new types of water sports, including pros & cons",
      icon: <FiLoader className="text-blue-500" />
    },
    {
      text: "Brainstorm team bonding activities for our work retreat",
      icon: <FiUser className="text-green-500" />
    },
    {
      text: "What is React js and what is its importance",
      icon: <FiImage className="text-yellow-500" />
    }
  ];

  return (
    <div className="App bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="top p-4 flex justify-between items-center border-b dark:border-gray-700">
        <motion.div 
          className="title flex items-center gap-2 text-xl font-semibold dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <RiGeminiLine className="text-purple-600 dark:text-purple-400" />
          <span>Gemini</span>
        </motion.div>
        <div className="userIcon w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
          <FiUser className="text-gray-600 dark:text-gray-300" />
        </div>
      </div>

      {/* Chat Container */}
      <div className={`midContainer ${conversationHistory.length > 0 ? 'chatContainer' : ''}`}>
        <AnimatePresence>
          {conversationHistory.length === 0 ? (
            <motion.div
              className="emptyState"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="greet text-center mb-8">
                <motion.h1 
                  className="colorGreet text-3xl font-bold mb-2 dark:text-white"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                >
                  Hello, Dev.
                </motion.h1>
                <p className="text-gray-600 dark:text-gray-400">
                  How can I help you today?
                </p>
              </div>

              <div className="suggestion grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    className="sgBtn p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-3"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInput(suggestion.text)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                  >
                    <div className="sgImg w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {suggestion.icon}
                    </div>
                    <span className="sgTxt text-sm text-gray-700 dark:text-gray-300">
                      {suggestion.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="chatArea">
              {conversationHistory.map((convo, index) => (
                <motion.div
                  key={`convo-${index}`}
                  className={`chat flex ${convo.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  variants={chatVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`flex items-start gap-3 max-w-3xl ${convo.role === 'user' ? 'flex-row-reverse' : ''}`}
                    variants={bubbleVariants}
                    initial={convo.role === 'user' ? 'user' : 'model'}
                    animate="animate"
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`chatImg w-8 h-8 rounded-full flex items-center justify-center ${convo.role === 'user' ? 'bg-gray-200 dark:bg-gray-600' : 'bg-purple-100 dark:bg-purple-900'}`}>
                      {convo.role === 'user' ? (
                        <FiUser className="text-gray-600 dark:text-gray-300" />
                      ) : (
                        <RiGeminiLine className="text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div 
                      className={`chatText p-3 rounded-xl ${convo.role === 'user' 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}
                      dangerouslySetInnerHTML={{ __html: formatResponse(convo.parts[0]?.text) }}
                    />
                  </motion.div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  className="chat flex justify-start mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="chatImg w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <RiGeminiLine className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="loaderBubble p-3 rounded-xl bg-gray-100 dark:bg-gray-700 rounded-bl-none">
                      <div className="flex gap-1">
                        <div className="dot w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="dot w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="dot w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="Footer p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="Search flex items-center gap-2 mb-2">
          <motion.div 
            className="flex-1 relative"
            whileHover={{ scale: 1.01 }}
          >
            <input
              type="text"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleRun();
                }
              }}
              placeholder="Enter a prompt here"
              className="searchBar w-full p-3 pr-12 rounded-full border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
            <div className="absolute right-3 top-3 flex gap-1">
              <button className="srhBtn p-1 text-gray-500 hover:text-purple-500">
                <FiImage />
              </button>
              <button className="srhBtn p-1 text-gray-500 hover:text-purple-500">
                <FiMic />
              </button>
            </div>
          </motion.div>
          
          {input && (
            <motion.button
              className="srhBtn p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700"
              onClick={handleRun}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiSend />
            </motion.button>
          )}
        </div>
        
        <div className="info text-xs text-center text-gray-500 dark:text-gray-400">
          Gemini may display inaccurate info, including about people, so double-check its responses.
          <button className="infBtn ml-1 text-purple-600 dark:text-purple-400 hover:underline">
            Your privacy and Gemini Apps
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;