import React, { useState } from 'react'
import './sidebar.css'
import { assets } from '../assets/assets'
import { useDispatch, useSelector } from 'react-redux'
import { setChatIndex, toggleNewChat } from '../features/promptSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiMessageSquare, FiHelpCircle, FiActivity, FiSettings, FiMenu } from 'react-icons/fi'

function Sidebar() {
  const [menu, setMenu] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const allHistory = useSelector(state => state.prompt.historyArr)
  const newChat = useSelector(state => state.prompt.newChat)
  const chatIndex = useSelector(state => state.prompt.chatIndex)
  const dispatch = useDispatch()

  const handleChat = () => {
    dispatch(toggleNewChat(true))
  }

  const handleChatIndex = (i) => {
    dispatch(setChatIndex(i))
  }

  // Animation variants
  const sidebarVariants = {
    collapsed: { width: 80 },
    expanded: { width: 260 }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05 }
    })
  }

  return (
    <motion.div 
      className="sideBar"
      initial={false}
      animate={menu ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="upperSide">
        <motion.button 
          className='menu'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMenu(prev => !prev)}
        >
          <FiMenu size={24} />
        </motion.button>

        <motion.button 
          className='plus plus1' 
          onClick={handleChat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus size={18} className='plusImg' />
          <AnimatePresence>
            {menu && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                New Chat
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {menu && (
            <motion.div 
              className="recent"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.span 
                className='recentText'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Recent
              </motion.span>
              
              <div className="scroll">
                {allHistory.map((conv, index) => {
                  if(conv.length > 0) {
                    let s = conv[0].parts[0].text.slice(0, 17)
                    return (
                      <motion.div 
                        key={index}
                        className="recentTabs"
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                        onHoverStart={() => setHoveredItem(index)}
                        onHoverEnd={() => setHoveredItem(null)}
                      >
                        <button 
                          className={
                            chatIndex===index || (chatIndex===-1 && index===allHistory.length-1) 
                              ? "high tab" 
                              : "tab"
                          } 
                          onClick={() => handleChatIndex(index)}
                        >
                          <FiMessageSquare size={18} />
                          <AnimatePresence>
                            {menu && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                {s}...
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </button>
                      </motion.div>
                    )
                  }
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="lowerSide">
        {[
          { icon: <FiHelpCircle size={18} />, text: "Help" },
          { icon: <FiActivity size={18} />, text: "Activity" },
          { icon: <FiSettings size={18} />, text: "Settings" }
        ].map((item, index) => (
          <motion.button 
            key={index}
            className='btns'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {item.icon}
            <AnimatePresence>
              {menu && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  {item.text}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default Sidebar