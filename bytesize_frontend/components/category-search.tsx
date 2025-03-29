"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"
import { CATEGORIES, type CategoryType } from "@/lib/categories"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface CategorySearchProps {
  selectedCategories: CategoryType[]
  onSelectCategory: (category: CategoryType) => void
  onClearCategories: () => void
}

export function CategorySearch({
  selectedCategories,
  onSelectCategory,
  onClearCategories,
}: CategorySearchProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const categories = React.useMemo(() => {
    return Object.entries(CATEGORIES).map(([name, { color }]) => ({
      name: name as CategoryType,
      color,
    }))
  }, [])

  const filteredCategories = React.useMemo(() => {
    if (!search) return categories
    const searchLower = search.toLowerCase()
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchLower)
    )
  }, [categories, search])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selectedCategories.map((category) => (
          <Badge
            key={category}
            className={cn(
              "font-medium cursor-pointer hover:opacity-80 active:scale-95 transition-all duration-200",
              CATEGORIES[category].color
            )}
            onClick={() => onSelectCategory(category)}
          >
            {category}
            <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCategories}
            className="h-6 hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all duration-200"
          >
            Clear all
          </Button>
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all duration-200"
          >
            <Search className="mr-2 h-4 w-4" />
            Search categories...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-2" align="start">
          <div className="space-y-2">
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
            <ScrollArea className="h-[88px]">
              <div className="grid grid-cols-4 gap-2">
                {filteredCategories.map(({ name, color }) => (
                  <button
                    key={name}
                    onClick={() => {
                      onSelectCategory(name)
                      setOpen(false)
                      setSearch("")
                    }}
                    className="flex items-center p-2 rounded-md hover:bg-secondary text-left transition-colors duration-200 active:scale-95"
                  >
                    <Badge className={cn(
                      "font-medium w-full justify-center hover:opacity-80 transition-all duration-200",
                      color
                    )}>
                      {name}
                    </Badge>
                  </button>
                ))}
                {filteredCategories.length === 0 && (
                  <p className="col-span-4 text-sm text-muted-foreground text-center py-4">
                    No categories found.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default CategorySearch