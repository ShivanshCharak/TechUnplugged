import { useState } from "react";
import { SearchFiltersProps } from "../types";
export const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onSearch, 
  onTagFilter, 
  onSortChange, 
  availableTags 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'trending'>('newest');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    onTagFilter(newTags);
  };

  const handleSortChange = (newSort: 'newest' | 'oldest' | 'popular' | 'trending') => {
    console.log(newSort)
    setSortBy(newSort);
    onSortChange(newSort);
  };
  console.log("cortr",sortBy)

  return (
    <div className="mb-8 p-6  rounded-lg shadow-sm border bg-[#0B0B0B] border-[#1A1717]">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </div>
      </form>


      {/* Tag Filters */}
      {availableTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by tags:</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Sort Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as any)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-inherit focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
          <option value="trending">Trending</option>
        </select>
      </div>
    </div>
  );
};