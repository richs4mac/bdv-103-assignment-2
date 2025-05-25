import { z } from "zod";
import Koa from "koa";
import cors from "@koa/cors";
import zodRouter from 'koa-zod-router';
import qs from "koa-qs";
import { v4 as uuid, validate as isUuid } from 'uuid';
import book_list from "../mcmasterful-book-list.json";
import { Book, bookSchema } from "./types";

const app = new Koa();

// We use koa-qs to enable parsing complex query strings, like our filters.
qs(app);

// And we add cors to ensure we can access our API from the mcmasterful-books website
app.use(cors());


const router = zodRouter();

// in-memory book list
let booksDb = [...book_list];

router.register({
	name: "list books",
	method: "get",
	path: "/books",
	validate: {
		query: z.object({
			filters: z.object({
				from: z.coerce.number().optional(),
				to: z.coerce.number().optional()
			}).array().optional()
		})
	},
	handler: async (ctx, next) => {
		const { filters } = ctx.request.query;

		// If there are no filters we can return the list directly
		if (!filters || filters.length === 0) {
			ctx.body = booksDb;
			await next();
			return;
		}

		// We can use a record to prevent duplication - so if the same book is valid from multiple sources
		// it'll only exist once in the record.
		// We set the value to "true" because it makes checking it later when returning the result easy.
		let filtered: Record<number, true> = {};

		for (let { from, to } of filters) {
			for (let [index, { price }] of booksDb.entries()) {
				let matches = true;
				if (from && price < from) {
					matches = false;
				}
				if (to && price > to) {
					matches = false;
				}
				if (matches) {
					filtered[index] = true;
				}
			}
		}

		ctx.body = booksDb.filter((_book: Book, index: number) => filtered[index] === true);
		await next();
	}
});


router.register({
	name: "create or update a book",
	method: "post",
	path: "/books",
	validate: {
		body: bookSchema,
	},
	handler: async (ctx, next) => {
		const body = ctx.request.body as Book;

		if (body.id) {
			// if body has ID, check if it's a valid UUID
			const isIdValid = isUuid(body.id);
			if (!isIdValid) {
				ctx.status = 400;
				ctx.body = { error: `Invalid request` };
			}

			// check if book ID is in DB
			if (booksDb.find(book => book.id === body.id)) {
				// update existing book by ID
				booksDb = booksDb.map(book => ({
					...book,
					...(book.id === body.id ? body : {})
				}));
				ctx.body = body.id;
			} else {
				ctx.status = 404;
				ctx.body = { error: `Book not found` };
			}
		} else {
			// if body has no ID, create new book
			const id = uuid();
			booksDb = booksDb.concat({ ...body, id });
			ctx.body = id;
		}

		await next();
	}
});

app.use(router.routes());

app.listen(3001, () => {
	console.log("listening!");
});