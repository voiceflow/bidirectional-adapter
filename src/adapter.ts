export interface FromDB<DBModel, Model, FromDBArgs extends any[] = []> {
  (dbModel: DBModel, ...args: FromDBArgs): Model;
}

export interface SmartFromDB<DBModel, Model, FromDBArgs extends any[] = []> extends FromDB<DBModel, Model, FromDBArgs> {
  <PartialDBModel extends Partial<DBModel>>(dbModel: PartialDBModel, ...args: FromDBArgs): Pick<Model, Extract<keyof Model, keyof PartialDBModel>>;
}

export interface MapFromDB<DBModel, Model, FromDBArgs extends any[] = []> {
  (dbModels: DBModel[], ...args: FromDBArgs): Model[];
}

export interface SmartMapFromDB<DBModel, Model, FromDBArgs extends any[] = []> extends MapFromDB<DBModel, Model, FromDBArgs> {
  <PartialDBModel extends Partial<DBModel>>(dbModels: PartialDBModel[], ...args: FromDBArgs): Pick<
    Model,
    Extract<keyof Model, keyof PartialDBModel>
  >[];
}

export interface ToDB<DBModel, Model, ToDBArgs extends any[] = []> {
  (model: Model, ...args: ToDBArgs): DBModel;
}

export interface SmartToDB<DBModel, Model, ToDBArgs extends any[] = []> extends ToDB<DBModel, Model, ToDBArgs> {
  <PartialModel extends Partial<Model>>(model: PartialModel, ...args: ToDBArgs): Pick<DBModel, Extract<keyof DBModel, keyof PartialModel>>;
}

export interface MapToDB<DBModel, Model, ToDBArgs extends any[] = []> {
  (models: Model[], ...args: ToDBArgs): DBModel[];
}

export interface SmartMapToDB<DBModel, Model, ToDBArgs extends any[] = []> extends MapToDB<DBModel, Model, ToDBArgs> {
  <PartialModel extends Partial<Model>>(diagrams: PartialModel[], ...args: ToDBArgs): Pick<DBModel, Extract<keyof DBModel, keyof PartialModel>>[];
}

export interface SimpleAdapter<DBModel, Model, FromDBArgs extends any[] = [], ToDBArgs extends any[] = []> {
  toDB: ToDB<DBModel, Model, ToDBArgs>;
  fromDB: FromDB<DBModel, Model, FromDBArgs>;
}

export interface SmartSimpleAdapter<DBModel, Model, FromDBArgs extends any[] = [], ToDBArgs extends any[] = []> {
  toDB: SmartToDB<DBModel, Model, ToDBArgs>;
  fromDB: SmartFromDB<DBModel, Model, FromDBArgs>;
}

export interface MultiAdapter<DBModel, Model, FromDBArgs extends any[] = [], ToDBArgs extends any[] = []>
  extends SimpleAdapter<DBModel, Model, FromDBArgs, ToDBArgs> {
  mapToDB: MapToDB<DBModel, Model, ToDBArgs>;
  mapFromDB: MapFromDB<DBModel, Model, FromDBArgs>;
}

export interface SmartMultiAdapter<DBModel, Model, FromDBArgs extends any[] = [], ToDBArgs extends any[] = []>
  extends SmartSimpleAdapter<DBModel, Model, FromDBArgs, ToDBArgs> {
  mapToDB: SmartMapToDB<DBModel, Model, ToDBArgs>;
  mapFromDB: SmartMapFromDB<DBModel, Model, FromDBArgs>;
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

export const createSmartSimpleAdapter = <DBModel, Model, FromDBArgs extends any[] = [], ToDBArgs extends any[] = []>(
  fromDB: (dbModel: Partial<DBModel>, ...args: FromDBArgs) => Partial<Model>,
  toDB: (model: Partial<Model>, ...args: ToDBArgs) => Partial<DBModel>,
  options: AdapterOptions = {}
  // eslint-disable-next-line sonarjs/no-identical-functions
): SmartSimpleAdapter<DBModel, Model, FromDBArgs, ToDBArgs> => ({
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

export const createSmartMultiAdapter = <DBModel, Model, FromDBArgs extends any[] = [], ToDBArgs extends any[] = []>(
  fromDB: (dbModel: Partial<DBModel>, ...args: FromDBArgs) => Partial<Model>,
  toDB: (model: Partial<Model>, ...args: ToDBArgs) => Partial<DBModel>,
  options: AdapterOptions = {}
): MultiAdapter<DBModel, Model, FromDBArgs, ToDBArgs> => ({
  ...createSmartSimpleAdapter<DBModel, Model, FromDBArgs, ToDBArgs>(fromDB, toDB, options),

  mapToDB: mapToDBFactory(toDB, options),

  mapFromDB: mapFromDBFactory(fromDB, options),
});
