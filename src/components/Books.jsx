const Books = ({ show, books, setGenre, allBooks }) => {

  if (!show) {
    return null
  }
  const genres = allBooks?.flatMap(book => book.genres).filter((v, i, a) => a.indexOf(v) === i);
  const genreList = genres.map((genre, index) => (
    <button key={index} onClick={() => setGenre(genre)}>
      {genre}
    </button>
  ));

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books?.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul>{genreList}</ul>

    </div>
  )
}

export default Books
