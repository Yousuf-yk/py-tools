import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, FileOutput, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#9a0002] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full text-center mb-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#efe6dd]/30 bg-[#efe6dd]/10 px-4 py-2 text-xs font-semibold tracking-wide text-[#efe6dd]">
          <ShieldCheck className="h-4 w-4" />
          STUDENT PRODUCTIVITY SUITE
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Work Smarter with <span className="text-[#efe6dd]">Your PDFs</span>
        </h1>
        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
          Choose the tool that fits your needs. Optimize layouts to save paper, or extract pure text to a brand new flowing document.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Tool 1: PDF Optimizer */}
        <Link 
          to="/optimize" 
          className="group bg-[#efe6dd] rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          <div className="bg-[#9a0002] text-white p-5 rounded-2xl mb-6 shadow-md group-hover:bg-[#780002] transition-colors">
            <Scissors className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-[#171515] mb-3">PDF Optimizer</h2>
          <p className="text-[#171515]/70 mb-8">
            Crop blank margins, enhance ink clarity, and pack up to 4 pages onto a single sheet to save printing costs.
          </p>
          <span className="mt-auto font-bold text-[#9a0002] inline-flex items-center gap-2 group-hover:gap-3 transition-all">
            Open Tool →
          </span>
        </Link>

        {/* Tool 2: Text Extractor */}
        <Link 
          to="/extract" 
          className="group bg-[#efe6dd] rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          <div className="bg-[#9a0002] text-white p-5 rounded-2xl mb-6 shadow-md group-hover:bg-[#780002] transition-colors">
            <FileOutput className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-[#171515] mb-3">Pure Text Extractor</h2>
          <p className="text-[#171515]/70 mb-8">
            Extract text word-by-word into a continuous, flowing PDF with zero margins. Perfect for reading without distractions.
          </p>
          <span className="mt-auto font-bold text-[#9a0002] inline-flex items-center gap-2 group-hover:gap-3 transition-all">
            Open Tool →
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Home;