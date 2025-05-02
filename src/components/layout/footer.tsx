export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-12 py-6">
      <div className="container mx-auto px-4 text-center text-sm">
        © {new Date().getFullYear()} Scoreboard Central. All rights reserved.
      </div>
    </footer>
  );
}
