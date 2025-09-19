/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client'
import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { toaster } from "@/components/ui/toaster"
import { buildTransactionUrl } from '@/utils/quaisUtils';
import { quais } from 'quais';
import TheMojis from '../../artifacts/contracts/TheMojis.sol/TheMojis.json';
import { StateContext } from '@/app/store';

interface OwnerControlsProps {
  contractAddress: string;
  isOwner: boolean;
  account: any;
}

export default function OwnerControls({ contractAddress, isOwner, account }: OwnerControlsProps) {
  // Owner-specific state
  const [newSupply, setNewSupply] = useState(0);
  const [newBaseTokenURI, setNewBaseTokenURI] = useState('');
  const [newMaxMintPerAddress, setNewMaxMintPerAddress] = useState(0);
  const [whitelistAddress, setWhitelistAddress] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  // const [isWhitelisted, setIsWhitelisted] = useState(false);
  const { web3Provider } = useContext(StateContext);

  // Fetch current pause status on component mount
  useEffect(() => {
    const fetchPauseStatus = async () => {
      if (web3Provider && contractAddress) {
        try {
          const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, web3Provider);
          const pausedStatus = await ERC721contract.paused();
          setIsPaused(pausedStatus);
        } catch (error) {
          console.error('Error fetching pause status:', error);
        }
      }
    };

    fetchPauseStatus();
  }, [web3Provider, contractAddress]);

  const callContract = async (type: string) => {
    if(type == 'updateSupply'){
      try {
        const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
        if(newSupply > 0){
          console.log("New Supply Value: "+newSupply);
          const contractTransaction = await ERC721contract.updateSupply(newSupply);
          const txReceipt = await contractTransaction.wait();
          console.log(txReceipt);
          return Promise.resolve({ result: txReceipt, method: "updateSupply" });
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }
    else if(type == 'updateBaseTokenURI'){
      try {
        const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
        if(newBaseTokenURI.trim() !== ''){
          console.log("New Base Token URI: "+newBaseTokenURI);
          const contractTransaction = await ERC721contract.updateBaseTokenURI(newBaseTokenURI);
          const txReceipt = await contractTransaction.wait();
          console.log(txReceipt);
          return Promise.resolve({ result: txReceipt, method: "updateBaseTokenURI" });
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }
    else if(type == 'updateMaxMintPerAddress'){
      try {
        const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
        if(newMaxMintPerAddress > 0){
          console.log("New Max Mint Per Address: "+newMaxMintPerAddress);
          const contractTransaction = await ERC721contract.updateMaxMintPerAddress(newMaxMintPerAddress);
          const txReceipt = await contractTransaction.wait();
          console.log(txReceipt);
          return Promise.resolve({ result: txReceipt, method: "updateMaxMintPerAddress" });
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }
    else if(type == 'pause'){
      try {
        const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
        const contractTransaction = await ERC721contract.pause();
        const txReceipt = await contractTransaction.wait();
        console.log(txReceipt);
        return Promise.resolve({ result: txReceipt, method: "pause" });
      } catch (err) {
        return Promise.reject(err);
      }
    }
    else if(type == 'unpause'){
      try {
        const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
        const contractTransaction = await ERC721contract.unpause();
        const txReceipt = await contractTransaction.wait();
        console.log(txReceipt);
        return Promise.resolve({ result: txReceipt, method: "unpause" });
      } catch (err) {
        return Promise.reject(err);
      }
    }
    else if(type == 'addToWhitelist'){
      try {
        const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
        if(whitelistAddress.trim() !== ''){
          console.log("Adding to whitelist: "+whitelistAddress);
          const contractTransaction = await ERC721contract.addToWhitelist(whitelistAddress);
          const txReceipt = await contractTransaction.wait();
          console.log(txReceipt);
          return Promise.resolve({ result: txReceipt, method: "addToWhitelist" });
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }
    else if(type == 'removeFromWhitelist'){
      try {
        const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
        if(whitelistAddress.trim() !== ''){
          console.log("Removing from whitelist: "+whitelistAddress);
          const contractTransaction = await ERC721contract.removeFromWhitelist(whitelistAddress);
          const txReceipt = await contractTransaction.wait();
          console.log(txReceipt);
          return Promise.resolve({ result: txReceipt, method: "removeFromWhitelist" });
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };

  // HANDLE UPDATE SUPPLY
  const handleUpdateSupply = async () => {
    toaster.promise(
      callContract('updateSupply'),
      {
        loading: {
          title: 'Broadcasting Transaction',
          description: '',
        },
        success: (data: any) => (
          {
          title: 'Transaction Successful',
          description: (
            <>
              {data?.result?.hash ? (
                <a
                  className="underline"
                  href={buildTransactionUrl(data.result.hash)}
                  target="_blank"
                >
                  View In Explorer
                </a>
              ) : (
                <p>
                  {data?.method} : {data?.result}
                </p>
              )}
            </>
          ),
          duration: 10000,
        }),
        error: (error: any) => ({
          title: 'Error',
          description: error.reason || error.message || 'An unknown error occurred',
          duration: 10000,
        }),
      }
    );
  }


  // HANDLE UPDATE BASE TOKEN URI
  const handleUpdateBaseTokenURI = async () => {
    toaster.promise(
      callContract('updateBaseTokenURI'),
      {
        loading: {
          title: 'Broadcasting Transaction',
          description: '',
        },
        success: (data: any) => {
          setNewBaseTokenURI(''); // Clear the input field
          return {
            title: 'Transaction Successful',
            description: (
              <>
                {data?.result?.hash ? (
                  <a
                    className="underline"
                    href={buildTransactionUrl(data.result.hash)}
                    target="_blank"
                  >
                    View In Explorer
                  </a>
                ) : (
                  <p>
                    {data?.method} : {data?.result}
                  </p>
                )}
              </>
            ),
            duration: 10000,
          };
        },
        error: (error: any) => ({
          title: 'Error',
          description: error.reason || error.message || 'An unknown error occurred',
          duration: 10000,
        }),
      }
    );
  }

  // HANDLE UPDATE MAX MINT PER ADDRESS
  const handleUpdateMaxMintPerAddress = async () => {
    toaster.promise(
      callContract('updateMaxMintPerAddress'),
      {
        loading: {
          title: 'Broadcasting Transaction',
          description: '',
        },
        success: (data: any) => {
          setNewMaxMintPerAddress(0); // Clear the input field
          return {
            title: 'Transaction Successful',
            description: (
              <>
                {data?.result?.hash ? (
                  <a
                    className="underline"
                    href={buildTransactionUrl(data.result.hash)}
                    target="_blank"
                  >
                    View In Explorer
                  </a>
                ) : (
                  <p>
                    {data?.method} : {data?.result}
                  </p>
                )}
              </>
            ),
            duration: 10000,
          };
        },
        error: (error: any) => ({
          title: 'Error',
          description: error.reason || error.message || 'An unknown error occurred',
          duration: 10000,
        }),
      }
    );
  }


  // HANDLE PAUSE
  const handlePause = async () => {
    toaster.promise(
      callContract('pause'),
      {
        loading: {
          title: 'Pausing Minting',
          description: 'Broadcasting pause transaction...',
        },
        success: (data: any) => {
          setIsPaused(true);
          return {
            title: 'Minting Paused',
            description: (
              <>
                {data?.result?.hash ? (
                  <a
                    className="underline"
                    href={buildTransactionUrl(data.result.hash)}
                    target="_blank"
                  >
                    View In Explorer
                  </a>
                ) : (
                  <p>
                    {data?.method} : {data?.result}
                  </p>
                )}
              </>
            ),
            duration: 10000,
          };
        },
        error: (error: any) => ({
          title: 'Error',
          description: error.reason || error.message || 'An unknown error occurred',
          duration: 10000,
        }),
      }
    );
  }

  // HANDLE UNPAUSE
  const handleUnpause = async () => {
    toaster.promise(
      callContract('unpause'),
      {
        loading: {
          title: 'Unpausing Minting',
          description: 'Broadcasting unpause transaction...',
        },
        success: (data: any) => {
          setIsPaused(false);
          return {
            title: 'Minting Unpaused',
            description: (
              <>
                {data?.result?.hash ? (
                  <a
                    className="underline"
                    href={buildTransactionUrl(data.result.hash)}
                    target="_blank"
                  >
                    View In Explorer
                  </a>
                ) : (
                  <p>
                    {data?.method} : {data?.result}
                  </p>
                )}
              </>
            ),
            duration: 10000,
          };
        },
        error: (error: any) => ({
          title: 'Error',
          description: error.reason || error.message || 'An unknown error occurred',
          duration: 10000,
        }),
      }
    );
  }

  // HANDLE ADD TO WHITELIST
  const handleAddToWhitelist = async () => {
    toaster.promise(
      callContract('addToWhitelist'),
      {
        loading: {
          title: 'Adding to Whitelist',
          description: 'Broadcasting whitelist transaction...',
        },
        success: (data: any) => {
          setWhitelistAddress(''); // Clear the input field
          return {
            title: 'Added to Whitelist',
            description: (
              <>
                {data?.result?.hash ? (
                  <a
                    className="underline"
                    href={buildTransactionUrl(data.result.hash)}
                    target="_blank"
                  >
                    View In Explorer
                  </a>
                ) : (
                  <p>
                    {data?.method} : {data?.result}
                  </p>
                )}
              </>
            ),
            duration: 10000,
          };
        },
        error: (error: any) => ({
          title: 'Error',
          description: error.reason || error.message || 'An unknown error occurred',
          duration: 10000,
        }),
      }
    );
  }

  // HANDLE REMOVE FROM WHITELIST
  const handleRemoveFromWhitelist = async () => {
    toaster.promise(
      callContract('removeFromWhitelist'),
      {
        loading: {
          title: 'Removing from Whitelist',
          description: 'Broadcasting whitelist removal transaction...',
        },
        success: (data: any) => {
          setWhitelistAddress(''); // Clear the input field
          return {
            title: 'Removed from Whitelist',
            description: (
              <>
                {data?.result?.hash ? (
                  <a
                    className="underline"
                    href={buildTransactionUrl(data.result.hash)}
                    target="_blank"
                  >
                    View In Explorer
                  </a>
                ) : (
                  <p>
                    {data?.method} : {data?.result}
                  </p>
                )}
              </>
            ),
            duration: 10000,
          };
        },
        error: (error: any) => ({
          title: 'Error',
          description: error.reason || error.message || 'An unknown error occurred',
          duration: 10000,
        }),
      }
    );
  }

  if (!isOwner || !account) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
          <span className="text-orange-400 font-semibold text-sm">⚙️ Owner Controls</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Collection Management</h3>
        <p className="text-gray-400 text-base">Manage your NFT collection settings and parameters</p>
      </div>
      
      <div className="space-y-6">
        {/* Status Display */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 bg-gray-500/10 border border-gray-500/20 rounded-full">
            <span className={`font-semibold text-sm ${isPaused ? 'text-red-400' : 'text-green-400'}`}>
              {isPaused ? '⏸️ Minting Paused' : '▶️ Minting Active'}
            </span>
          </div>
        </div>

        {/* Pause/Unpause Controls */}
        <div className="text-center space-y-4">
          <h4 className="text-lg font-semibold text-white">Minting Control</h4>
          <div className="flex justify-center gap-4">
            <button
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                isPaused 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
              }`}
              onClick={isPaused ? handleUnpause : handlePause}
            >
              {isPaused ? '▶️ Unpause Minting' : '⏸️ Pause Minting'}
            </button>
          </div>
        </div>

        {/* Whitelist Management */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white text-center">Whitelist Management</h4>
          <div className="flex flex-col gap-3">
            <input
              onChange={e => setWhitelistAddress(e.target.value)}
              type="text"
              className="input-modern py-3 text-base"
              placeholder="Enter wallet address to whitelist"
              value={whitelistAddress}
            />
            <div className="flex gap-3">
              <button
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                onClick={handleAddToWhitelist}
                disabled={!whitelistAddress.trim()}
              >
                ➕ Add to Whitelist
              </button>
              <button
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                onClick={handleRemoveFromWhitelist}
                disabled={!whitelistAddress.trim()}
              >
                ➖ Remove from Whitelist
              </button>
            </div>
          </div>
        </div>


        {/* Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Update Supply */}
          <div className="space-y-3">
            <label className="block text-base font-medium text-gray-300">Update Supply</label>
            <div className="flex flex-col gap-3">
              <input
                onChange={e => setNewSupply(parseInt(e.target.value))}
                type="number"
                className="input-modern py-3 text-base"
                placeholder="Enter new supply"
              />
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                onClick={() => handleUpdateSupply()}
              >
                Update Supply
              </button>
            </div>
          </div>


          {/* Update Base Token URI */}
          <div className="space-y-3">
            <label className="block text-base font-medium text-gray-300">Update Base Token URI</label>
            <div className="flex flex-col gap-3">
              <input
                onChange={e => setNewBaseTokenURI(e.target.value)}
                type="text"
                className="input-modern py-3 text-base"
                placeholder="Enter new base URI"
              />
              <button
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                onClick={() => handleUpdateBaseTokenURI()}
              >
                Update URI
              </button>
            </div>
          </div>

          {/* Update Max Mint Per Address */}
          <div className="space-y-3">
            <label className="block text-base font-medium text-gray-300">Update Max Mint Per Address</label>
            <div className="flex flex-col gap-3">
              <input
                onChange={e => setNewMaxMintPerAddress(parseInt(e.target.value))}
                type="number"
                className="input-modern py-3 text-base"
                placeholder="Enter max mints per address"
              />
              <button
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                onClick={() => handleUpdateMaxMintPerAddress()}
              >
                Update Limit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
