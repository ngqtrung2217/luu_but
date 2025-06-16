"use client";

import { useState, useEffect } from "react";
import ReactFullpage from "@fullpage/react-fullpage";
import { motion } from "@/utils/motion";
import GuestbookForm from "./GuestbookForm";
import Navigation from "./Navigation";
// RandomQuote import removed
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// GitHub imports removed
import Confetti from "react-confetti";
import Image from "next/image";

// Define an array of background images for a more dynamic experience
const BACKGROUNDS = [
  "/images/backgrounds/dark-abstract-1.svg",
  "/images/backgrounds/dark-cosmic.svg",
  "/images/backgrounds/dark-grid.svg",
];

// Optional: Only load fullpage.js license key if in production
const fullpageLicenseKey = process.env.NEXT_PUBLIC_FULLPAGE_LICENSE_KEY || "";

export default function FullPageScroll() {
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [currentBackground, setCurrentBackground] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Show confetti briefly when the page loads
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    // Set up automatic background rotation every 30 seconds
    const backgroundTimer = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % BACKGROUNDS.length);
    }, 30000);

    return () => {
      clearInterval(backgroundTimer);
    };
  }, []);

  if (!mounted) {
    // Return a placeholder with the same height to prevent layout shift
    return <div className="min-h-screen bg-gray-900" />;
  }
  return (
    <>
      <Navigation activeSection={activeSection} />
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {/* Confetti effect on load */}
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 300}
          height={typeof window !== "undefined" ? window.innerHeight : 300}
          recycle={false}
          numberOfPieces={200}
          gravity={0.05}
          colors={["#58a6ff", "#9c36b5", "#1f6feb", "#238636", "#f78166"]}
        />
      )}
      <ReactFullpage
        licenseKey={fullpageLicenseKey}
        scrollingSpeed={1000}
        navigation={true}
        navigationPosition="right"
        navigationTooltips={["Trang chủ", "Lưu bút", "Liên hệ"]}
        showActiveTooltip={true}
        credits={{ enabled: false }}
        scrollOverflow={true}
        easing="cubic-bezier(0.77, 0, 0.175, 1)" // Smooth easing similar to Uniqlo's website
        afterLoad={(origin, destination) => {
          setActiveSection(destination.index);
        }}
        render={({ fullpageApi }: { fullpageApi: { moveSectionDown: () => void; moveTo: (section: number, slide?: number) => void } }) => {
          return (
            <ReactFullpage.Wrapper>
              {/* Welcome Section */}
              <div className="section bg-[#0d1117] overflow-hidden relative">
                {/* GitHub-inspired background elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-[10%] left-[15%] w-40 h-40 rounded-full bg-purple-600 blur-[100px] animate-pulse"></div>
                  <div
                    className="absolute top-[50%] right-[20%] w-60 h-60 rounded-full bg-blue-600 blur-[120px] animate-pulse"
                    style={{ animationDelay: "2s", animationDuration: "8s" }}
                  ></div>
                  <div
                    className="absolute bottom-[15%] left-[30%] w-40 h-40 rounded-full bg-indigo-600 blur-[100px] animate-pulse"
                    style={{ animationDelay: "1s", animationDuration: "10s" }}
                  ></div>
                </div>

                {/* Adding dynamic background image */}
                <div className="absolute inset-0 z-[-1]">
                  <Image
                    src={BACKGROUNDS[currentBackground]}
                    alt="Dark theme background"
                    fill
                    className="object-cover mix-blend-soft-light opacity-80"
                    priority
                  />
                </div>
                {/* Overlay for better contrast */}
                <div className="absolute inset-0 bg-black/30 z-[-1]"></div>

                {/* GitHub-style contribution grid animation */}
                <div className="absolute inset-0 opacity-5">
                  <div className="grid grid-cols-12 gap-1 p-10">
                    {Array.from({ length: 120 }).map((_, i) => (
                      <motion.div
                        key={`grid-item-${i}`}
                        className="aspect-square rounded-sm bg-green-500"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: Math.random() > 0.7 ? [0, 0.5, 0] : 0,
                          scale: Math.random() > 0.7 ? [0, 1, 0] : 0,
                        }}
                        transition={{
                          duration: 4,
                          delay: Math.random() * 10,
                          repeat: Infinity,
                          repeatDelay: Math.random() * 20 + 5,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                  >
                    {" "}
                    {/* Logo removed */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="text-5xl md:text-7xl font-bold text-white mb-6"
                    >
                      {" "}
                      Lưu bút{" "}
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        Của Trung
                      </span>
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                      className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
                    >
                      Nơi lưu giữ những kỷ niệm, cảm xúc và gửi gắm những lời
                      nhắn nhủ đầy ý nghĩa về những cuộc gặp gỡ định mệnh
                    </motion.p>
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fullpageApi?.moveSectionDown()}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full transition-all duration-300 font-medium text-lg flex items-center mx-auto shadow-lg shadow-purple-500/20"
                    >
                      Để lại lưu bút
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </motion.button>
                  </motion.div>
                </div>
              </div>
              {/* Guestbook Form Section */}
              <div className="section bg-[#171b21] overflow-hidden relative">
                {/* Background elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-[20%] right-[10%] w-40 h-40 rounded-full bg-blue-600 blur-[100px] animate-pulse"></div>
                  <div
                    className="absolute bottom-[30%] left-[5%] w-60 h-60 rounded-full bg-indigo-600 blur-[120px] animate-pulse"
                    style={{ animationDelay: "3s", animationDuration: "15s" }}
                  ></div>
                </div>

                {/* Uniqlo-style vertical lines for texture with animation */}
                <div className="absolute inset-0">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={`v-line-${i}`}
                      className="absolute h-full w-px bg-gray-800 opacity-20"
                      style={{ left: `${i * 5}%` }}
                      initial={{ height: "0%" }}
                      animate={{
                        height: ["0%", "100%", "100%", "0%"],
                        top: ["100%", "0%", "0%", "0%"],
                      }}
                      transition={{
                        duration: 8,
                        delay: (i * 0.2) % 2,
                        repeat: Infinity,
                        repeatDelay: 10,
                      }}
                    ></motion.div>
                  ))}
                </div>

                <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10">
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="w-full max-w-2xl"
                  >
                    <motion.h2
                      className="text-3xl md:text-4xl font-bold text-white mb-8 text-center"
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      Để lại <span className="text-blue-400">lưu bút</span> của
                      bạn
                    </motion.h2>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <p className="text-gray-300 mb-6 text-center">
                        Những cuộc gặp gỡ tưởng chừng như tình cờ, nhưng lại là
                        sự sắp đặt kỳ diệu của định mệnh. Hãy để lại dấu ấn của
                        bạn ở đây.
                      </p>
                      <GuestbookForm />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
              {/* Contact Section */}
              <div className="section bg-[#0d1117] overflow-hidden relative">
                {/* GitHub-inspired background elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-[30%] left-[60%] w-40 h-40 rounded-full bg-green-600 blur-[100px] animate-pulse"></div>
                  <div
                    className="absolute bottom-[20%] right-[30%] w-60 h-60 rounded-full bg-purple-600 blur-[120px] animate-pulse"
                    style={{ animationDelay: "1s", animationDuration: "12s" }}
                  ></div>
                </div>

                {/* Diagonal lines with animation */}
                <div className="absolute inset-0 overflow-hidden opacity-10">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={`diagonal-${i}`}
                      className="absolute w-[200%] h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent transform rotate-45"
                      style={{ top: `${i * 10}%`, left: "-50%" }}
                      initial={{ width: "0%" }}
                      animate={{
                        width: ["0%", "200%", "200%"],
                        x: ["-100%", "0%", "100%"],
                      }}
                      transition={{
                        duration: 15,
                        delay: i * 0.5,
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                    ></motion.div>
                  ))}
                </div>

                <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10">
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center max-w-2xl"
                  >
                    <motion.h2
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                      className="text-4xl font-bold text-white mb-6"
                    >
                      Liên <span className="text-green-400">hệ</span>
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="text-xl text-gray-300 mb-8"
                    >
                      Cảm ơn bạn đã ghé thăm và để lại lưu bút. Mỗi dòng lưu bút
                      là một kỷ niệm đẹp sẽ được lưu giữ mãi mãi.
                    </motion.p>

                    <motion.div
                      className="flex flex-col md:flex-row justify-center gap-4 md:gap-6"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <a
                        href="mailto:ngqtrung22.17@gmail.com"
                        className="flex items-center justify-center px-6 py-3 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg border border-[#30363d] hover:border-[#8b949e] transition-all duration-300 shadow-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Email
                      </a>
                      <a
                        href="https://www.facebook.com/ngtrung2217"
                        className="flex items-center justify-center px-6 py-3 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg border border-[#30363d] hover:border-[#8b949e] transition-all duration-300 shadow-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                        Mạng xã hội
                      </a>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      viewport={{ once: true }}
                      className="mt-10 text-gray-400 text-sm"
                    ></motion.div>
                  </motion.div>
                </div>
              </div>
            </ReactFullpage.Wrapper>
          );
        }}
      />
    </>
  );
}
