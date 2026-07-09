/**
 * Layout /auth/* — les pages gèrent elles-mêmes leur layout split-screen.
 * Ce layout est un simple pass-through.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
