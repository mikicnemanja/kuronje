import { createClient } from "@ponder/client";
import * as schema from "../../../ponder/ponder.schema";

// Create the Ponder client - update the URL to match your Ponder server
const client = createClient("http://localhost:42069/sql", { schema });

// Register schema globally for TypeScript
declare module "@ponder/react" {
  interface Register {
    schema: typeof schema;
  }
}

export { client, schema };
