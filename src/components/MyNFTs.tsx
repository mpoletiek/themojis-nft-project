/* eslint-disable  @typescript-eslint/no-explicit-any */
/* eslint-disable  @next/next/no-img-element */

'use client'
import { useState, useEffect, useCallback, useContext } from 'react';
import { toaster } from "@/components/ui/toaster"
import { buildTransactionUrl, validateAddress, ipfsToHttp } from '@/utils/quaisUtils';
import { quais } from 'quais';
import TheMojis from '../../artifacts/contracts/TheMojis.sol/TheMojis.json';
import { StateContext } from '@/app/store';

interface MyNFTsProps {
  contractAddress: string;
  account: any;
}

interface OwnedNFT {
  tokenId: number;
  name: string;
  image: string; // resolved http url ('' if unavailable)
}

// How many ownerOf() calls to fire concurrently while scanning for owned tokens.
const SCAN_BATCH_SIZE = 25;

export default function MyNFTs({ contractAddress, account }: MyNFTsProps) {
  const { web3Provider, rpcProvider } = useContext(StateContext);
  const [nfts, setNfts] = useState<OwnedNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch the metadata (name + image) for a single owned token.
  const fetchMetadata = useCallback(
    async (contract: any, tokenId: number): Promise<OwnedNFT> => {
      const base: OwnedNFT = { tokenId, name: `The Mojis #${tokenId}`, image: '' };
      try {
        const tokenURI: string = await contract.tokenURI(tokenId);
        const res = await fetch(ipfsToHttp(tokenURI));
        if (!res.ok) return base;
        const meta = await res.json();
        return {
          tokenId,
          name: meta?.name || base.name,
          image: meta?.image ? ipfsToHttp(meta.image) : '',
        };
      } catch {
        return base;
      }
    },
    []
  );

  // Discover which tokens the connected account owns. The contract is not
  // ERC721Enumerable, so we scan ownerOf() across every minted token id
  // (0..tokenIds-1), skipping burned tokens, and stop once we've found them all.
  const fetchOwnedNFTs = useCallback(async () => {
    if (!account?.addr) return;
    // Prefer the read-only rpc provider; fall back to the wallet signer.
    const reader = rpcProvider || (web3Provider ? await web3Provider.getSigner() : null);
    if (!reader) return;

    setLoading(true);
    setError('');
    try {
      const contract = new quais.Contract(contractAddress, TheMojis.abi, reader);
      const owner = account.addr.toLowerCase();
      const balance = Number(await contract.balanceOf(account.addr));
      const minted = Number(await contract.tokenIds());

      if (balance === 0 || minted === 0) {
        setNfts([]);
        return;
      }

      const ownedIds: number[] = [];
      for (let start = 0; start < minted && ownedIds.length < balance; start += SCAN_BATCH_SIZE) {
        const batch: Promise<number | null>[] = [];
        for (let id = start; id < Math.min(start + SCAN_BATCH_SIZE, minted); id++) {
          batch.push(
            contract
              .ownerOf(id)
              .then((o: string) => (o.toLowerCase() === owner ? id : null))
              .catch(() => null) // token burned / nonexistent
          );
        }
        const results = await Promise.all(batch);
        for (const id of results) {
          if (id !== null) ownedIds.push(id);
        }
      }

      const owned = await Promise.all(ownedIds.map((id) => fetchMetadata(contract, id)));
      owned.sort((a, b) => a.tokenId - b.tokenId);
      setNfts(owned);
    } catch (err: any) {
      console.error('Error loading owned NFTs:', err);
      setError(err?.reason || err?.message || 'Failed to load your NFTs');
      setNfts([]);
    } finally {
      setLoading(false);
    }
  }, [account, contractAddress, rpcProvider, web3Provider, fetchMetadata]);

  useEffect(() => {
    fetchOwnedNFTs();
  }, [fetchOwnedNFTs]);

  const handleTransfer = (tokenId: number, recipient: string) => {
    toaster.promise(
      (async () => {
        const contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
        const tx = await contract.transferFrom(account.addr, recipient, tokenId);
        const txReceipt = await tx.wait();
        return { result: txReceipt, method: 'Transfer' };
      })(),
      {
        loading: {
          title: 'Broadcasting Transfer',
          description: `Transferring NFT #${tokenId}...`,
        },
        success: (data: any) => {
          // Optimistically drop the transferred NFT, then re-sync from chain.
          setNfts((prev) => prev.filter((n) => n.tokenId !== tokenId));
          fetchOwnedNFTs();
          return {
            title: 'Transfer Successful',
            description: (
              <>
                {data?.result?.hash ? (
                  <a className="underline" href={buildTransactionUrl(data.result.hash)} target="_blank">
                    View In Explorer
                  </a>
                ) : (
                  <p>{data?.method} : {data?.result}</p>
                )}
              </>
            ),
            duration: 10000,
          };
        },
        error: (err: any) => ({
          title: 'Transfer Failed',
          description: err?.reason || err?.message || 'An unknown error occurred',
          duration: 10000,
        }),
      }
    );
  };

  if (!account) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-4">
          <span className="text-purple-400 font-semibold text-sm">🖼️ My Collection</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">NFTs You Own</h3>
        <p className="text-gray-400 text-base">Browse the Mojis in your wallet and transfer them to another address</p>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => fetchOwnedNFTs()}
          disabled={loading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm text-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {loading && nfts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">⏳</span>
          </div>
          <p className="text-gray-400 text-lg">Scanning the blockchain for your NFTs...</p>
        </div>
      ) : !loading && nfts.length === 0 && !error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🫥</span>
          </div>
          <p className="text-gray-400 text-lg">You don&apos;t own any Mojis yet</p>
          <p className="text-gray-500 text-sm mt-1">Mint one above to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <NFTCard key={nft.tokenId} nft={nft} onTransfer={handleTransfer} />
          ))}
        </div>
      )}
    </div>
  );
}

interface NFTCardProps {
  nft: OwnedNFT;
  onTransfer: (tokenId: number, recipient: string) => void;
}

function NFTCard({ nft, onTransfer }: NFTCardProps) {
  const [showTransfer, setShowTransfer] = useState(false);
  const [recipient, setRecipient] = useState('');

  const isValid = recipient.trim() !== '' && validateAddress(recipient);

  const submit = () => {
    if (!isValid) return;
    onTransfer(nft.tokenId, recipient.trim());
    setRecipient('');
    setShowTransfer(false);
  };

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="aspect-square bg-black/20 flex items-center justify-center p-4">
        {nft.image ? (
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl">🖼️</span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-3">
          <p className="text-white font-semibold text-sm truncate" title={nft.name}>{nft.name}</p>
          <p className="text-gray-400 text-xs mt-1">Token ID: {nft.tokenId}</p>
        </div>

        {!showTransfer ? (
          <button
            onClick={() => setShowTransfer(true)}
            className="mt-auto w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-all duration-300"
          >
            📤 Transfer
          </button>
        ) : (
          <div className="mt-auto space-y-2">
            <input
              onChange={(e) => setRecipient(e.target.value)}
              type="text"
              className="input-modern w-full py-2 text-sm"
              placeholder="Recipient address"
              value={recipient}
            />
            {recipient.trim() !== '' && !validateAddress(recipient) && (
              <p className="text-red-400 text-xs">Invalid address</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={!isValid}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
              <button
                onClick={() => {
                  setShowTransfer(false);
                  setRecipient('');
                }}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm text-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
