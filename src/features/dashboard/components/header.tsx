import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="flex items-center justify-end gap-4 pb-6">
      <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
        Sign Out
      </Button>
      <Avatar className="size-10 ring-2 ring-primary/20">
        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-1654299645785-1654299645785?w=80&auto=format&fit=crop&crop=face" alt="User avatar" />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">JD</AvatarFallback>
      </Avatar>
    </header>
  )
}