@val external require: string => unit = "require"

let registerContractHandlers = (
  ~contractName,
  ~handlerPathRelativeToRoot,
  ~handlerPathRelativeToConfig,
) => {
  try {
    require(`../${Path.relativePathToRootFromGenerated}/${handlerPathRelativeToRoot}`)
  } catch {
  | exn =>
    let params = {
      "Contract Name": contractName,
      "Expected Handler Path": handlerPathRelativeToConfig,
      "Code": "EE500",
    }
    let logger = Logging.createChild(~params)

    let errHandler = exn->ErrorHandling.make(~msg="Failed to import handler file", ~logger)
    errHandler->ErrorHandling.log
    errHandler->ErrorHandling.raiseExn
  }
}

%%private(
  let makeGeneratedConfig = () => {
    let chains = [
      {
        let contracts = [
          {
            Config.name: "Transactions",
            abi: Types.Transactions.abi,
            addresses: [
              "0x0000000000000000000000000000000000000000"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.Transactions.Transfer.register() :> Internal.eventConfig),
              (Types.Transactions.Transaction.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
        ]
        let chain = ChainMap.Chain.makeUnsafe(~chainId=10143)
        {
          Config.confirmedBlockThreshold: 200,
          startBlock: 0,
          endBlock: None,
          chain,
          contracts,
          sources: NetworkSources.evm(~chain, ~contracts=[{name: "Transactions",events: [Types.Transactions.Transfer.register(), Types.Transactions.Transaction.register()],abi: Types.Transactions.abi}], ~hyperSync=Some("https://10143.hypersync.xyz"), ~allEventSignatures=[Types.Transactions.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[{url: "https://testnet-rpc.monad.xyz", sourceFor: Fallback, syncConfig: {}}])
        }
      },
    ]

    Config.make(
      ~shouldRollbackOnReorg=true,
      ~shouldSaveFullHistory=false,
      ~isUnorderedMultichainMode=true,
      ~chains,
      ~enableRawEvents=false,
    )
  }

  let config: ref<option<Config.t>> = ref(None)
)

let registerAllHandlers = () => {
  registerContractHandlers(
    ~contractName="Transactions",
    ~handlerPathRelativeToRoot="src/EventHandlers.ts",
    ~handlerPathRelativeToConfig="src/EventHandlers.ts",
  )

  let generatedConfig = makeGeneratedConfig()
  config := Some(generatedConfig)
  generatedConfig
}

let getConfig = () => {
  switch config.contents {
  | Some(config) => config
  | None => registerAllHandlers()
  }
}
