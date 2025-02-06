import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      username: string;
      created_at: string;
    };
  }
}
