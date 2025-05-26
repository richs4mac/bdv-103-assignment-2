import { BookId, Book } from "../src/types";
import assignment1 from "./assignment-1";

const apiUrl = `http://localhost:3001/books`;

async function listBooks(filters?: Array<{ from?: number, to?: number; }>): Promise<Book[]> {
  return assignment1.listBooks(filters);
}

async function createOrUpdateBook(book: Book): Promise<BookId> {
  let result = await fetch(apiUrl, { method: "POST", body: JSON.stringify(book) });

  if (result.ok) {
    // And if it is valid, we parse the JSON result and return it.
    return (await result.json() as BookId);
  } else {
    console.log("Failed to create or update book: ", await result.text());
    throw new Error("Failed to create or update book");
  }
}

async function removeBook(book: BookId): Promise<void> {
  throw new Error("Todo");
}

const assignment = "assignment-2";

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks
};