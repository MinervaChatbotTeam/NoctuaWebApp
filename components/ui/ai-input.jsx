import { AnimatePresence, motion } from "framer-motion";
import { Globe, Paperclip, Plus, Send } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "../../lib/utils";
import { Textarea } from "./textarea";

function useAutoResizeTextarea({
  minHeight,
  maxHeight
}) {
  const textareaRef = useRef(null)

  const adjustHeight = useCallback((reset) => {
    const textarea = textareaRef.current
    if (!textarea) return

    if (reset) {
      textarea.style.height = `${minHeight}px`
      return
    }

    textarea.style.height = `${minHeight}px`
    const newHeight = Math.max(
      minHeight,
      Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
    )

    textarea.style.height = `${newHeight}px`
  }, [minHeight, maxHeight])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const MIN_HEIGHT = 48
const MAX_HEIGHT = 164

export default function AiInput({ message, setMessage, handleSend, loading, searchActive, setSearchActive, onFileChange }) {
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })

  const handleSubmit = () => {
    if (message.trim()) {
      handleSend();
      adjustHeight(true);
    }
  }

  const handleClose = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setImagePreview(null)
  }

  const handleChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      setImagePreview(URL.createObjectURL(file))
      if (onFileChange) {
        onFileChange(file)
      }
    }
  }

  useEffect(() => {
    adjustHeight();
  }, [message, adjustHeight]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    };
  }, [imagePreview])
  
  // Define a consistent color theme that matches with the rest of the UI
  const theme = {
    primary: "bg-blue-600", // Matching blue from ChatWindow
    primaryHover: "hover:bg-blue-500",
    primaryBorder: "border-blue-500",
    primaryText: "text-blue-100",
    secondary: "bg-gray-800/80",
    secondaryHover: "hover:bg-gray-700/80",
    input: "bg-gray-900/60",
    text: "text-white",
    textMuted: "text-gray-400",
    border: "border-white/20", // More subtle border
    disabled: "opacity-50 cursor-not-allowed"
  }
  
  return (
    <div className="w-full py-4">
      <div className="relative border rounded-xl border-white/20 p-1 w-full shadow-lg bg-gradient-to-b from-gray-800/30 to-gray-900/30 backdrop-blur-sm">
        <div className="relative rounded-lg border border-white/10 bg-gray-900/60 flex flex-col backdrop-blur-sm">
          {/* Input area */}
          <div className="overflow-y-auto" style={{ maxHeight: `${MAX_HEIGHT}px` }}>
            <div className="relative">
              <Textarea
                id="ai-input-04"
                value={message}
                placeholder=""
                className={cn(
                  "w-full rounded-lg rounded-b-none px-4 py-3 border-none resize-none focus-visible:ring-1 focus-visible:ring-blue-500/50 leading-[1.2]",
                  theme.input,
                  theme.text
                )}
                ref={textareaRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                onChange={(e) => {
                  setMessage(e.target.value)
                  adjustHeight()
                }}
                disabled={loading}
              />
              {/* Placeholder text */}
              {!message && (
                <div className="absolute left-4 top-3">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={searchActive ? "search" : "ask"}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className={cn("pointer-events-none w-[150px] text-sm absolute", theme.textMuted)}>
                      {searchActive ? "Search the web..." : "Ask Noctua..."}
                    </motion.p>
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className={cn("h-12 rounded-b-lg backdrop-blur-sm", theme.input)}>
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              {/* File attachment button */}
              <label
                className={cn(
                  "cursor-pointer relative rounded-full p-2 transition-all shadow-sm",
                  imagePreview
                    ? `${theme.primary} border ${theme.primaryBorder} ${theme.text}`
                    : `${theme.secondary} ${theme.text} ${theme.secondaryHover}`
                )}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleChange} 
                  className="hidden" 
                  disabled={loading}
                />
                <Paperclip
                  className={cn(
                    "w-4 h-4 transition-colors",
                    imagePreview ? theme.text : theme.text
                  )} />
                
                {/* Image preview with subtle border */}
                {imagePreview && (
                  <div className="absolute w-[100px] h-[100px] top-14 -left-4 shadow-lg">
                    <Image
                      className="object-cover rounded-lg border border-blue-400/50" // Subtle border
                      src={imagePreview}
                      height={500}
                      width={500}
                      alt="additional image" />
                    <button
                      onClick={handleClose}
                      className="bg-gray-800 border border-blue-500/50 text-white absolute -top-1 -left-1 shadow-md rounded-full rotate-45 p-1">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </label>
              
              {/* Search toggle button */}
              <button
                type="button"
                onClick={() => {
                  setSearchActive(!searchActive)
                }}
                className={cn(
                  "rounded-full transition-all flex items-center gap-2 px-2 py-1 border h-8 shadow-sm",
                  searchActive
                    ? `${theme.primary} ${theme.primaryBorder} ${theme.text}`
                    : `${theme.secondary} border-white/10 ${theme.text} ${theme.secondaryHover}`
                )}>
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{
                      rotate: searchActive ? 180 : 0,
                      scale: searchActive ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: searchActive ? 180 : 15,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}>
                    <Globe className={cn("w-4 h-4", theme.text)} />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {searchActive && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn("text-sm overflow-hidden whitespace-nowrap flex-shrink-0", theme.text)}>
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            
            {/* Send button */}
            <div className="absolute right-3 bottom-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={cn(
                  "rounded-full p-2 transition-all shadow-sm", 
                  message.trim()
                    ? `${theme.primary} ${theme.text} ${theme.primaryHover}`
                    : `${theme.secondary} ${theme.text} ${theme.secondaryHover}`,
                  loading && theme.disabled
                )}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}