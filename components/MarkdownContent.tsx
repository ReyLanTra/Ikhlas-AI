
import React from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className }) => {
  const parseContent = (text: string) => {
    let lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers ###
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold gold-shimmer mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      
      // Horizontal Rule ---
      if (line.trim() === '---') {
        return <hr key={index} className="my-6 border-white/10" />;
      }

      // Bullets --, - , or * 
      if (line.startsWith('-- ') || line.startsWith('- ') || line.startsWith('* ')) {
        const cleanLine = line.replace(/^(-- |- |\* )/, '');
        return <li key={index} className="ml-4 list-disc marker:text-amber-500 text-slate-300 mb-1">{parseInLine(cleanLine)}</li>;
      }

      return <p key={index} className="mb-3">{parseInLine(line)}</p>;
    });
  };

  const parseInLine = (text: string) => {
    // Bold **text**
    let parts: (string | React.ReactNode)[] = [text];
    
    // Process Bold **
    const boldRegex = /\*\*(.*?)\*\*/g;
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const matches = part.split(boldRegex);
      return matches.map((m, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-amber-500">{m}</strong> : m);
    });

    // Process Italic *
    const italicRegex = /\*(.*?)\*/g;
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const matches = part.split(italicRegex);
      return matches.map((m, i) => i % 2 === 1 ? <em key={i} className="italic text-slate-400">{m}</em> : m);
    });

    return parts;
  };

  return <div className={className}>{parseContent(content)}</div>;
};

export default MarkdownContent;
