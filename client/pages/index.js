import Link from "next/link";

const LandingPage = ({ currentUser, books }) => {
  const bookList = books.map((book) => {
    return (
      <tr key={book.id}>
        <td>{book.title}</td>
        <td>{book.price}</td>
        <td>
          <Link href="/books/[bookId]" as={`/books/${book.id}`}><a>View</a></Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>books</h1>
      <table className="table">
        <thead>
        <tr>
          <th>Title</th>
          <th>Price</th>
          <th>Link</th>
        </tr>
        </thead>
        <tbody>{bookList}</tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get("/api/books");

  return { books: data };
};

export default LandingPage;
