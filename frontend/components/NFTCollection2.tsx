"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { NFTCollectionABI } from "./NFTCollectionABI";
import { NFT_COLLECTION_CONTRACT_ADDRESS } from "@/components/constants";

interface NFT {
  tokenId: number;
  name?: string;
  image?: string;
  attributes?: string[];
}

// Ton CID mapping
export const uriList = [
  "bafkreifb4v2cishxhnssau7e7nyehq7zdxa6rahtka7m4s7wqgdw7t5oqu",
  "bafkreifb4v2cishxhnssau7e7nyehq7zdxa6rahtka7m4s7wqgdw7t5oqu",
];

const nftContract = {
  address: NFT_COLLECTION_CONTRACT_ADDRESS as `0x${string}`,
  abi: NFTCollectionABI,
} as const;

export default function MiniNFTCollection() {
  const { address, isConnected } = useAccount();
  const [nfts, setNFTs] = useState<NFT[]>([]);

  const IPFS_BASE_URL = process.env.NEXT_PUBLIC_IPFS_URL || "https://ipfs.io/ipfs/";

  // Résolution des URI IPFS
  const resolveIPFS = (uri: string) => {
    if (!uri) return "";
    if (uri.startsWith("ipfs://")) return IPFS_BASE_URL + uri.slice(7);
    return uri.replace(/\/ipfs\//, "/ipfs/");
  };

  const fetchNFTMetadata = async (cid: string) => {
    try {
      const res = await fetch(`${IPFS_BASE_URL}${cid}`);
      if (!res.ok) throw new Error("Failed to fetch metadata");
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("Error fetching NFT metadata:", err);
      return null;
    }
  };

  // Charger les NFTs
  useEffect(() => {
    async function loadNFTs() {
      const nftArray: NFT[] = [];
      for (let i = 0; i < uriList.length; i++) {
        const metadata = await fetchNFTMetadata(uriList[i]);
        if (metadata) {
          nftArray.push({
            tokenId: i,
            name: metadata.name,
            image: resolveIPFS(metadata.image),
            attributes: metadata.attributes,
          });
        }
      }
      setNFTs(nftArray);
    }
    loadNFTs();
  }, []);

  if (!isConnected) return null; // rien si pas connecté

  return (
    <div className="flex flex-wrap gap-2 mt-4 from-green-100">
      {nfts.map((nft) => (
        <div
          key={nft.tokenId}
          className="w-14 h-14 rounded-xl overflow-hidden border-2 border-yellow-400 shadow-md bg-gradient-to-br from-green-100 via-amber-100 to-orange-100 hover:scale-110 transition-transform duration-300 cursor-pointer relative"
        >
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover rounded-xl"
            onError={(e) =>
              (e.currentTarget.src = `https://via.placeholder.com/56?text=Egg+${nft.tokenId}`)
            }
          />
          {/* Petit halo lumineux */}
          <div className="absolute inset-0 rounded-xl bg-yellow-200/20 opacity-0 hover:opacity-30 transition-opacity duration-300"></div>
        </div>
      ))}
    </div>
  );
}
