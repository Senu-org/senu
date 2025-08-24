import {
  Transactions_Transaction_handler,
  Transactions_Transfer_handler,
} from "generated/src/Handlers.gen";
import { Transaction_t as TransactionEntity } from "generated/src/db/Entities.gen";

Transactions_Transaction_handler(async ({ event, context }) => {
  const transaction: TransactionEntity = {
    id: event.transaction.hash + "-" + event.logIndex,
    from: event.params.from,
    to: event.params.to,
    amount: event.params.amount,
    currency: event.params.currency,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    txHash: event.transaction.hash,
  };

  context.Transaction.set(transaction);
});

Transactions_Transfer_handler(async ({ event, context }) => {
  const transaction: TransactionEntity = {
    id: event.transaction.hash + "-" + event.logIndex,
    from: event.params.from,
    to: event.params.to,
    amount: event.params.value,
    currency: "MON", // Assuming MON for standard transfers
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    txHash: event.transaction.hash,
  };

  context.Transaction.set(transaction);
});
