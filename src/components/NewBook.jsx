import { useState } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'

const ADD_BOOK = gql`
    mutation addBook($title: String!, $published: Int!, $author: String!,
      $genres: [String!]!) {
      addBook(title: $title, published: $published, author: $author, genres: $genres) {
        title
        author
        published
        genres
      }
    }
  `



const NewBook = ({ show }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const [addBook] = useMutation(ADD_BOOK)

  const submit = async (event) => {
    event.preventDefault()
    await addBook({ variables: { title, published: parseInt(published), author, genres } });
    setTitle('')
    setAuthor('')
    setPublished('')
    setGenre('')
    setGenres([])
  }

  if (!show) {
    return null
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook