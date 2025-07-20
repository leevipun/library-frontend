import { useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'

const SET_FAVORITE_GENRE = gql`
  mutation setFavoriteGenre($genre: String!) {
    setFavoriteGenre(genre: $genre) {
      username
      favoriteGenre
      id
    }
  }
`

const ALL_BOOKS = gql`
  query {
    allBooks {
      genres
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

export default function Favorite({ show, favoriteGenre, books }) {
    const [selectedGenre, setSelectedGenre] = useState('')
    const [setFavoriteGenre] = useMutation(SET_FAVORITE_GENRE, {
        refetchQueries: [{ query: ME }],
        onError: (error) => {
            console.error('Error setting favorite genre:', error)
        }
    })

    const { data: allBooksData } = useQuery(ALL_BOOKS)

    if (!show) {
        return null
    }

    // Get unique genres from all books
    const genres = allBooksData?.allBooks
        ?.flatMap(book => book.genres)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort() || []

    const handleSetFavoriteGenre = async (event) => {
        event.preventDefault()
        if (!selectedGenre) {
            alert('Please select a genre')
            return
        }

        try {
            await setFavoriteGenre({
                variables: { genre: selectedGenre }
            })
            setSelectedGenre('')
        } catch (error) {
            console.error('Error setting favorite genre:', error)
        }
    }

    return (
        <div>
            <h2>Favorite Genre Books</h2>

            <div>
                <h3>Set Favorite Genre</h3>
                <form onSubmit={handleSetFavoriteGenre}>
                    <select
                        value={selectedGenre}
                        onChange={({ target }) => setSelectedGenre(target.value)}
                    >
                        <option value="">Select a genre</option>
                        {genres.map((genre, index) => (
                            <option key={index} value={genre}>{genre}</option>
                        ))}
                    </select>
                    <button type="submit">Set as favorite</button>
                </form>
            </div>

            {favoriteGenre ? (
                <div>
                    <p>Your favorite genre: <strong>{favoriteGenre}</strong></p>
                    {books && books.length > 0 ? (
                        <div>
                            <h3>Books in your favorite genre:</h3>
                            <table>
                                <tbody>
                                    <tr>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th>Published</th>
                                    </tr>
                                    {books.map(book => (
                                        <tr key={book.id}>
                                            <td>{book.title}</td>
                                            <td>{book.author.name}</td>
                                            <td>{book.published}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No books found in your favorite genre.</p>
                    )}
                </div>
            ) : (
                <p>No favorite genre set. Select one above to set your favorite genre.</p>
            )}
        </div>
    )
}