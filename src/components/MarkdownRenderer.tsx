'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IconButton, Tooltip, Box } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface MarkdownRendererProps {
  content: string;
  defaultLanguage?: string;
}

export default function MarkdownRenderer({ content, defaultLanguage = 'typescript' }: MarkdownRendererProps) {
  return (
    <div className="markdown-body" style={{ width: '100%', overflowX: 'auto' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          pre({ node, children, ...props }: any) {
            const codeNode = node?.children?.find((n: any) => n.tagName === 'code');
            
            if (codeNode) {
              const className = codeNode.properties?.className?.join(' ') || '';
              const match = /language-(\w+)/.exec(className);
              const language = match ? match[1] : defaultLanguage;
              
              // Extract text recursively from codeNode
              const extractText = (n: any): string => {
                if (n.type === 'text') return n.value;
                if (n.children) return n.children.map(extractText).join('');
                return '';
              };
              const codeString = extractText(codeNode).replace(/\n$/, '');

              return (
                <CodeBlockWithCopy language={language} code={codeString} />
              );
            }
            
            // Fallback
            return <pre {...props}>{children}</pre>;
          },
          code({ node, className, children, ...props }: any) {
             return (
              <code className={className} style={{ backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '4px', color: '#e83e8c' }} {...props}>
                {children}
              </code>
            );
          },
          table({ node, ...props }: any) {
            return (
              <div className="table-responsive mb-3">
                <table className="table table-bordered table-striped" {...props} />
              </div>
            );
          },
          img({ node, ...props }: any) {
            return <img className="img-fluid rounded shadow-sm my-2" style={{ maxWidth: '100%' }} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlockWithCopy({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ position: 'relative', mb: 2, mt: 2 }}>
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
        <Tooltip title={copied ? "Copied!" : "Copy code"}>
          <IconButton 
            onClick={handleCopy} 
            size="small" 
            sx={{ 
                color: '#d4d4d4', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                padding: '4px'
            }}
          >
            {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: '8px' }}
      >
        {code}
      </SyntaxHighlighter>
    </Box>
  );
}
