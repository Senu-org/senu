/* TypeScript file generated from Entities.res by genType. */

/* eslint-disable */
/* tslint:disable */

export type id = string;

export type whereOperations<entity,fieldType> = { readonly eq: (_1:fieldType) => Promise<entity[]>; readonly gt: (_1:fieldType) => Promise<entity[]> };

export type Transaction_t = {
  readonly amount: bigint; 
  readonly blockNumber: bigint; 
  readonly currency: string; 
  readonly from: string; 
  readonly id: id; 
  readonly timestamp: bigint; 
  readonly to: string; 
  readonly txHash: string
};

export type Transaction_indexedFieldOperations = {};
