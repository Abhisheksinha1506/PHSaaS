"use client"

import { useState } from "react";
import Image from "next/image";
import { SaaSHubAlternative } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ExternalLink, DollarSign, Users, Info, X } from "lucide-react";

interface SaaSHubTabProps {
  data: SaaSHubAlternative[];
}

export function SaaSHubTab({ data }: SaaSHubTabProps) {
  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "name">("rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedAlternative, setSelectedAlternative] = useState<SaaSHubAlternative | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const categories = ["all", ...Array.from(new Set(data.map(item => item.category)))];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = data.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase()) ||
      item.description.toLowerCase().includes(value.toLowerCase()) ||
      item.features.some(feature => feature.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredData(filtered);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const filtered = value === "all" 
      ? data 
      : data.filter(item => item.category === value);
    setFilteredData(filtered);
  };

  const handleSort = (field: "rating" | "reviews" | "name") => {
    setSortBy(field);
    const sorted = [...filteredData].sort((a, b) => {
      if (field === "name") {
        const aValue = a.name.toLowerCase();
        const bValue = b.name.toLowerCase();
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (field === "rating") {
        const aValue = a.rating;
        const bValue = b.rating;
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      } else if (field === "reviews") {
        const aValue = a.reviews_count;
        const bValue = b.reviews_count;
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    setFilteredData(sorted);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search alternatives..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: "rating" | "reviews" | "name") => handleSort(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="reviews">Reviews</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={toggleSortOrder}>
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Total Alternatives</p>
                <p className="text-2xl font-bold text-foreground">{filteredData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-foreground">
                  {(filteredData.reduce((sum, item) => sum + item.rating, 0) / filteredData.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Total Reviews</p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredData.reduce((sum, item) => sum + item.reviews_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alternatives List */}
      <div className="grid gap-6">
        {filteredData.map((alternative) => (
          <Card key={alternative.id} className="hover:shadow-lg transition-shadow relative">
            <CardContent className="p-6">
              {/* Info Icon */}
              <button
                onClick={() => {
                  setSelectedAlternative(alternative);
                  setShowDetailsModal(true);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors z-10"
                title="View detailed information"
              >
                <Info className="h-4 w-4 text-foreground hover:text-foreground" />
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src={alternative.logo_url}
                    alt={alternative.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {alternative.name}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 bg-blue-900 text-blue-800 text-blue-200 text-xs rounded-full">
                          {alternative.category}
                        </span>
                      </div>
                      <p className="text-foreground mb-3">
                        {alternative.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {alternative.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 bg-gray-700 text-foreground text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                        {alternative.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 bg-gray-700 text-foreground text-xs rounded-full">
                            +{alternative.features.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {alternative.rating}/5
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {alternative.reviews_count} reviews
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {alternative.pricing}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2 mt-4 sm:mt-0">
                      <a
                        href={alternative.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 text-blue-400 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Visit Website
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alternative Details Modal */}
      {showDetailsModal && selectedAlternative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-700">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedAlternative.name} - Detailed Information
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Alternative Overview */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src={selectedAlternative.logo_url}
                    alt={selectedAlternative.name}
                    width={120}
                    height={120}
                    className="w-30 h-30 rounded-lg object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-bold text-foreground">
                      {selectedAlternative.name}
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 bg-blue-900 text-blue-800 text-blue-200 text-sm rounded-full">
                      {selectedAlternative.category}
                    </span>
                  </div>
                  <p className="text-lg text-foreground mb-4">
                    {selectedAlternative.description}
                  </p>
                  <div className="flex items-center gap-4 text-lg">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold">{selectedAlternative.rating}/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">{selectedAlternative.reviews_count} reviews</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">{selectedAlternative.pricing}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-yellow-50 bg-yellow-900/20 p-4 rounded-lg text-center">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{selectedAlternative.rating}</div>
                  <div className="text-sm text-foreground">Rating</div>
                </div>
                <div className="bg-blue-50 bg-blue-900/20 p-4 rounded-lg text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{selectedAlternative.reviews_count}</div>
                  <div className="text-sm text-foreground">Reviews</div>
                </div>
                <div className="bg-green-50 bg-green-900/20 p-4 rounded-lg text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-600">{selectedAlternative.pricing}</div>
                  <div className="text-sm text-foreground">Pricing</div>
                </div>
                <div className="bg-purple-50 bg-purple-900/20 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-600">{selectedAlternative.category}</div>
                  <div className="text-sm text-foreground">Category</div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAlternative.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 bg-gray-700 text-foreground text-sm rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-green-600 text-green-400 mb-3">Pros</h4>
                  <ul className="space-y-2">
                    {selectedAlternative.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-foreground">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-red-600 text-red-400 mb-3">Cons</h4>
                  <ul className="space-y-2">
                    {selectedAlternative.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span className="text-foreground">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">Links</h4>
                <div className="space-y-2">
                  <a
                    href={selectedAlternative.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-50 bg-blue-900/20 rounded-lg hover:bg-blue-100 hover:bg-blue-900/30 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800 text-blue-200">Visit Official Website</span>
                  </a>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">Additional Information</h4>
                <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-foreground">Alternative ID</div>
                      <div className="font-medium text-foreground font-mono text-sm">
                        {selectedAlternative.id}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground">Total Features</div>
                      <div className="font-medium text-foreground">
                        {selectedAlternative.features.length} features
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground">Pros Count</div>
                      <div className="font-medium text-foreground">
                        {selectedAlternative.pros.length} advantages
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground">Cons Count</div>
                      <div className="font-medium text-foreground">
                        {selectedAlternative.cons.length} limitations
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
