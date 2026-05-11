import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Loader2Icon } from 'lucide-react'
import { GoogleBrandIcon } from '@/components/restaurant/GoogleBrandIcon'
import { AiChatbotLogo } from '@/components/AiChatbotLogo'

export type RestaurantLoginFormProps = {
  className?: string
  title: string
  description?: ReactNode
  signupLink: ReactNode
  banner?: ReactNode
  configHint?: ReactNode
  /** Email + Login submits magic link (existing accounts only). */
  onEmailMagicLink: (email: string) => Promise<{ error?: string } | undefined>
  onGoogleContinue: () => void
  emailDisabled?: boolean
  googleDisabled?: boolean
  googlePending?: boolean
  footerNote?: ReactNode
  logo?: ReactNode
}

/**
 * login-05 layout: email + Login, separator, Google OAuth.
 */
export function LoginForm({
  className,
  title,
  description,
  signupLink,
  banner,
  configHint,
  onEmailMagicLink,
  onGoogleContinue,
  emailDisabled,
  googleDisabled,
  googlePending,
  footerNote,
  logo,
}: RestaurantLoginFormProps) {
  const [email, setEmail] = useState('')
  const [emailPending, setEmailPending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const submitEmail = useCallback(async () => {
    setEmailError(null)
    setEmailSent(false)
    setEmailPending(true)
    const result = await onEmailMagicLink(email.trim())
    setEmailPending(false)
    if (result?.error) {
      setEmailError(result.error)
      return
    }
    setEmailSent(true)
  }, [email, onEmailMagicLink])

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                {logo ?? <AiChatbotLogo sizePx={24} />}
              </div>
              <span className="sr-only">{title}</span>
            </div>
            <h1 className="text-xl font-bold">{title}</h1>
            {description ? (
              <FieldDescription className="max-w-sm px-0 text-center">{description}</FieldDescription>
            ) : null}
            <FieldDescription className="text-center">{signupLink}</FieldDescription>
          </div>

          {banner ? (
            <div
              className="rounded-xl border border-destructive/35 bg-destructive/5 px-4 py-3 text-[13px] leading-snug text-foreground dark:bg-destructive/10"
              role="alert"
            >
              {banner}
            </div>
          ) : null}

          {configHint ? (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-3 text-[13px] leading-snug text-muted-foreground">
              {configHint}
            </div>
          ) : null}

          <form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault()
              void submitEmail()
            }}
          >
            <Field>
              <FieldLabel htmlFor="restaurant-login-email">Email</FieldLabel>
              <Input
                id="restaurant-login-email"
                name="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
                value={email}
                disabled={emailDisabled || emailPending}
                aria-invalid={!!emailError}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailSent(false)
                  setEmailError(null)
                }}
              />
              {emailError ? (
                <p className="text-sm text-destructive" role="alert">
                  {emailError}
                </p>
              ) : null}
              {emailSent ? (
                <FieldDescription>
                  Check your inbox for a sign-in link. It expires after a short time.
                </FieldDescription>
              ) : null}
            </Field>
            <Field>
              <Button type="submit" className="w-full" disabled={emailDisabled || emailPending}>
                {emailPending ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" aria-hidden />
                    Sending…
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </Field>
          </form>

          <FieldSeparator>Or</FieldSeparator>

          <Field>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              disabled={googleDisabled || googlePending}
              onClick={onGoogleContinue}
            >
              {googlePending ? (
                <Loader2Icon className="animate-spin" aria-hidden />
              ) : (
                <GoogleBrandIcon aria-hidden />
              )}
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </div>

      {footerNote ? (
        <FieldDescription className="px-6 text-center">{footerNote}</FieldDescription>
      ) : null}
    </div>
  )
}
