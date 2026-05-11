import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** Placeholder — venue menu management & catalog sync will live here. */
export function RestaurantMenuPage() {
  return (
    <Card className="shadow-sm ring-1 ring-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg tracking-tight">Menu</CardTitle>
        <CardDescription className="text-[15px] leading-relaxed">
          Sections, pricing, availability, and links to the guest-facing catalog will be configured here.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-8 pt-2">
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          This screen is structured for upcoming venue tools — nothing to configure yet.
        </p>
      </CardContent>
    </Card>
  )
}
