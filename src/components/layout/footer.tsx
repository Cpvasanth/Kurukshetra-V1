export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-12 py-6">
      <div className="container mx-auto px-4 text-center text-sm">
        © {new Date().getFullYear()} Kurukshetra. All rights reserved. {/* Updated Name */}
      </div>
    </footer>
  );
}
