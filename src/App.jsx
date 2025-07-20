import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";

import { gql, useQuery, useMutation } from '@apollo/client'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author
      published
      genres
    }
  }
`

const App = () => {
  const authorsResult = useQuery(ALL_AUTHORS)
  const booksResult = useQuery(ALL_BOOKS)
  const [page, setPage] = useState("authors");

  if (authorsResult.loading || booksResult.loading) return <p>Loading...</p>;
  if (authorsResult.error) return <p>Error: {authorsResult.error.message}</p>;
  if (booksResult.error) return <p>Error: {booksResult.error.message}</p>;

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
      </div>

      <Authors show={page === "authors"} authors={authorsResult.data?.allAuthors} />

      <Books show={page === "books"} books={booksResult.data?.allBooks} />

      <NewBook show={page === "add"} />
    </div>
  );
};

export default App;
