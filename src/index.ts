const identity = <T>(value: T): T => value;

export class AdapterNotImplementedError extends Error {
  constructor() {
    super('adapter not implemented');
  }
}

export interface AdapterOptions {
  debug?: (message: string, value: any) => void;
}

export type Adapter<I, A extends any[], O> = (value: I, ...args: A) => O;

export interface BidirectionalAdapter<I, O, T extends any[], R extends any[]> {
  fromDB: Adapter<I, T, O>;
  toDB: Adapter<O, R, I>;
}

export type AnyBidirectionalAdapter = BidirectionalAdapter<any, any, any[], any[]>;

export type BidirectionalMultiAdapter<I, O, T extends any[], R extends any[]> = BidirectionalAdapter<I, O, T, R> & {
  mapFromDB: Adapter<I[], T, O[]>;
  mapToDB: Adapter<O[], R, I[]>;
};

export type AnyBidirectionalMultiAdapter = BidirectionalMultiAdapter<any, any, any[], any[]>;

export const createSimpleAdapter = <I, O, T extends any[] = [], R extends any[] = []>(
  fromDB: Adapter<I, T, O>,
  toDB: Adapter<O, R, I>,
  { debug }: AdapterOptions = {}
): BidirectionalAdapter<I, O, T, R> => ({
  fromDB: (dbValue, ...args) => {
    debug?.('adapter called with value from DB', dbValue);

    const result = fromDB(dbValue, ...args);

    debug?.('converted DB value to', result);

    return result;
  },
  toDB: (appValue, ...args) => {
    debug?.('adapter called with value from the store', appValue);

    const result = toDB(appValue, ...args);

    debug?.('converted store value to', result);

    return result;
  },
});

export const createAdapter = <I, O, T extends any[] = [], R extends any[] = []>(
  fromDB: Adapter<I, T, O>,
  toDB: Adapter<O, R, I>,
  options: AdapterOptions = {}
): BidirectionalMultiAdapter<I, O, T, R> => ({
  ...createSimpleAdapter<I, O, T, R>(fromDB, toDB, options),
  mapFromDB: (dbValues, ...args) => {
    options.debug?.('adapter called with values from DB', dbValues);

    const result = dbValues.map((dbValue) => fromDB(dbValue, ...args));

    options.debug?.('converted DB values to', result);

    return result;
  },
  mapToDB: (appValues, ...args) => {
    options.debug?.('adapter called with values from store', appValues);

    const result = appValues.map((appValue) => toDB(appValue, ...args));

    options.debug?.('converted store values to', result);

    return result;
  },
});

export default createAdapter;

export const identityAdapter: {
  toDB: <T>(value: T) => T;
  fromDB: <T>(value: T) => T;
} = createSimpleAdapter<any, any>(identity, identity);
