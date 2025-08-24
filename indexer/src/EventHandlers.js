const { Transactions } = require("generated");

Transactions.Transaction.handler(async ({ event, context }) => {
  const transaction = {
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

Transactions.Transfer.handler(async ({ event, context }) => {
  const transaction = {
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
