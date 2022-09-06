import { createMultiAdapter, createSimpleAdapter } from './adapter';

export type Identity = <Model>(model: Model) => Model;
export type IdentityMulti = <Model>(models: Model[]) => Model[];

export interface Simple {
  toDB: Identity;
  fromDB: Identity;
}

export interface Multi extends Simple {
  mapToDB: IdentityMulti;
  mapFromDB: IdentityMulti;
}

export const transformer: Identity = (value) => value;

export const multi: Multi = createMultiAdapter<any, any>(transformer, transformer);

export const simple: Simple = createSimpleAdapter<any, any>(transformer, transformer);

export const createMulti = <Model>() => createMultiAdapter<Model, Model>(transformer, transformer);

export const createSimple = <Model>() => createSimpleAdapter<Model, Model>(transformer, transformer);
