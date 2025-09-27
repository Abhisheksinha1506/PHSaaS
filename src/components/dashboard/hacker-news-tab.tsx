"use client"

import { useState } from "react";
import { HackerNewsPost } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, MessageCircle, ExternalLink, User, Info, X } from "lucide-react";

interface HackerNewsTabProps {
  data: HackerNewsPost[];
}

export function HackerNewsTab({ data }: HackerNewsTabProps) {
  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "time" | "comments">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPost, setSelectedPost] = useState<HackerNewsPost | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = data.filter(item =>
      item.title.toLowerCase().includes(value.toLowerCase()) ||
      item.by.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleSort = (field: "score" | "time" | "comments") => {
    setSortBy(field);
    const sorted = [...filteredData].sort((a, b) => {
      let aValue, bValue;
      
      switch (field) {
        case "score":
          aValue = a.score;
          bValue = b.score;
          break;
        case "time":
          aValue = a.time;
          bValue = b.time;
          break;
        case "comments":
          aValue = a.descendants;
          bValue = b.descendants;
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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
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
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <Select value={sortBy} onValueChange={(value: "score" | "time" | "comments") => handleSort(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="time">Date</SelectItem>
                <SelectItem value="comments">Comments</SelectItem>
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
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Total Posts</p>
                <p className="text-2xl font-bold text-foreground">{filteredData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Total Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredData.reduce((sum, item) => sum + item.score, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Total Comments</p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredData.reduce((sum, item) => sum + item.descendants, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      <div className="grid gap-6 max-h-[600px] overflow-y-auto pr-2">
        {filteredData.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow relative">
            <CardContent className="p-6">
              {/* Info Icon */}
              <button
                onClick={() => {
                  setSelectedPost(post);
                  setShowDetailsModal(true);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors z-10"
                title="View detailed information"
              >
                <Info className="h-4 w-4 text-foreground hover:text-foreground" />
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {post.title}
                      </h3>
                      {post.url && (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-blue-400 hover:underline flex items-center gap-1 mb-3"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {new URL(post.url).hostname}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="flex items-center gap-4 text-sm text-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {post.score}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.descendants}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-foreground">
                        <User className="h-4 w-4" />
                        {post.by}
                      </div>
                      <div className="text-sm text-foreground">
                        {formatTime(post.time)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post Details Modal */}
      {showDetailsModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-700">
              <h2 className="text-2xl font-bold text-foreground">
                Hacker News Post - Detailed Information
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Post Overview */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {selectedPost.title}
                </h3>
                {selectedPost.url && (
                  <div className="mb-4">
                    <a
                      href={selectedPost.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-blue-400 hover:underline flex items-center gap-2 text-lg"
                    >
                      <ExternalLink className="h-5 w-5" />
                      {selectedPost.url}
                    </a>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 bg-orange-900/20 p-4 rounded-lg text-center">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{selectedPost.score}</div>
                  <div className="text-sm text-foreground">Score</div>
                </div>
                <div className="bg-green-50 bg-green-900/20 p-4 rounded-lg text-center">
                  <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{selectedPost.descendants || 0}</div>
                  <div className="text-sm text-foreground">Comments</div>
                </div>
                <div className="bg-purple-50 bg-purple-900/20 p-4 rounded-lg text-center">
                  <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-purple-600">{selectedPost.by}</div>
                  <div className="text-sm text-foreground">Author</div>
                </div>
                <div className="bg-blue-50 bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {new Date(selectedPost.time * 1000).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-foreground">Posted</div>
                </div>
              </div>

              {/* Engagement Analysis */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">Engagement Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                    <h5 className="font-medium text-foreground mb-2">Score-to-Comment Ratio</h5>
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedPost.descendants && selectedPost.descendants > 0 
                        ? (selectedPost.score / selectedPost.descendants).toFixed(1)
                        : 'N/A'
                      }
                    </div>
                    <div className="text-sm text-foreground">
                      {selectedPost.descendants && selectedPost.descendants > 0 
                        ? `${selectedPost.descendants} comments per ${Math.round(selectedPost.score / selectedPost.descendants)} points`
                        : 'No comments yet'
                      }
                    </div>
                  </div>
                  <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                    <h5 className="font-medium text-foreground mb-2">Post Type</h5>
                    <div className="text-2xl font-bold text-blue-600 capitalize">
                      {selectedPost.type}
                    </div>
                    <div className="text-sm text-foreground">
                      {selectedPost.type === 'story' ? 'Regular post' : selectedPost.type}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timing Information */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">Timing Information</h4>
                <div className="bg-gray-50 bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-foreground">Posted Date</div>
                      <div className="font-medium text-foreground">
                        {new Date(selectedPost.time * 1000).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground">Posted Time</div>
                      <div className="font-medium text-foreground">
                        {new Date(selectedPost.time * 1000).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZoneName: 'short'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground">Hours Since Posted</div>
                      <div className="font-medium text-foreground">
                        {Math.floor((Date.now() - selectedPost.time * 1000) / (1000 * 60 * 60))} hours
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground">Unix Timestamp</div>
                      <div className="font-medium text-foreground font-mono text-sm">
                        {selectedPost.time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">Links</h4>
                <div className="space-y-2">
                  <a
                    href={`https://news.ycombinator.com/item?id=${selectedPost.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-orange-50 bg-orange-900/20 rounded-lg hover:bg-orange-100 hover:bg-orange-900/30 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-800 text-orange-200">View on Hacker News</span>
                  </a>
                  {selectedPost.url && (
                    <a
                      href={selectedPost.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-blue-50 bg-blue-900/20 rounded-lg hover:bg-blue-100 hover:bg-blue-900/30 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800 text-blue-200">Visit Original Link</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
