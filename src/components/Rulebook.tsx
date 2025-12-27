import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { RULEBOOK_CONTENT } from './RulebookContent';

interface RulebookProps {
    onClose: () => void;
    theme: 'light' | 'dark';
}

export const Rulebook: React.FC<RulebookProps> = ({ onClose, theme }) => {
    const [page, setPage] = useState(0);
    const [lang, setLang] = useState<'en' | 'zh'>('zh');

    const content = RULEBOOK_CONTENT[page];
    const totalPages = RULEBOOK_CONTENT.length;

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`rounded-2xl w-[90%] max-w-2xl h-[80vh] flex flex-col shadow-2xl relative overflow-hidden transition-colors duration-500
                ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between p-4 border-b transition-colors duration-500 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50/50'}`}
                >
                    <div className="flex items-center gap-2 text-emerald-400">
                        <BookOpen size={20} />
                        <h2 className="font-bold text-lg">
                            {lang === 'en' ? 'Rulebook' : '游戏说明书'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setLang((l) => (l === 'en' ? 'zh' : 'en'))}
                            className={`px-3 py-1 rounded-full border text-xs font-bold transition-colors
                                ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {lang === 'en' ? '中文' : 'EN'}
                        </button>
                        <button
                            onClick={onClose}
                            className={`${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {content && (
                        <>
                            <h3
                                className={`text-2xl font-bold mb-6 pb-2 border-b transition-colors duration-500 ${theme === 'dark' ? 'text-white border-slate-800' : 'text-slate-800 border-slate-200'}`}
                            >
                                {content.title?.[lang] || 'Untitled'}
                            </h3>
                            <div
                                className={`leading-relaxed whitespace-pre-wrap text-sm md:text-base ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
                            >
                                {content.body?.[lang] || 'No content available.'}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer / Pagination */}
                <div
                    className={`p-4 border-t flex items-center justify-between transition-colors duration-500 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50/50'}`}
                >
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold
                            ${theme === 'dark' ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                        <ChevronLeft size={16} />
                        {lang === 'en' ? 'Prev' : '上一页'}
                    </button>

                    <span className="text-slate-500 font-mono text-sm">
                        {page + 1} / {totalPages}
                    </span>

                    <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold
                            ${theme === 'dark' ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                        {lang === 'en' ? 'Next' : '下一页'}
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
