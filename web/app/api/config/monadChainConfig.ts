import { http, defineChain } from "viem";
import { createParaViemClient, createParaAccount } from "@getpara/viem-v2-integration";
import { Para, Environment } from "@getpara/server-sdk";
import dotenv from "dotenv";
dotenv.config();

const para = new Para(Environment.SANDBOX, process.env.PARA_API_KEY || '');

// Define Monad chain
const monad = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
});

const account =  createParaAccount(para as any);

const walletClient = createParaViemClient(para as any, {
  account,
  chain: monad,
  transport: http("https://testnet-rpc.monad.xyz"), 
});

export {walletClient};