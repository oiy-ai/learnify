export type FieldType = 'string' | 'number' | 'boolean' | 'json' | 'enum';

export interface FieldSchema<Type = unknown> {
  type: FieldType;
  optional: boolean;
  isPrimaryKey: boolean;
  default?: () => Type;
  values?: Type[];
}

export type TableSchema = Record<string, FieldSchema>;
export type TableSchemaBuilder = Record<
  string,
  FieldSchemaBuilder<any, boolean>
>;
export type DocumentTableSchemaBuilder = TableSchemaBuilder & {
  __document: FieldSchemaBuilder<boolean, true, false>;
};

export type DBSchemaBuilder = Record<string, TableSchemaBuilder>;

export class FieldSchemaBuilder<
  Type = unknown,
  Optional extends boolean = false,
  PrimaryKey extends boolean = false,
> {
  schema: FieldSchema = {
    type: 'string',
    optional: false,
    isPrimaryKey: false,
    default: undefined,
    values: undefined,
  };

  constructor(type: FieldType, values?: string[]) {
    this.schema.type = type;
    this.schema.values = values;
  }

  optional() {
    this.schema.optional = true;
    return this as FieldSchemaBuilder<Type, true, PrimaryKey>;
  }

  default(value: () => Type) {
    this.schema.default = value;
    this.schema.optional = true;
    return this as FieldSchemaBuilder<Type, true, PrimaryKey>;
  }

  primaryKey() {
    this.schema.isPrimaryKey = true;
    return this as FieldSchemaBuilder<Type, Optional, true>;
  }
}

export const f = {
  string: () => new FieldSchemaBuilder<string>('string'),
  number: () => new FieldSchemaBuilder<number>('number'),
  boolean: () => new FieldSchemaBuilder<boolean>('boolean'),
  json: <T = any>() => new FieldSchemaBuilder<T>('json'),
  enum: <T extends string>(...values: T[]) =>
    new FieldSchemaBuilder<T>('enum', values),
} as const;

export const t = {
  document: <T extends TableSchemaBuilder>(schema: T) => {
    return {
      ...schema,
      __document: new FieldSchemaBuilder<boolean>('boolean').optional(),
    };
  },
};
