import { ClerkClientProvider } from "@/components/providers/clerk-client-provider"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <ClerkClientProvider>{children}</ClerkClientProvider>
}
