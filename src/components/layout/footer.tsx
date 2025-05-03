export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-12 py-6">
      <div className="container mx-auto px-4 text-center text-sm">
        <p className="text-white">
          © {new Date().getFullYear()} Kurukshetra. All rights reserved.
        </p>
        <p className="text-white mt-2">
          For updates and queries, follow us on{' '}
          <a
            href="https://www.instagram.com/kurukshetra.2k25"
            className="text-accent hover:underline"
          >
            Instagram
          </a>.
        </p>
        <p className="text-white mt-2">
          Developed by{' '}
          <a
            href="https://www.linkedin.com/in/cpvasanth/"
            className="text-accent hover:underline"
          >
            Vasa &#9829;
          </a>
        </p>
      </div>
    </footer>
  );
}
