import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod"
import { loginSchema, registerSchema } from "../schemas";

const app = new Hono()
  .post("/login",
    zValidator("json", loginSchema),
    async (c) => {
      const { email, password } = c.req.valid("json");
      return c.json({ success: "ok" })
    }
  )

  .post(
    "/register",
    zValidator("json", registerSchema),
    async (c) => {
      const { name, email, password } = c.req.valid("json");
      return c.json({ success: "ok" })
    }

  )

export default app;