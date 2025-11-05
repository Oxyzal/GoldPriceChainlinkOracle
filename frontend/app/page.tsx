"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
    <div className="relative min-h-screen  ">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-800/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80  rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-[#0a0c1a]">
        <main className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8 space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 shadow-2xl shadow-cyan-500/50 mb-4 transform hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">✨</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 tracking-tight">
              Gold Stable Token
            </h1>
            <p className="text-xl text-gray-300 font-medium">
              Premium collateralized stablecoin backed by gold reserves
            </p>
          </div>

          {/* Connect Button Container */}
          <div className="flex justify-center mb-12">
            <div className="transform hover:scale-105 transition-transform duration-200">
              <ConnectButton />
            </div>
          </div>

          {isConnected && (
            <div className="grid lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {/* Left Column - Balance Card */}
              <div className="space-y-6">
                <div className="group relative bg-[#111428]/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#1c1f36]/50 hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg">
                        <span className="text-2xl">💰</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white/90">
                        Your Balance
                      </h2>
                    </div>

                    <div className="bg-[#111428] rounded-2xl p-6 mb-4">
                      {loadingBalance ? (
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-cyan-400">Loading balance...</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-cyan-400 mb-2 font-medium">
                            GOF Token Balance
                          </p>
                          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                            {balance ?? "0"}
                          </p>
                          <p className="text-sm text-cyan-500 mt-1">
                            GOF
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-[#1c1f36]/50 rounded-xl p-3">
                        <p className="text-cyan-400 mb-1">Status</p>
                        <p className="font-semibold text-white/90">Active</p>
                      </div>
                      <div className="bg-[#1c1f36]/50 rounded-xl p-3">
                        <p className="text-cyan-400 mb-1">Network</p>
                        <p className="font-semibold text-white/90">Ethereum Sepolia</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111428]/60 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-[#1c1f36]/30 hover:shadow-xl transition-all duration-300">
                    <p className="text-sm text-cyan-400 mb-2">Collateral Ratio</p>
                    <p className="text-2xl font-bold text-white/90">120%</p>
                  </div>
                  <div className="bg-[#111428]/60 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-[#1c1f36]/30 hover:shadow-xl transition-all duration-300">
                    <p className="text-sm text-cyan-400 mb-2">Stability Fee</p>
                    <p className="text-2xl font-bold text-white/90">0.5%</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Mint Card */}
              <div className="space-y-6">
                <div className="group relative bg-[#111428]/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#1c1f36]/50 hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white/90">
                        Mint Tokens
                      </h2>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-cyan-400 mb-2">
                          Amount to Mint
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={mintAmount}
                            onChange={(e) => setMintAmount(e.target.value)}
                            className="w-full rounded-2xl border-2 border-cyan-700 bg-[#111428] p-4 pr-16 text-lg font-semibold text-white/90 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                            placeholder="0.00"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-cyan-400">
                            GOF
                          </span>
                        </div>
                      </div>

                      {/* Collateral Info Card */}
                      <div className="bg-[#111428] rounded-2xl p-4 border border-[#1c1f36]/50">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-cyan-400">Required Collateral</span>
                          <span className="font-semibold text-white/90">{mintAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-cyan-400">You'll Receive</span>
                          <span className="font-semibold text-white/90">{mintAmount} GOF</span>
                        </div>
                      </div>

                      {!approved ? (
                        <button
                          onClick={handleApprove}
                          disabled={approving}
                          className={`w-full rounded-2xl px-8 py-4 font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl ${
                            approving
                              ? " text-gray-400 cursor-not-allowed"
                              : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-500/50"
                          }`}
                        >
                          {approving ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                              Approving...
                            </span>
                          ) : (
                            "Approve Collateral"
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleMint}
                          disabled={isPending || txLoading}
                          className={`w-full rounded-2xl px-8 py-4 font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl ${
                            isPending || txLoading
                              ? " text-gray-400 cursor-not-allowed"
                              : "bg-cyan-600 text-white hover:bg-blue-500 shadow-cyan-500/50"
                          }`}
                        >
                          {isPending ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                              Confirm in Wallet...
                            </span>
                          ) : txLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                              Minting...
                            </span>
                          ) : (
                            "🚀 Mint Tokens"
                          )}
                        </button>
                      )}

                      {mintSuccess && (
                        <div className="bg-green-900/30 border-2 border-green-500 rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">✅</span>
                            <div>
                              <p className="font-bold text-green-300">Mint Successful!</p>
                              <p className="text-sm text-green-400">Your tokens have been minted</p>
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
                <div className="bg-[#111428]/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#1c1f36]/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white/90">
                        NFT Collection
                      </h2>
                      <p className="text-sm text-cyan-400">
                        Your tokenized assets
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="group relative aspect-square bg-[#111428] dark:from-zinc-800 dark:to-amber-900/30 rounded-2xl flex flex-col items-center justify-center overflow-hidden border-2 border-[#1c1f36]/50 hover:border-cyan-500 transition-all duration-300 hover:scale-105 cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/0 to-cyan-800/0 group-hover:from-blue-900/20 group-hover:to-cyan-800/20 transition-all duration-300"></div>
                        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🏆</span>
                        <p className="font-bold text-white/80 text-sm">NFT #{n}</p>
                        <p className="text-xs text-cyan-400">Coming Soon</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="text-center bg-[#111428]/60 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-[#1c1f36]/50 max-w-2xl mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/50 animate-bounce">
                <span className="text-5xl">🔐</span>
              </div>
              <h3 className="text-3xl font-bold text-white/90 mb-3">
                Connect Your Wallet
              </h3>
              <p className="text-cyan-400 text-lg">
                Connect your wallet to start minting GOF tokens and accessing your digital assets
              </p>
            </div>
          )}
        </main>

        <footer className="mt-16 text-center text-sm text-cyan-400">
          <p className="font-medium">Built with Next.js, Wagmi & RainbowKit</p>
          <p className="text-xs mt-1 text-cyan-300">Secured by blockchain technology</p>
        </footer>
      </div>
    </div>
  );
}
