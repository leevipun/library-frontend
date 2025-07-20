import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'

const ADD_BOOK = gql`
    mutation addBook($title: String!, $published: Int!, $author: String!,
      $genres: [String!]!) {
      addBook(title: $title, published: $published, author: $author, genres: $genres) {
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

const ALL_BOOKS = gql`
  query {
    allBooks {
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

const NewBook = ({ show }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [
      { query: ALL_BOOKS },
      { query: ALL_AUTHORS }
    ],
    onError: (error) => {
      console.error('Error adding book:', error)
    }
  })

  const submit = async (event) => {
    event.preventDefault()

    if (!title || !author || !published) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await addBook({
        variables: {
          title,
          published: parseInt(published),
          author,
          genres
        }
      })
      setTitle('')
      setAuthor('')
      setPublished('')
      setGenre('')
      setGenres([])
    } catch (error) {
      console.error('Error adding book:', error)
    }
  }

  if (!show) {
    return null
  }

  const addGenre = () => {
    if (genre && !genres.includes(genre)) {
      setGenres(genres.concat(genre))
      setGenre('')
    }
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            required
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
            required
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
            required
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
            placeholder="Add genre"
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