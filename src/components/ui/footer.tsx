interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer 
      className={`relative z-10 p-8 border-t border-coral-500/20 ${className}`}
    >
      <div 
        className="max-w-7xl mx-auto text-center space-y-6 text-gray-400"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a href="https://x.com/mpoletiek" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">@mpoletiek</a>
            <span>on</span>
            <a href="https://qu.ai/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">Quai Network</a>
          </div>
          
          <div className="flex items-center gap-2">
            <a href="https://github.com/mpoletiek/themojis-nft-project" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <span>📁 View on GitHub</span>
            </a>
          </div>
        </div>

        <div className="border-t border-coral-500/20 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span>Emojis by</span>
              <a href="https://openmoji.org/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">OpenMoji</a>
              <span>•</span>
              <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-80 transition-opacity">CC BY-SA 4.0</a>
            </div>
            
            <div className="flex items-center gap-2">
              <span>Powered by</span>
              <a href="https://pelaguswallet.io/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">Pelagus Wallet</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
