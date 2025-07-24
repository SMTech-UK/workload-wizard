import { providerMap, signIn } from '../../auth'
import { Button } from '@/components/ui/button'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

const SIGNIN_ERROR_URL = '/error'

export function ProviderButtons({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <div className="flex flex-col gap-4">
      {providerMap.map((provider) => (
        <form
          key={provider.id}
          action={async () => {
            'use server'
            try {
              await signIn(provider.id, {
                redirectTo: callbackUrl ?? '',
              })
            } catch (error) {
              if (error instanceof AuthError) {
                return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
              }
              throw error
            }
          }}
        >
          <Button variant="outline" className="w-full" type="submit">
            Sign in with {provider.name}
          </Button>
        </form>
      ))}
    </div>
  )
} 