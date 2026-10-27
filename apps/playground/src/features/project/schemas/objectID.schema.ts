import { z } from "zod"

/**
 * A MongoDB document ID, checked before a query so a bad ID cannot make the query throw.
 */
export const objectIDSchema = z.string().regex(/^[a-f\d]{24}$/i)
