import { http, defineChain } from "viem";
import { createParaViemClient, createParaAccount } from "@getpara/viem-v2-integration";
import { Para } from "@getpara/server-sdk";
import dotenv from "dotenv";
dotenv.config();

const para = new Para(process.env.PARA_API_KEY || '');

// Define Monad chain
const monad = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
});

const account =  createParaAccount(para);

const walletClient = createParaViemClient(para, {
  account,
  chain: monad,
  transport: http("https://testnet-rpc.monad.xyz"), 
});

export {walletClient};