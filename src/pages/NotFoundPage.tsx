import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="container not-found">
      <h1 className="page-title">Page not found</h1>
      <p className="page-subtitle">
        The series or page you are looking for does not exist.
      </p>
      <Link to="/work" className="text-link">
        Back to work →
      </Link>
    </div>
  );
}
