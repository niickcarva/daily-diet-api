import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      username: string;
      created_at: string;
    };

    meals: {
      id: string;
      name: string;
      description?: string;
      is_diet: boolean;
      created_at: string;
      user_id: string;
    };
  }
}
