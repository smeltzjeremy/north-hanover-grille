/// <reference types="@cloudflare/workers-types" />
import { handleApi, type Env } from '../handler'

export const onRequest: PagesFunction<Env> = async (ctx) => handleApi(ctx.request, ctx.env)
