import { type Row, definePermissions, ANYONE_CAN_DO_ANYTHING } from "@rocicorp/zero";
import { schema, type Schema } from "./zero-schema.gen";

export { schema, type Schema };

export type User = Row<typeof schema.tables.user>;
//            ^ {
//                readonly id: string;
//                readonly name: string;
//                readonly email: `${string}@${string}`;
//              }

export const permissions = definePermissions<{}, Schema>(schema, () => {
  
  return {
    leads: ANYONE_CAN_DO_ANYTHING,
    users: ANYONE_CAN_DO_ANYTHING
    
  }
});