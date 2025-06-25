import { useState } from "react";
import { FaLinkedin, FaGithub } from "react-icons/fa";

import { ArrowUpRight, PenTool, Code, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const NameCard = () => {
  const [expanded, setExpanded] = useState(false);

  return expanded ? (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white p-10 overflow-auto"
      onClick={() => setExpanded(false)}
    >
      <div className="max-w-2xl space-y-6 cursor-pointer">
        <div className="flex items-center gap-4">
          <img
            src="/pfp.jpeg"
            alt="Hey, I'm Kyuho!"
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Kyuho Lee</h1>

        <p className="text-gray-700 text-base">
          I'm a designer and artist that codes, with experience across product,
          branding, and marketing. I strive to empower individuals and
          communities through crafting enjoyable, inclusive experiences.
        </p>
        <p className="text-gray-700 text-base">
          As a recent grad of the University of Pennsylvania, I'm now currently
          working on a few side projects. Open to chat about anything design,
          product, growth, or startups! Feel free to reach out to me at
          kyuho@upenn.edu :)
        </p>
        <div className="h-px bg-gradient-to-r from-gray-300 to-transparent" />
        <div className="flex gap-4 mt-auto pt-4">
          <a
            href="https://github.com/kyuhochoilee"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub className="w-5 h-5 text-gray-400 hover:text-gray-500 transition-opacity" />
          </a>
          <a
            href="https://linkedin.com/in/kyuholee0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className="w-5 h-5 text-gray-400 hover:text-gray-500 transition-opacity" />
          </a>
        </div>
      </div>
    </motion.div>
  ) : (
    <div
      onClick={() => setExpanded(!expanded)}
      className="relative flex flex-col space-y-3 card-glass p-5 transition-transform duration-500 hover:scale-102 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-row gap-3">
          <h2 className="text-xl font-semibold text-gray-600 tracking-tight leading-relaxed">
            Kyuho Lee
          </h2>
        </div>
        <a className="group relative flex items-center justify-end gap-1 text-gray-400  group-hover:text-gray-500 rounded-lg group-hover:bg-gray-100 p-1 pl-2 transition">
          <span className="text-xs text-gray-500  hidden group-hover:block text-right">
            About me
          </span>

          <ArrowUpRight className="w-4.5 h-4.5" />
        </a>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-pink-100 text-pink-700">
          <PenTool className="w-3 h-3" />
          Designer
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
          <Code className="w-3 h-3" />
          Fullstack
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
          <Sparkles className="w-3 h-3" />
          Creative
        </span>
      </div>
      <p className="text-gray-500">
        I bring creative ideas to life with design, code, and product strategy —
        crafting experiences that scale, resonate, and endure.
      </p>
    </div>
  );
};

export default NameCard;
