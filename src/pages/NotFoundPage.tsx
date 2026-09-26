import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <section className="panel">
      <h1>Page not found</h1>
      <p>
        <Link to="/">Back to events</Link>
      </p>
    </section>
  );
}
