import { useState } from 'react'

import { gql, useMutation } from "@apollo/client"

const UPDATE_AUTHOR_BORN = gql`
  mutation editYear($name: String!, $setBornTo: Int!) {
    editYear(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`

const Authors = ({ show, authors }) => {
  const [born, setBorn] = useState('')
  const [updateBornYear] = useMutation(UPDATE_AUTHOR_BORN)
  if (!show) {
    return null
  }

  console.log(authors)

  const submitNewYear = (author) => {

    updateBornYear({ variables: { name: author, setBornTo: parseInt(born) } })
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
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Add author birth year</h3>
      <select>
        {authors.map((a) => (
          <option key={a.name} value={a.name}>{a.name}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Year of birth"
        onChange={({ target }) => setBorn(target.value)}
      />
      <button onClick={() => submitNewYear(document.querySelector('select').value)}>
        update year
      </button>
    </div>
  )
}

export default Authors
