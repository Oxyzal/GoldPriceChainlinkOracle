"use client";

import { useState, useEffect, useCallback } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import { TokenABI } from "@/components/abi";
import { TOKEN_CONTRACT_ADDRESS, COLLATERAL_TOKEN_CONTRACT_ADDRESS } from "@/components/constants";
import { erc20Abi } from "viem";
import NFTCollection from "@/components/NFTCollection";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mintAmount, setMintAmount] = useState("0.01");
  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [approved, setApproved] = useState(false);

  const amount = parseUnits(mintAmount, 18);

  // ----- Approve Collateral -----
  const { writeContract: approveContract, data: approveHash } = useWriteContract();
  const { isLoading: approving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  const handleApprove = async () => {
    if (!isConnected) return alert("Connect your wallet first");
    approveContract({
      address: COLLATERAL_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [TOKEN_CONTRACT_ADDRESS as `0x${string}`, amount],
    });
  };

  // ----- Mint with Collateral -----
  const { writeContract: mintContract, data: mintHash, isPending } = useWriteContract();
  const { isLoading: txLoading, isSuccess: mintSuccess } = useWaitForTransactionReceipt({ hash: mintHash });

  const handleMint = async () => {
    if (!isConnected) return alert("Connect your wallet first");
    mintContract({
      address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
      abi: TokenABI,
      functionName: "mintWithCollateral",
      args: [amount],
    });
  };

  // ----- Read: allowance -----
  const { refetch: refetchAllowance, data: allowanceData } = useReadContract({
    address: COLLATERAL_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address as `0x${string}`, TOKEN_CONTRACT_ADDRESS as `0x${string}`],
    query: { enabled: false },
  });

  const fetchAllowance = useCallback(async () => {
    if (!address) return;
    try {
      const { data } = await refetchAllowance();
      setApproved(data !== undefined && data !== null && BigInt(data) >= amount);
    } catch (err) {
      console.error(err);
      setApproved(false);
    }
  }, [address, amount, refetchAllowance]);

  useEffect(() => {
    if (isConnected) fetchAllowance();
  }, [isConnected, address, fetchAllowance, approveSuccess, mintSuccess]);

  // ----- Read: balanceOf -----
  const { refetch: refetchBalance } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: TokenABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: false },
  });

  const fetchBalance = useCallback(async () => {
    if (!address) return;
    setLoadingBalance(true);
    try {
      const { data } = await refetchBalance();
      setBalance(data ? data.toString() : "0");
    } catch (err) {
      console.error(err);
      setBalance("0");
    } finally {
      setLoadingBalance(false);
    }
  }, [address, refetchBalance]);

  useEffect(() => {
    if (isConnected) fetchBalance();
  }, [isConnected, address, fetchBalance]);

  useEffect(() => {
    if (mintSuccess) fetchBalance();
  }, [mintSuccess, fetchBalance]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-100">
      {/* Animated farm background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sun */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-2xl animate-pulse"></div>
        {/* Clouds */}
        <div className="absolute top-20 left-20 w-40 h-20 bg-white/60 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-40 w-32 h-16 bg-white/50 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        {/* Grass hills */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-green-600/20 to-transparent"></div>
      </div>

      {/* Floating farm elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-10 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🌾</div>
        <div className="absolute top-48 right-20 text-4xl animate-bounce" style={{ animationDelay: '1s' }}>🌻</div>
        <div className="absolute bottom-40 left-32 text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>🌷</div>
        <div className="absolute top-64 right-64 text-3xl animate-bounce" style={{ animationDelay: '2s' }}>🦋</div>
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
        <main className="w-full max-w-6xl">
          {/* Farm Header */}
          <div className="text-center mb-8 space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 shadow-2xl shadow-orange-500/50 mb-4 transform hover:scale-110 hover:rotate-6 transition-all duration-300">
              <span className="text-5xl">🥚</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 tracking-tight drop-shadow-lg">
              Egg Farm NFT
            </h1>
            <p className="text-2xl text-amber-800 font-bold drop-shadow">
              🐣 Mint, Hatch & Collect Rare Eggs! 🐤
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-lg border-2 border-amber-300">
                <span className="text-xl">🌾</span>
                <span className="font-bold text-amber-700">Farm Level: 5</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-lg border-2 border-green-300">
                <span className="text-xl">⭐</span>
                <span className="font-bold text-green-700">Experience: 2,450 XP</span>
              </div>
            </div>
          </div>

          {/* Connect Button Container */}
          <div className="flex justify-center mb-12">
            <div className="transform hover:scale-110 hover:-translate-y-1 transition-all duration-300">
              <ConnectButton />
            </div>
          </div>

          {isConnected && (
            <div className="grid lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {/* Left Column - Barn/Balance Card */}
              <div className="space-y-6">
                <div className="group relative bg-gradient-to-br from-amber-100 to-orange-100 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-4 border-amber-300 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-red-500 rounded-2xl rotate-12 flex items-center justify-center shadow-xl">
                    <span className="text-3xl">🏠</span>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg border-2 border-yellow-600">
                        <span className="text-3xl">🐔</span>
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-amber-800">
                          Your Barn
                        </h2>
                        <p className="text-sm text-amber-600 font-bold">Egg Collection</p>
                      </div>
                    </div>

                    <div className="bg-white/90 rounded-3xl p-6 mb-6 border-4 border-amber-200 shadow-inner">
                      {loadingBalance ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-orange-600 font-bold">Counting eggs...</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-orange-600 mb-2 font-bold flex items-center gap-2">
                            <span className="text-xl">🥚</span>
                            Total Eggs Collected
                          </p>
                          <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 drop-shadow-lg">
                            {balance ?? "0"}
                          </p>
                          <p className="text-lg text-orange-600 mt-2 font-bold">
                            EGG Tokens
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 border-3 border-green-300 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🌱</span>
                          <p className="text-green-700 font-bold text-sm">Status</p>
                        </div>
                        <p className="font-black text-green-800 text-lg">Active Farm</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-4 border-3 border-blue-300 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🌐</span>
                          <p className="text-blue-700 font-bold text-sm">Network</p>
                        </div>
                        <p className="font-black text-blue-800 text-lg">Sepolia</p>
                      </div>
                    </div>

                    {/* Daily stats */}
                    <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 border-3 border-purple-300">
                      <p className="text-purple-700 font-bold text-sm mb-2 flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        Today's Farm Stats
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-purple-600">Eggs Laid: <span className="font-black text-purple-800">12</span></p>
                        </div>
                        <div>
                          <p className="text-purple-600">Hatched: <span className="font-black text-purple-800">3</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Farm Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-yellow-100 to-amber-100 backdrop-blur-xl rounded-2xl p-5 shadow-xl border-3 border-yellow-300 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">🌾</span>
                      <p className="text-sm text-amber-700 font-bold">Feed Stock</p>
                    </div>
                    <p className="text-3xl font-black text-amber-800">120%</p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-100 to-red-100 backdrop-blur-xl rounded-2xl p-5 shadow-xl border-3 border-rose-300 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">💰</span>
                      <p className="text-sm text-rose-700 font-bold">Mint Fee</p>
                    </div>
                    <p className="text-3xl font-black text-rose-800">0.5%</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Hatchery/Mint Card */}
              <div className="space-y-6">
                <div className="group relative bg-gradient-to-br from-orange-100 to-red-100 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-4 border-orange-300 hover:shadow-red-500/40 transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-400 rounded-2xl -rotate-12 flex items-center justify-center shadow-xl animate-bounce">
                    <span className="text-3xl">✨</span>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg border-2 border-red-600">
                        <span className="text-3xl">🥚</span>
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-orange-800">
                          Egg Hatchery
                        </h2>
                        <p className="text-sm text-orange-600 font-bold">Mint New Eggs</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-orange-700 mb-2 flex items-center gap-2">
                          <span className="text-xl">🌟</span>
                          Eggs to Hatch
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={mintAmount}
                            onChange={(e) => setMintAmount(e.target.value)}
                            className="w-full rounded-2xl border-4 border-orange-400 bg-white p-5 pr-20 text-2xl font-black text-orange-800 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 transition-all shadow-inner"
                            placeholder="0.01"
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl font-black text-orange-600">
                            🥚 EGG
                          </span>
                        </div>
                      </div>

                      {/* Hatchery Info Card */}
                      <div className="bg-white/90 rounded-2xl p-5 border-4 border-amber-200 shadow-inner">
                        <div className="flex justify-between text-base mb-3">
                          <span className="text-amber-700 font-bold flex items-center gap-2">
                            <span className="text-xl">🌾</span>
                            Feed Required
                          </span>
                          <span className="font-black text-amber-800">{mintAmount}</span>
                        </div>
                        <div className="flex justify-between text-base mb-3">
                          <span className="text-amber-700 font-bold flex items-center gap-2">
                            <span className="text-xl">🥚</span>
                            You'll Receive
                          </span>
                          <span className="font-black text-amber-800">{mintAmount} EGG</span>
                        </div>
                        <div className="pt-3 border-t-2 border-amber-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-orange-600 font-bold">Hatching Time</span>
                            <span className="font-black text-orange-700">Instant! ⚡</span>
                          </div>
                        </div>
                      </div>

                      {/* Egg rarity info */}
                      <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 rounded-2xl p-4 border-3 border-purple-300">
                        <p className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                          <span className="text-xl">🎲</span>
                          Egg Rarity Chances
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Common 🥚</span>
                            <span className="font-bold text-gray-700">60%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-600">Rare 💙</span>
                            <span className="font-bold text-blue-700">25%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-600">Epic 💜</span>
                            <span className="font-bold text-purple-700">12%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-600">Legendary ⭐</span>
                            <span className="font-bold text-yellow-700">3%</span>
                          </div>
                        </div>
                      </div>

                      {!approved ? (
                        <button
                          onClick={handleApprove}
                          disabled={approving}
                          className={`w-full rounded-2xl px-8 py-5 font-black text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl border-4 ${
                            approving
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400"
                              : "bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 shadow-green-500/50 border-green-600"
                          }`}
                        >
                          {approving ? (
                            <span className="flex items-center justify-center gap-3">
                              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                              Preparing Feed...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              🌾 Approve Feed Stock
                            </span>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleMint}
                          disabled={isPending || txLoading}
                          className={`w-full rounded-2xl px-8 py-5 font-black text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl border-4 ${
                            isPending || txLoading
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400"
                              : "bg-gradient-to-r from-orange-400 via-red-400 to-pink-500 text-white hover:from-orange-500 hover:via-red-500 hover:to-pink-600 shadow-orange-500/50 border-orange-600 animate-pulse"
                          }`}
                        >
                          {isPending ? (
                            <span className="flex items-center justify-center gap-3">
                              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                              Check Your Wallet...
                            </span>
                          ) : txLoading ? (
                            <span className="flex items-center justify-center gap-3">
                              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                              Hatching Eggs...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              🥚 Hatch Eggs Now! 🐣
                            </span>
                          )}
                        </button>
                      )}

                      {mintSuccess && (
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-400 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl">
                          <div className="flex items-center gap-4">
                            <span className="text-5xl animate-bounce">🎉</span>
                            <div>
                              <p className="font-black text-green-700 text-xl">Eggs Hatched!</p>
                              <p className="text-base text-green-600 font-bold">Your new eggs are ready! 🐣</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* NFT Collection - Full Width */}
              <div className="lg:col-span-2">
                <NFTCollection />
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="text-center bg-gradient-to-br from-amber-100 to-orange-100 backdrop-blur-xl rounded-3xl p-16 shadow-2xl border-4 border-amber-300 max-w-2xl mx-auto">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/50 animate-bounce border-4 border-yellow-600">
                <span className="text-7xl">🔒</span>
              </div>
              <h3 className="text-4xl font-black text-amber-800 mb-4">
                Welcome to the Farm!
              </h3>
              <p className="text-orange-700 text-xl font-bold mb-6">
                Connect your wallet to start hatching eggs and collecting rare NFTs! 🐔
              </p>
              <div className="flex items-center justify-center gap-3 text-amber-700">
                <span className="text-3xl">🥚</span>
                <span className="text-3xl">🐣</span>
                <span className="text-3xl">🐤</span>
                <span className="text-3xl">🐓</span>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-16 text-center">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 border-3 border-amber-300 inline-block shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🌾</span>
              <p className="font-black text-amber-800">Built with Next.js, Wagmi & RainbowKit</p>
              <span className="text-2xl">🌾</span>
            </div>
            <p className="text-sm text-orange-700 font-bold">🐔 Happy Farming! Secured by blockchain 🔐</p>
          </div>
        </footer>
      </div>
    </div>
  );
}