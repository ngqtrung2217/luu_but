"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "@/utils/motion";
import { supabase } from "@/utils/supabase";
import Confetti from "react-confetti";
import { toast } from "react-toastify";
import Image from "next/image";

export default function GuestbookForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    // Set to empty string to hide the quote section
    setQuoteMessage("");

    // Auto-resize textarea handler function
    const autoResizeTextarea = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    // Initial resize and add event listener for subsequent changes
    autoResizeTextarea();

    window.addEventListener("resize", autoResizeTextarea);
    return () => {
      window.removeEventListener("resize", autoResizeTextarea);
    };
  }, []);

  // Handle message changes and auto-resize
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize as user types
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Vui lòng nhập nội dung lưu bút!");
      return;
    }

    setIsSubmitting(true);
    try {
      const entryData = {
        name: name.trim() || "Người bạn ẩn danh",
        message: message.trim(),
        email: email.trim() || null, // Include email in the database
      };

      const { error } = await supabase.from("luubut").insert([entryData]);

      if (error) throw error; // Send email notification via API endpoint
      try {
        await fetch("/api/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: entryData.name,
            message: entryData.message,
            email: email.trim() || undefined, // Use the email state directly
          }),
        });

        // Send thank you email if email is provided
        if (email.trim()) {
          await fetch("/api/thank-you", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: entryData.name,
              email: email.trim(),
            }),
          });
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue with success flow even if email fails
      } // Clear form and show success animation
      setName("");
      setEmail("");
      setMessage("");
      setShowConfetti(true);
      toast.success("Cảm ơn bạn đã gửi lưu bút! 💖");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể gửi lưu bút";
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Character counter colors based on length
  const getCounterColor = () => {
    const length = message.length;
    if (length === 0) return "text-gray-500";
    if (length < 50) return "text-red-500";
    if (length < 100) return "text-yellow-500";
    if (length < 300) return "text-green-500";
    if (length < 1000) return "text-blue-500";
    return "text-purple-500";
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 300}
          height={typeof window !== "undefined" ? window.innerHeight : 200}
          recycle={false}
          numberOfPieces={200}
          gravity={0.05}
          colors={["#58a6ff", "#9c36b5", "#1f6feb", "#238636", "#f78166"]}
        />
      )}{" "}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-lg border border-gray-700 bg-gray-800/60 backdrop-blur-sm shadow-xl overflow-hidden relative"
      >
        {/* Background image */}
        <div className="absolute inset-0 -z-10 opacity-40 overflow-hidden rounded-lg">
          <Image
            src="/images/backgrounds/form-background.svg"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>

        {/* Inspiration quote at the top */}
        {quoteMessage && (
          <div className="px-5 py-4 bg-gray-900/70 backdrop-blur-sm border-b border-purple-800/30">
            <p className="text-sm text-gray-300 italic">
              &ldquo;{quoteMessage}&rdquo;
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-5 py-6 relative z-10">
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block text-gray-400 mb-2 text-sm font-medium"
            >
              Tên của bạn{" "}
              <span className="text-gray-500">(không bắt buộc)</span>
            </label>
            <motion.div
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Người bạn ẩn danh"
                className="w-full p-3 rounded-md bg-gray-900 text-gray-200 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                maxLength={100}
              />
            </motion.div>
          </div>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-gray-400 mb-2 text-sm font-medium"
            >
              Email <span className="text-gray-500">(không bắt buộc)</span>
            </label>
            <motion.div
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full p-3 rounded-md bg-gray-900 text-gray-200 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
            </motion.div>
          </div>

          <div className="mb-5">
            {" "}
            <div className="flex justify-between mb-2">
              <label
                htmlFor="message"
                className="block text-gray-400 text-sm font-medium"
              >
                Lời nhắn của bạn <span className="text-purple-500">*</span>
              </label>
              <span className={`text-xs ${getCounterColor()}`}>
                {message.length} ký tự
              </span>
            </div>
            <motion.div
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {" "}
              <textarea
                id="message"
                value={message}
                onChange={handleMessageChange}
                placeholder="Hãy chia sẻ kỷ niệm, cảm xúc hoặc lời nhắn của bạn..."
                className="w-full p-3 rounded-md bg-gray-900 text-gray-200 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none"
                rows={5}
                required
                ref={textareaRef}
              />
            </motion.div>
            <p className="mt-1 text-xs text-gray-500">
              Hãy chia sẻ kỷ niệm, cảm xúc hoặc lời nhắn nhủ đầy ý nghĩa về
              những cuộc gặp gỡ định mệnh.
            </p>
          </div>

          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-6 py-2.5 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm flex items-center justify-center transition-all ${
                isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:from-purple-700 hover:to-indigo-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang gửi...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Gửi lưu bút
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
