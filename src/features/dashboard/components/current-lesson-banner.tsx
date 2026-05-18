"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CurrentLessonBannerProps {
  lessonName: string
  moduleName: string
  progress: number
}

export function CurrentLessonBanner({ lessonName, moduleName, progress }: CurrentLessonBannerProps) {
  return (
    <Card className="bg-white border border-slate-200 shadow-sm py-0 gap-0 
  transition-all duration-300 ease-in-out
  hover:bg-slate-50 hover:shadow-lg hover:scale-[1.01] hover:border-slate-300 
  cursor-pointer"
>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              In progress
            </span>
            <h2 className="text-2xl font-bold text-foreground">{lessonName}</h2>
            <p className="text-sm text-muted-foreground mt-1">{moduleName}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">{progress}% Completed</span>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Continue lesson
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
