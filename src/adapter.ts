type EmptyObject = Record<string, never>;

type UnionToIntersection<Union> = (Union extends any ? (k: Union) => void : never) extends (k: infer Intersection) => void ? Intersection : never;

type RemapFromDBUnion<
  DBModel,
  Model,
  PartialDBModel extends Partial<DBModel>,
  KeyRemap extends [keyof PartialDBModel, keyof Model]
> = KeyRemap extends [infer ToDBKey extends keyof PartialDBModel, infer FromDBKey extends keyof Model]
  ? PartialDBModel extends { [key in ToDBKey]: Exclude<PartialDBModel[key], undefined> }
    ? { [key in FromDBKey]: Model[key] }
    : EmptyObject
  : EmptyObject;

type RemapFromDBKeys<DBModel, Model, PartialDBModel extends Partial<DBModel>, KeyRemap extends [keyof PartialDBModel, keyof Model][]> = Pick<
  Model,
  Extract<keyof Model, Exclude<keyof PartialDBModel, KeyRemap[number][0]>>
> &
  UnionToIntersection<Exclude<RemapFromDBUnion<DBModel, Model, PartialDBModel, KeyRemap[number]>, EmptyObject>>;

type RemapToDBUnion<DBModel, Model, PartialModel extends Partial<Model>, KeyRemap extends [keyof DBModel, keyof PartialModel]> = KeyRemap extends [
  infer ToDBKey extends keyof DBModel,
  infer FromDBKey extends keyof PartialModel
]
  ? PartialModel extends { [key in FromDBKey]: Exclude<PartialModel[key], undefined> }
    ? { [key in ToDBKey]: DBModel[key] }
    : EmptyObject
  : EmptyObject;

type RemapToDBKeys<DBModel, Model, PartialModel extends Partial<Model>, KeyRemap extends [keyof DBModel, keyof PartialModel][]> = Pick<
  DBModel,
  Extract<keyof DBModel, Exclude<keyof PartialModel, KeyRemap[number][1]>>
> &
  UnionToIntersection<Exclude<RemapToDBUnion<DBModel, Model, PartialModel, KeyRemap[number]>, EmptyObject>>;

export interface FromDB<DBModel, Model, FromDBArgs extends any[] = []> {
  (dbModel: DBModel, ...args: FromDBArgs): Model;
}

export interface SmartFromDB<DBModel, Model, FromDBArgs extends any[] = [], KeyRemap extends [keyof DBModel, keyof Model][] = []> {
  (dbModel: DBModel, ...args: FromDBArgs): Model;

  <PartialDBModel extends Partial<DBModel>>(dbModel: PartialDBModel, ...args: FromDBArgs): RemapFromDBKeys<DBModel, Model, PartialDBModel, KeyRemap>;
}

export interface MapFromDB<DBModel, Model, FromDBArgs extends any[] = []> {
  (dbModels: DBModel[], ...args: FromDBArgs): Model[];
}

export interface SmartMapFromDB<DBModel, Model, FromDBArgs extends any[] = [], KeyRemap extends [keyof DBModel, keyof Model][] = []> {
  (dbModels: DBModel[], ...args: FromDBArgs): Model[];

  <PartialDBModel extends Partial<DBModel>>(dbModels: PartialDBModel[], ...args: FromDBArgs): RemapFromDBKeys<
    DBModel,
    Model,
    PartialDBModel,
    KeyRemap
  >[];
}

export interface ToDB<DBModel, Model, ToDBArgs extends any[] = []> {
  (model: Model, ...args: ToDBArgs): DBModel;
}

export interface SmartToDB<DBModel, Model, ToDBArgs extends any[] = [], KeyRemap extends [keyof DBModel, keyof Model][] = []> {
  (model: Model, ...args: ToDBArgs): DBModel;

  <PartialModel extends Partial<Model>>(model: PartialModel, ...args: ToDBArgs): RemapToDBKeys<DBModel, Model, PartialModel, KeyRemap>;
}

export interface MapToDB<DBModel, Model, ToDBArgs extends any[] = []> {
  (models: Model[], ...args: ToDBArgs): DBModel[];
}

export interface SmartMapToDB<DBModel, Model, ToDBArgs extends any[] = [], KeyRemap extends [keyof DBModel, keyof Model][] = []> {
  (models: Model[], ...args: ToDBArgs): DBModel[];

  <PartialModel extends Partial<Model>>(diagrams: PartialModel[], ...args: ToDBArgs): RemapToDBKeys<DBModel, Model, PartialModel, KeyRemap>[];
}

export interface SimpleAdapter<DBModel, Model, FromDBArgs extends any[] = [], ToDBArgs extends any[] = []> {
  toDB: ToDB<DBModel, Model, ToDBArgs>;
  fromDB: FromDB<DBModel, Model, FromDBArgs>;
}

export interface SmartSimpleAdapter<
  DBModel,
  Model,
  FromDBArgs extends any[] = [],
  ToDBArgs extends any[] = [],
  KeyRemap extends [keyof DBModel, keyof Model][] = []
> {
  toDB: SmartToDB<DBModel, Model, ToDBArgs, KeyRemap>;
  fromDB: SmartFromDB<DBModel, Model, FromDBArgs, KeyRemap>;
}

export interface MultiAdapter<DBModel, Model, FromDBArgs extends any[] = [], ToDBArgs extends any[] = []>
  extends SimpleAdapter<DBModel, Model, FromDBArgs, ToDBArgs> {
  mapToDB: MapToDB<DBModel, Model, ToDBArgs>;
  mapFromDB: MapFromDB<DBModel, Model, FromDBArgs>;
}

export interface SmartMultiAdapter<
  DBModel,
  Model,
  FromDBArgs extends any[] = [],
  ToDBArgs extends any[] = [],
  KeyRemap extends [keyof DBModel, keyof Model][] = []
> extends SmartSimpleAdapter<DBModel, Model, FromDBArgs, ToDBArgs, KeyRemap> {
  mapToDB: SmartMapToDB<DBModel, Model, ToDBArgs, KeyRemap>;
  mapFromDB: SmartMapFromDB<DBModel, Model, FromDBArgs, KeyRemap>;
}

export interface AdapterOptions {
  debug?: (message: string, model: unknown) => void;
}

export interface AnyMultiAdapter extends MultiAdapter<any, any> {}

export interface AnySimpleAdapter extends SimpleAdapter<any, any> {}

const toDBFactory =
  <ToDBArgs extends any[] = []>(toDB: (model: any, ...args: ToDBArgs) => any, { debug }: AdapterOptions = {}) =>
  (model: any, ...args: ToDBArgs): any => {
    debug?.('adapter called with value from the store', model);

    const result = toDB(model, ...args);

    debug?.('converted store value to', result);

    return result;
  };

const fromDBFactory =
  <FromDBArgs extends any[] = []>(fromDB: (dbModel: any, ...args: FromDBArgs) => any, { debug }: AdapterOptions = {}) =>
  (dbModel: any, ...args: FromDBArgs): any => {
    debug?.('adapter called with value from DB', dbModel);

    const result = fromDB(dbModel, ...args);

    debug?.('converted DB value to', result);

    return result;
  };

const mapToDBFactory =
  <ToDBArgs extends any[] = []>(toDB: (model: any, ...args: ToDBArgs) => any, { debug }: AdapterOptions = {}) =>
  (models: any[], ...args: ToDBArgs): any[] => {
    debug?.('adapter called with values from store', models);

    const result = models.map((model) => toDB(model, ...args));

    debug?.('converted store values to', result);

    return result;
  };

const mapFromDBFactory =
  <FromDBArgs extends any[] = []>(fromDB: (dbModel: any, ...args: FromDBArgs) => any, { debug }: AdapterOptions = {}) =>
  (dbModels: any[], ...args: FromDBArgs): any[] => {
    debug?.('adapter called with values from DB', dbModels);

    const result = dbModels.map((dbModel) => fromDB(dbModel, ...args));

    debug?.('converted DB values to', result);

    return result;
  };

export const createSimpleAdapter = <DBModel, Model, FromDBArgs extends any[] = [], ToDBArgs extends any[] = []>(
  fromDB: (dbModel: DBModel, ...args: FromDBArgs) => Model,
  toDB: (model: Model, ...args: ToDBArgs) => DBModel,
  options: AdapterOptions = {}
): SimpleAdapter<DBModel, Model, FromDBArgs, ToDBArgs> => ({
  toDB: toDBFactory(toDB, options),

  fromDB: fromDBFactory(fromDB, options),
});

export const createSmartSimpleAdapter = <
  DBModel,
  Model,
  FromDBArgs extends any[] = [],
  ToDBArgs extends any[] = [],
  KeyRemap extends [keyof DBModel, keyof Model][] = []
>(
  fromDB: (dbModel: Partial<DBModel>, ...args: FromDBArgs) => Partial<Model>,
  toDB: (model: Partial<Model>, ...args: ToDBArgs) => Partial<DBModel>,
  options: AdapterOptions = {}
  // eslint-disable-next-line sonarjs/no-identical-functions
): SmartSimpleAdapter<DBModel, Model, FromDBArgs, ToDBArgs, KeyRemap> => ({
  toDB: toDBFactory(toDB, options),

  fromDB: fromDBFactory(fromDB, options),
});

export const createMultiAdapter = <DBModel, Model, FromDBArgs extends any[] = [], ToDBArgs extends any[] = []>(
  fromDB: (dbModel: DBModel, ...args: FromDBArgs) => Model,
  toDB: (model: Model, ...args: ToDBArgs) => DBModel,
  options: AdapterOptions = {}
): MultiAdapter<DBModel, Model, FromDBArgs, ToDBArgs> => ({
  ...createSimpleAdapter<DBModel, Model, FromDBArgs, ToDBArgs>(fromDB, toDB, options),

  mapToDB: mapToDBFactory(toDB, options),

  mapFromDB: mapFromDBFactory(fromDB, options),
});

export const createSmartMultiAdapter = <
  DBModel,
  Model,
  FromDBArgs extends any[] = [],
  ToDBArgs extends any[] = [],
  KeyRemap extends [keyof DBModel, keyof Model][] = []
>(
  fromDB: (dbModel: Partial<DBModel>, ...args: FromDBArgs) => Partial<Model>,
  toDB: (model: Partial<Model>, ...args: ToDBArgs) => Partial<DBModel>,
  options: AdapterOptions = {}
): SmartMultiAdapter<DBModel, Model, FromDBArgs, ToDBArgs, KeyRemap> => ({
  ...createSmartSimpleAdapter<DBModel, Model, FromDBArgs, ToDBArgs, KeyRemap>(fromDB, toDB, options),

  mapToDB: mapToDBFactory(toDB, options),

  mapFromDB: mapFromDBFactory(fromDB, options),
});
