import { createMultiAdapter, createSimpleAdapter } from './adapter';

export class NotImplementedError extends Error {
  constructor() {
    super('adapter not implemented');
  }
}

export const transformer = (): never => {
  throw new NotImplementedError();
};

export const multi = createMultiAdapter(transformer, transformer);
export const simple = createSimpleAdapter(transformer, transformer);
