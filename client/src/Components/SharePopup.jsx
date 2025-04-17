import React, { useState } from "react";
import {
  FaFacebook,
  FaTwitter,
  FaReddit,
  FaWhatsapp,
  FaLinkedin,
  FaTelegram,
  FaLink,
} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

const SharePopup = ({ visible, onClose, code }) => {
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink || code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createShareLink = async () => {
    if (shareLink) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_API_URL}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      const newLink = `${window.location.origin}/share/${data.id}`;
      setShareLink(newLink);
    } catch (err) {
      alert("Failed to create share link.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    const encodedText = encodeURIComponent("Check out this Python code!");
    const url = shareLink;
    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${encodedText}`,
      telegram: `https://t.me/share/url?url=${url}&text=${encodedText}`,
    };

    window.open(links[platform], "_blank", "noopener,noreferrer");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-800 rounded-2xl p-6 w-full max-w-md relative border border-gray-700 shadow-xl"
        >
          <button
            onClick={() => {
              onClose();
              setShareLink("");
            }}
            className="absolute top-3 right-3 text-gray-400 hover:text-white"
          >
            <MdClose size={22} />
          </button>

          <h2 className="text-xl font-semibold text-white mb-4">
            Share Your Code
          </h2>

          {shareLink && (
            <div className="mb-4">
              <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-700 rounded-xl shadow-inner border border-gray-600">
                <div
                  className="flex-1 text-blue-500 text-sm font-mono truncate cursor-pointer"
                  onClick={handleCopy}
                >
                  {shareLink}
                </div>
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    copied
                      ? "bg-green-600 text-white cursor-default"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  disabled={copied}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {!shareLink && (
            <button
              onClick={createShareLink}
              disabled={loading}
              className={`w-full py-2 mb-4 rounded-lg text-sm font-semibold transition-all ${
                loading
                  ? "bg-gray-600 text-white cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Generating..." : "Create Shareable Link"}
            </button>
          )}

          {shareLink && (
            <>
              <p className="text-gray-300 text-sm mb-2">Share on:</p>
              <div className="grid grid-cols-4 gap-4 text-2xl text-white justify-items-center">
                <button
                  onClick={() => handleShare("twitter")}
                  className="hover:text-sky-400"
                >
                  <FaTwitter />
                </button>
                <button
                  onClick={() => handleShare("facebook")}
                  className="hover:text-blue-500"
                >
                  <FaFacebook />
                </button>
                <button
                  onClick={() => handleShare("reddit")}
                  className="hover:text-orange-500"
                >
                  <FaReddit />
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="hover:text-green-400"
                >
                  <FaWhatsapp />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="hover:text-blue-400"
                >
                  <FaLinkedin />
                </button>
                <button
                  onClick={() => handleShare("telegram")}
                  className="hover:text-sky-500"
                >
                  <FaTelegram />
                </button>
                <button
                  onClick={handleCopy}
                  className="hover:text-green-400 col-span-2"
                >
                  <FaLink />
                </button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SharePopup;
