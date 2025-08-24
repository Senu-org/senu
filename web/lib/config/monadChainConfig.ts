import { http } from "viem";
import { createParaViemClient, createParaAccount } from "@getpara/viem-v2-integration";
import { Para, Environment } from "@getpara/server-sdk";
import { monadChain, MONAD_RPC_URL } from '../utils';
import dotenv from "dotenv";
dotenv.config();

const para = new Para(Environment.SANDBOX, process.env.PARA_API_KEY || '');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const account = createParaAccount(para as any);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const walletClient = createParaViemClient(para as any, {
  account,
  chain: monadChain,
  transport: http(MONAD_RPC_URL), 
});

export { walletClient, monadChain, account };