import { useState } from 'react'

import { gql, useMutation } from "@apollo/client"

const UPDATE_AUTHOR_BORN = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
      bookCount
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

const Authors = ({ show, authors }) => {
  const [born, setBorn] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [updateBornYear] = useMutation(UPDATE_AUTHOR_BORN, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      console.error('Error updating author:', error)
    }
  })

  if (!show) {
    return null
  }

  const submitNewYear = async (event) => {
    event.preventDefault()
    if (!selectedAuthor || !born) {
      alert('Please select an author and enter a birth year')
      return
    }

    try {
      await updateBornYear({
        variables: {
          name: selectedAuthor,
          setBornTo: parseInt(born),
          token: localStorage.getItem('library-user-token') // Assuming you store the token in localStorage
        }
      })
      setBorn('')
      setSelectedAuthor('')
    } catch (error) {
      console.error('Error updating author:', error)
    }
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors?.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Set birthyear</h3>
      <form onSubmit={submitNewYear}>
        <select
          value={selectedAuthor}
          onChange={({ target }) => setSelectedAuthor(target.value)}
        >
          <option value="">Select author</option>
          {authors?.map((a) => (
            <option key={a.name} value={a.name}>{a.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Year of birth"
          value={born}
          onChange={({ target }) => setBorn(target.value)}
        />
        <button type="submit">
          update author
        </button>
      </form>
    </div>
  )
}

export default Authors
