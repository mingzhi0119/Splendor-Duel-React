import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { RULEBOOK_CONTENT } from './RulebookContent';

export const Rulebook = ({ onClose }) => {
    const [page, setPage] = useState(0);
    const [lang, setLang] = useState('zh');

    const content = RULEBOOK_CONTENT[page];
    const totalPages = RULEBOOK_CONTENT.length;

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-[90%] max-w-2xl h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <BookOpen size={20} />
                        <h2 className="font-bold text-lg">{lang === 'en' ? 'Rulebook' : '游戏说明书'}</h2>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
                            className="px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
                        >
                            {lang === 'en' ? '中文' : 'EN'}
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-white mb-6 pb-2 border-b border-slate-800">
                        {content.title[lang]}
                    </h3>
                    <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                        {content.body[lang]}
                    </div>
                </div>

                {/* Footer / Pagination */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
                    <button 
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors text-sm font-bold"
                    >
                        <ChevronLeft size={16} />
                        {lang === 'en' ? 'Prev' : '上一页'}
                    </button>

                    <span className="text-slate-500 font-mono text-sm">
                        {page + 1} / {totalPages}
                    </span>

                    <button 
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors text-sm font-bold"
                    >
                        {lang === 'en' ? 'Next' : '下一页'}
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};