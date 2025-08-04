import { createEntityClient } from "../utils/entityWrapper";
import schema from "./Butterfly.json";
export const Butterfly = createEntityClient("Butterfly", schema);
