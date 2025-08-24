/* TypeScript file generated from TestHelpers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const TestHelpersJS = require('./TestHelpers.res.js');

import type {Transactions_Transaction_event as Types_Transactions_Transaction_event} from './Types.gen';

import type {Transactions_Transfer_event as Types_Transactions_Transfer_event} from './Types.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

import type {t as TestHelpers_MockDb_t} from './TestHelpers_MockDb.gen';

/** The arguements that get passed to a "processEvent" helper function */
export type EventFunctions_eventProcessorArgs<event> = {
  readonly event: event; 
  readonly mockDb: TestHelpers_MockDb_t; 
  readonly chainId?: number
};

export type EventFunctions_eventProcessor<event> = (_1:EventFunctions_eventProcessorArgs<event>) => Promise<TestHelpers_MockDb_t>;

export type EventFunctions_MockBlock_t = {
  readonly hash?: string; 
  readonly number?: number; 
  readonly timestamp?: number
};

export type EventFunctions_MockTransaction_t = {};

export type EventFunctions_mockEventData = {
  readonly chainId?: number; 
  readonly srcAddress?: Address_t; 
  readonly logIndex?: number; 
  readonly block?: EventFunctions_MockBlock_t; 
  readonly transaction?: EventFunctions_MockTransaction_t
};

export type Transactions_Transfer_createMockArgs = {
  readonly from?: Address_t; 
  readonly to?: Address_t; 
  readonly value?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type Transactions_Transaction_createMockArgs = {
  readonly from?: Address_t; 
  readonly to?: Address_t; 
  readonly amount?: bigint; 
  readonly currency?: string; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export const MockDb_createMockDb: () => TestHelpers_MockDb_t = TestHelpersJS.MockDb.createMockDb as any;

export const Addresses_mockAddresses: Address_t[] = TestHelpersJS.Addresses.mockAddresses as any;

export const Addresses_defaultAddress: Address_t = TestHelpersJS.Addresses.defaultAddress as any;

export const Transactions_Transfer_processEvent: EventFunctions_eventProcessor<Types_Transactions_Transfer_event> = TestHelpersJS.Transactions.Transfer.processEvent as any;

export const Transactions_Transfer_createMockEvent: (args:Transactions_Transfer_createMockArgs) => Types_Transactions_Transfer_event = TestHelpersJS.Transactions.Transfer.createMockEvent as any;

export const Transactions_Transaction_processEvent: EventFunctions_eventProcessor<Types_Transactions_Transaction_event> = TestHelpersJS.Transactions.Transaction.processEvent as any;

export const Transactions_Transaction_createMockEvent: (args:Transactions_Transaction_createMockArgs) => Types_Transactions_Transaction_event = TestHelpersJS.Transactions.Transaction.createMockEvent as any;

export const Addresses: { mockAddresses: Address_t[]; defaultAddress: Address_t } = TestHelpersJS.Addresses as any;

export const Transactions: { Transfer: { processEvent: EventFunctions_eventProcessor<Types_Transactions_Transfer_event>; createMockEvent: (args:Transactions_Transfer_createMockArgs) => Types_Transactions_Transfer_event }; Transaction: { processEvent: EventFunctions_eventProcessor<Types_Transactions_Transaction_event>; createMockEvent: (args:Transactions_Transaction_createMockArgs) => Types_Transactions_Transaction_event } } = TestHelpersJS.Transactions as any;

export const MockDb: { createMockDb: () => TestHelpers_MockDb_t } = TestHelpersJS.MockDb as any;
