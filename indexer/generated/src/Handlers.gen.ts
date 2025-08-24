/* TypeScript file generated from Handlers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const HandlersJS = require('./Handlers.res.js');

import type {HandlerTypes_eventConfig as Types_HandlerTypes_eventConfig} from './Types.gen';

import type {Transactions_Transaction_eventFilters as Types_Transactions_Transaction_eventFilters} from './Types.gen';

import type {Transactions_Transaction_event as Types_Transactions_Transaction_event} from './Types.gen';

import type {Transactions_Transfer_eventFilters as Types_Transactions_Transfer_eventFilters} from './Types.gen';

import type {Transactions_Transfer_event as Types_Transactions_Transfer_event} from './Types.gen';

import type {contractRegistrations as Types_contractRegistrations} from './Types.gen';

import type {fnWithEventConfig as Types_fnWithEventConfig} from './Types.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {handlerContext as Types_handlerContext} from './Types.gen';

export const Transactions_Transfer_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_Transactions_Transfer_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_Transactions_Transfer_eventFilters>> = HandlersJS.Transactions.Transfer.contractRegister as any;

export const Transactions_Transfer_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_Transactions_Transfer_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_Transactions_Transfer_eventFilters>> = HandlersJS.Transactions.Transfer.handler as any;

export const Transactions_Transaction_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_Transactions_Transaction_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_Transactions_Transaction_eventFilters>> = HandlersJS.Transactions.Transaction.contractRegister as any;

export const Transactions_Transaction_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_Transactions_Transaction_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_Transactions_Transaction_eventFilters>> = HandlersJS.Transactions.Transaction.handler as any;

export const Transactions: { Transfer: { handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_Transactions_Transfer_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_Transactions_Transfer_eventFilters>>; contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_Transactions_Transfer_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_Transactions_Transfer_eventFilters>> }; Transaction: { handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_Transactions_Transaction_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_Transactions_Transaction_eventFilters>>; contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_Transactions_Transaction_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_Transactions_Transaction_eventFilters>> } } = HandlersJS.Transactions as any;
