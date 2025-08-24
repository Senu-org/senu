open Table
open Enums.EntityType
type id = string

type internalEntity = Internal.entity
module type Entity = {
  type t
  let name: Enums.EntityType.t
  let schema: S.t<t>
  let rowsSchema: S.t<array<t>>
  let table: Table.table
  let entityHistory: EntityHistory.t<t>
}
external entityModToInternal: module(Entity with type t = 'a) => Internal.entityConfig = "%identity"
external entityModsToInternal: array<module(Entity)> => array<Internal.entityConfig> = "%identity"
external entitiesToInternal: array<'a> => array<Internal.entity> = "%identity"

@get
external getEntityId: internalEntity => string = "id"

exception UnexpectedIdNotDefinedOnEntity
let getEntityIdUnsafe = (entity: 'entity): id =>
  switch Utils.magic(entity)["id"] {
  | Some(id) => id
  | None =>
    UnexpectedIdNotDefinedOnEntity->ErrorHandling.mkLogAndRaise(
      ~msg="Property 'id' does not exist on expected entity object",
    )
  }

//shorthand for punning
let isPrimaryKey = true
let isNullable = true
let isArray = true
let isIndex = true

@genType
type whereOperations<'entity, 'fieldType> = {
  eq: 'fieldType => promise<array<'entity>>,
  gt: 'fieldType => promise<array<'entity>>
}

module Transaction = {
  let name = Transaction
  @genType
  type t = {
    amount: bigint,
    blockNumber: bigint,
    currency: string,
    from: string,
    id: id,
    timestamp: bigint,
    to: string,
    txHash: string,
  }

  let schema = S.object((s): t => {
    amount: s.field("amount", BigInt.schema),
    blockNumber: s.field("blockNumber", BigInt.schema),
    currency: s.field("currency", S.string),
    from: s.field("from", S.string),
    id: s.field("id", S.string),
    timestamp: s.field("timestamp", BigInt.schema),
    to: s.field("to", S.string),
    txHash: s.field("txHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "amount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "currency", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "from", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "to", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField("db_write_timestamp", TimestampWithoutTimezone, ~fieldSchema=Utils.Schema.dbDate, ~default="CURRENT_TIMESTAMP"),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~pgSchema=Env.Db.publicSchema, ~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

let userEntities = [
  module(Transaction),
]->entityModsToInternal

let allEntities =
  userEntities->Js.Array2.concat(
    [module(TablesStatic.DynamicContractRegistry)]->entityModsToInternal,
  )

let byName =
  allEntities
  ->Js.Array2.map(entityConfig => {
    (entityConfig.name, entityConfig)
  })
  ->Js.Dict.fromArray
