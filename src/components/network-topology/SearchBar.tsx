import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const SearchBar = ({ onSearch }) => {
    return (
        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="text" placeholder="Search devices..." className="pl-8" onChange={(e) => onSearch(e.target.value)} />
        </div>
    )
}

export default SearchBar

