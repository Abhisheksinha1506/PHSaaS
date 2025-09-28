"use client"

import { useState } from "react";
import Image from "next/image";
import { ProductHuntPost } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, MessageCircle, Calendar, User, Info, X } from "lucide-react";
import { formatNumber } from "@/lib/number-utils";

interface ProductHuntTabProps {
  data: ProductHuntPost[];
}

export function ProductHuntTab({ data }: ProductHuntTabProps) {
  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"votes" | "comments" | "date">("votes");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedProduct, setSelectedProduct] = useState<ProductHuntPost | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = data.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase()) ||
      item.tagline.toLowerCase().includes(value.toLowerCase()) ||
      item.topics.some(topic => topic.name.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredData(filtered);
  };

  const handleSort = (field: "votes" | "comments" | "date") => {
    setSortBy(field);
    const sorted = [...filteredData].sort((a, b) => {
      let aValue, bValue;
      
      switch (field) {
        case "votes":
          aValue = a.votes_count;
          bValue = b.votes_count;
          break;
        case "comments":
          aValue = a.comments_count;
          bValue = b.comments_count;
          break;
        case "date":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <Select value={sortBy} onValueChange={(value: "votes" | "comments" | "date") => handleSort(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="votes">Votes</SelectItem>
                <SelectItem value="comments">Comments</SelectItem>
                <SelectItem value="date">Date</SelectItem>
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
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-card-foreground">Total Products</p>
                <p className="text-2xl font-bold text-card-foreground">{filteredData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-card-foreground">Total Votes</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {filteredData.reduce((sum, item) => sum + item.votes_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-card-foreground">Total Comments</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {filteredData.reduce((sum, item) => sum + item.comments_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <div className="grid gap-6 max-h-[600px] overflow-y-auto pr-2">
        {filteredData.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow relative">
            <CardContent className="p-6">
              {/* Info Icon */}
              <button
                onClick={() => {
                  setSelectedProduct(product);
                  setShowDetailsModal(true);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-accent rounded-full transition-colors z-10"
                title="View detailed information"
              >
                <Info className="h-4 w-4 text-muted-foreground" />
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src={product.thumbnail.image_url}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-lg object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-card-foreground mb-2">
                        {product.name}
                      </h3>
                      <p className="text-card-foreground mb-3">
                        {product.tagline}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {product.topics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 bg-blue-900 text-blue-800 text-blue-200 text-xs rounded-full"
                          >
                            {topic.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="flex items-center gap-4 text-sm text-card-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {product.votes_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {product.comments_count}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-card-foreground">
                        <User className="h-4 w-4" />
                        {product.user.name}
                      </div>
                      <div className="text-sm text-card-foreground">
                        {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Details Modal */}
      {showDetailsModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-card-foreground">
                {selectedProduct.name} - Detailed Information
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-card-foreground" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Product Overview */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src={selectedProduct.thumbnail.image_url}
                    alt={selectedProduct.name}
                    width={120}
                    height={120}
                    className="w-30 h-30 rounded-lg object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-lg text-card-foreground mb-4">
                    {selectedProduct.tagline}
                  </p>
                  <p className="text-card-foreground mb-4">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 bg-blue-900/20 p-4 rounded-lg text-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{selectedProduct.votes_count}</div>
                  <div className="text-sm text-card-foreground">Total Votes</div>
                </div>
                <div className="bg-green-50 bg-green-900/20 p-4 rounded-lg text-center">
                  <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{selectedProduct.comments_count}</div>
                  <div className="text-sm text-card-foreground">Comments</div>
                </div>
                <div className="bg-purple-50 bg-purple-900/20 p-4 rounded-lg text-center">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-purple-600">
                    {new Date(selectedProduct.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-card-foreground">Launch Date</div>
                </div>
                <div className="bg-orange-50 bg-orange-900/20 p-4 rounded-lg text-center">
                  <User className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-orange-600">{selectedProduct.user.name}</div>
                  <div className="text-sm text-card-foreground">Maker</div>
                </div>
              </div>

              {/* Topics */}
              <div>
                <h4 className="text-lg font-semibold text-card-foreground mb-3">Categories & Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 bg-blue-900 text-blue-800 text-blue-200 text-sm rounded-full"
                    >
                      {topic.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Engagement Analysis */}
              <div>
                <h4 className="text-lg font-semibold text-card-foreground mb-3">Engagement Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                    <h5 className="font-medium text-card-foreground mb-2">Vote-to-Comment Ratio</h5>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedProduct.comments_count > 0 
                        ? formatNumber(selectedProduct.votes_count / selectedProduct.comments_count)
                        : 'N/A'
                      }
                    </div>
                    <div className="text-sm text-card-foreground">
                      {selectedProduct.comments_count > 0 
                        ? `${selectedProduct.comments_count} comments per ${formatNumber(selectedProduct.votes_count / selectedProduct.comments_count)} votes`
                        : 'No comments yet'
                      }
                    </div>
                  </div>
                  <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                    <h5 className="font-medium text-card-foreground mb-2">Total Engagement</h5>
                    <div className="text-2xl font-bold text-green-600">
                      {selectedProduct.votes_count + selectedProduct.comments_count}
                    </div>
                    <div className="text-sm text-card-foreground">
                      Combined votes and comments
                    </div>
                  </div>
                </div>
              </div>

              {/* Launch Timing */}
              <div>
                <h4 className="text-lg font-semibold text-card-foreground mb-3">Launch Information</h4>
                <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-card-foreground">Launch Date</div>
                      <div className="font-medium text-card-foreground">
                        {new Date(selectedProduct.created_at).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-card-foreground">Launch Time</div>
                      <div className="font-medium text-card-foreground">
                        {new Date(selectedProduct.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZoneName: 'short'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-card-foreground">Days Since Launch</div>
                      <div className="font-medium text-card-foreground">
                        {Math.floor((Date.now() - new Date(selectedProduct.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-card-foreground">Maker Username</div>
                      <div className="font-medium text-card-foreground">
                        @{selectedProduct.user.username}
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
