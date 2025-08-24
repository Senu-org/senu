  @genType
module Transactions = {
  module Transfer = Types.MakeRegister(Types.Transactions.Transfer)
  module Transaction = Types.MakeRegister(Types.Transactions.Transaction)
}

