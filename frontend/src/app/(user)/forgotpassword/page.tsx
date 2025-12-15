export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-foreground">
          Mock User Credentials
        </h1>
        <p className="text-sm text-muted-foreground">
          The password for all mock user accounts is
        </p>
        <p className="mt-2 rounded-md bg-muted px-4 py-2 font-mono text-sm font-medium">
          12345678
        </p>
      </div>
    </div>
  )
}