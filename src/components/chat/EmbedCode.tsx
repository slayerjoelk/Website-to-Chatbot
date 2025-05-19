import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface EmbedCodeProps {
  chatbotId: string;
}

export function EmbedCode({ chatbotId }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script>
  (function(w,d,s,o,f,js,fjs){
    w['INeedABot']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','inab','https://cdn.ineedabot.com/widget.js'));
  inab('init', '${chatbotId}');
</script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Embed Code</h3>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 rounded-md bg-white px-2 py-1 text-sm text-gray-600 shadow-sm hover:bg-gray-50"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ClipboardIcon className="h-4 w-4" />
          )}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-white">
        <code>{embedCode}</code>
      </pre>
    </div>
  );
}