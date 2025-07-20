import { useState, useEffect } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Favorite from "./components/Favorite";

import { gql, useQuery } from '@apollo/client'
import Login from "./components/Login";

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }
`

const ALL_BOOKS = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
        id
      }
      published
      genres
      id
    }
  }
`

const ME = gql`
  query me {
    me {
      username
      favoriteGenre
      id
    }
  }
`

const App = () => {
  const [page, setPage] = useState("authors");
  const [genre, setGenre] = useState("");
  const [user, setUser] = useState(null);

  const authorsResult = useQuery(ALL_AUTHORS);
  const allBooksResult = useQuery(ALL_BOOKS);
  const booksResult = useQuery(ALL_BOOKS, {
    variables: { genre }
  });

  const { data: userData } = useQuery(ME, {
    skip: !localStorage.getItem('library-user-token')
  });

  useEffect(() => {
    if (userData?.me) {
      setUser(userData.me);
    }
  }, [userData]);

  const favoriteBooksResult = useQuery(ALL_BOOKS, {
    variables: { genre: user?.favoriteGenre },
    skip: !user?.favoriteGenre
  });

  if (authorsResult.loading || booksResult.loading) return <p>Loading...</p>;
  if (authorsResult.error) return <p>Error: {authorsResult.error.message}</p>;
  if (booksResult.error) return <p>Error: {booksResult.error.message}</p>;

  const isLoggedIn = !!localStorage.getItem('library-user-token');

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {isLoggedIn && (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("favorite")}>favorite genre</button>
          </>
        )}
        <button onClick={() => {
          if (isLoggedIn) {
            localStorage.removeItem('library-user-token');
            setUser(null);
            setPage("authors");
          } else {
            setPage("login");
          }
        }}>{isLoggedIn ? 'logout' : 'login'}</button>
      </div>

      <Authors show={page === "authors"} authors={authorsResult.data?.allAuthors} />

      <Books show={page === "books"} books={booksResult.data?.allBooks} allBooks={allBooksResult.data?.allBooks} setGenre={setGenre} />

      <NewBook show={page === "add"} />

      <Favorite
        show={page === "favorite"}
        favoriteGenre={user?.favoriteGenre}
        books={favoriteBooksResult.data?.allBooks}
      />

      <Login show={page === "login"} setShow={setPage} setUser={setUser} />
    </div>
  );
};

export default App;
