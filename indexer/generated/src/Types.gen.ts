/* TypeScript file generated from Types.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {HandlerContext as $$handlerContext} from './Types.ts';

import type {HandlerWithOptions as $$fnWithEventConfig} from './bindings/OpaqueTypes.ts';

import type {SingleOrMultiple as $$SingleOrMultiple_t} from './bindings/OpaqueTypes';

import type {Transaction_t as Entities_Transaction_t} from '../src/db/Entities.gen';

import type {eventOptions as Internal_eventOptions} from 'envio/src/Internal.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericEvent as Internal_genericEvent} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {logger as Envio_logger} from 'envio/src/Envio.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

export type id = string;
export type Id = id;

export type contractRegistrations = { readonly log: Envio_logger; readonly addTransactions: (_1:Address_t) => void };

export type entityHandlerContext<entity,indexedFieldOperations> = {
  readonly get: (_1:id) => Promise<(undefined | entity)>; 
  readonly getOrThrow: (_1:id, message:(undefined | string)) => Promise<entity>; 
  readonly getWhere: indexedFieldOperations; 
  readonly getOrCreate: (_1:entity) => Promise<entity>; 
  readonly set: (_1:entity) => void; 
  readonly deleteUnsafe: (_1:id) => void
};

export type handlerContext = $$handlerContext;

export type transaction = Entities_Transaction_t;
export type Transaction = transaction;

export type eventIdentifier = {
  readonly chainId: number; 
  readonly blockTimestamp: number; 
  readonly blockNumber: number; 
  readonly logIndex: number
};

export type entityUpdateAction<entityType> = "Delete" | { TAG: "Set"; _0: entityType };

export type entityUpdate<entityType> = {
  readonly eventIdentifier: eventIdentifier; 
  readonly entityId: id; 
  readonly entityUpdateAction: entityUpdateAction<entityType>
};

export type entityValueAtStartOfBatch<entityType> = 
    "NotSet"
  | { TAG: "AlreadySet"; _0: entityType };

export type updatedValue<entityType> = {
  readonly latest: entityUpdate<entityType>; 
  readonly history: entityUpdate<entityType>[]; 
  readonly containsRollbackDiffChange: boolean
};

export type inMemoryStoreRowEntity<entityType> = 
    { TAG: "Updated"; _0: updatedValue<entityType> }
  | { TAG: "InitialReadFromDb"; _0: entityValueAtStartOfBatch<entityType> };

export type Transaction_t = {};

export type Block_t = {
  readonly number: number; 
  readonly timestamp: number; 
  readonly hash: string
};

export type AggregatedBlock_t = {
  readonly hash: string; 
  readonly number: number; 
  readonly timestamp: number
};

export type AggregatedTransaction_t = {};

export type eventLog<params> = Internal_genericEvent<params,Block_t,Transaction_t>;
export type EventLog<params> = eventLog<params>;

export type SingleOrMultiple_t<a> = $$SingleOrMultiple_t<a>;

export type HandlerTypes_args<eventArgs,context> = { readonly event: eventLog<eventArgs>; readonly context: context };

export type HandlerTypes_contractRegisterArgs<eventArgs> = Internal_genericContractRegisterArgs<eventLog<eventArgs>,contractRegistrations>;

export type HandlerTypes_contractRegister<eventArgs> = Internal_genericContractRegister<HandlerTypes_contractRegisterArgs<eventArgs>>;

export type HandlerTypes_eventConfig<eventFilters> = Internal_eventOptions<eventFilters>;

export type fnWithEventConfig<fn,eventConfig> = $$fnWithEventConfig<fn,eventConfig>;

export type contractRegisterWithOptions<eventArgs,eventFilters> = fnWithEventConfig<HandlerTypes_contractRegister<eventArgs>,HandlerTypes_eventConfig<eventFilters>>;

export type Transactions_chainId = 10143;

export type Transactions_Transfer_eventArgs = {
  readonly from: Address_t; 
  readonly to: Address_t; 
  readonly value: bigint
};

export type Transactions_Transfer_block = Block_t;

export type Transactions_Transfer_transaction = Transaction_t;

export type Transactions_Transfer_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: Transactions_Transfer_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: Transactions_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: Transactions_Transfer_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: Transactions_Transfer_block
};

export type Transactions_Transfer_handlerArgs = Internal_genericHandlerArgs<Transactions_Transfer_event,handlerContext,void>;

export type Transactions_Transfer_handler = Internal_genericHandler<Transactions_Transfer_handlerArgs>;

export type Transactions_Transfer_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<Transactions_Transfer_event,contractRegistrations>>;

export type Transactions_Transfer_eventFilter = { readonly from?: SingleOrMultiple_t<Address_t>; readonly to?: SingleOrMultiple_t<Address_t> };

export type Transactions_Transfer_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: Transactions_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type Transactions_Transfer_eventFiltersDefinition = 
    Transactions_Transfer_eventFilter
  | Transactions_Transfer_eventFilter[];

export type Transactions_Transfer_eventFilters = 
    Transactions_Transfer_eventFilter
  | Transactions_Transfer_eventFilter[]
  | ((_1:Transactions_Transfer_eventFiltersArgs) => Transactions_Transfer_eventFiltersDefinition);

export type Transactions_Transaction_eventArgs = {
  readonly from: Address_t; 
  readonly to: Address_t; 
  readonly amount: bigint; 
  readonly currency: string
};

export type Transactions_Transaction_block = Block_t;

export type Transactions_Transaction_transaction = Transactions_Transaction_t;

export type Transactions_Transaction_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: Transactions_Transaction_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: Transactions_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: Transactions_Transaction_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: Transactions_Transaction_block
};

export type Transactions_Transaction_handlerArgs = Internal_genericHandlerArgs<Transactions_Transaction_event,handlerContext,void>;

export type Transactions_Transaction_handler = Internal_genericHandler<Transactions_Transaction_handlerArgs>;

export type Transactions_Transaction_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<Transactions_Transaction_event,contractRegistrations>>;

export type Transactions_Transaction_eventFilter = { readonly from?: SingleOrMultiple_t<Address_t>; readonly to?: SingleOrMultiple_t<Address_t> };

export type Transactions_Transaction_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: Transactions_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type Transactions_Transaction_eventFiltersDefinition = 
    Transactions_Transaction_eventFilter
  | Transactions_Transaction_eventFilter[];

export type Transactions_Transaction_eventFilters = 
    Transactions_Transaction_eventFilter
  | Transactions_Transaction_eventFilter[]
  | ((_1:Transactions_Transaction_eventFiltersArgs) => Transactions_Transaction_eventFiltersDefinition);

export type chainId = number;
