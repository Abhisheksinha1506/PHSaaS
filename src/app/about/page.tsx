import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Zap, Globe, Shield, RefreshCw, Eye, Clock, Target, CheckCircle, ArrowRight, Lightbulb, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            How This Dashboard Works
          </h1>
          <p className="text-xl text-foreground max-w-3xl mx-auto">
            Think of this as your personal tech news aggregator. 
            Instead of visiting 3 different websites every day, you get everything in one place.
          </p>
        </div>

        {/* Simple Explanation */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 md:p-12 border">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                The Problem This Solves
              </h2>
              <p className="text-lg text-foreground max-w-3xl mx-auto">
                Most people who work in tech check multiple websites daily to stay updated. 
                This dashboard does that work for you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground mb-4">What People Usually Do:</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">1</span>
                    </div>
                    <span className="text-foreground">Visit Product Hunt to see new product launches</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">2</span>
                    </div>
                    <span className="text-foreground">Check Hacker News for tech discussions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">3</span>
                    </div>
                    <span className="text-foreground">Browse GitHub to see trending tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">4</span>
                    </div>
                    <span className="text-foreground">Try to remember what was trending where</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground mb-4">What This Dashboard Does:</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-foreground">Automatically collects data from all 3 sites</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-foreground">Shows everything in one organized view</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-foreground">Updates every 5 minutes automatically</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-foreground">Helps you see patterns across platforms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What You Get */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            What You Get in the Dashboard
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Product Launches</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground mb-4">
                  See what new apps and tools are being launched, how many votes they're getting, 
                  and what people are saying about them.
                </p>
                <div className="text-sm text-muted-foreground">
                  <div>• New AI tools getting 500+ votes</div>
                  <div>• Popular productivity apps</div>
                  <div>• Trending developer tools</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Tech Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground mb-4">
                  Find the most interesting tech stories and discussions that developers are talking about.
                </p>
                <div className="text-sm text-muted-foreground">
                  <div>• New programming languages</div>
                  <div>• Tech company news</div>
                  <div>• Developer tool reviews</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Popular Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground mb-4">
                  Discover what software tools are popular and what alternatives exist for common tools.
                </p>
                <div className="text-sm text-muted-foreground">
                  <div>• Trending GitHub repositories</div>
                  <div>• Popular development tools</div>
                  <div>• Alternative software options</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works - Simple Steps */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            How It Works (3 Simple Steps)
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                1. We Collect Data
              </h3>
              <p className="text-card-foreground text-lg">
                Every 5 minutes, we automatically check Product Hunt, Hacker News, and GitHub 
                to get the latest trending content.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                2. We Organize It
              </h3>
              <p className="text-card-foreground text-lg">
                We sort everything by popularity, engagement, and trends so you can easily 
                see what's most important.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Eye className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                3. You See Everything
              </h3>
              <p className="text-card-foreground text-lg">
                Open the dashboard and see all the trending content from all platforms 
                in one organized, easy-to-understand view.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-blue-600" />
                  Always Up-to-Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground">
                  Data refreshes automatically every 5 minutes. You never have to worry about 
                  missing the latest trends or updates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Search className="h-6 w-6 text-green-600" />
                  Easy to Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground">
                  Search across all platforms at once. Find specific topics, products, or discussions 
                  without visiting multiple websites.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Filter className="h-6 w-6 text-purple-600" />
                  Smart Filtering
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground">
                  Filter by time period (last 24 hours, week, or month), popularity, or specific topics 
                  to find exactly what you're looking for.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-orange-600" />
                  Completely Free
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground">
                  No registration, no payment, no hidden costs. This dashboard is completely free 
                  and accessible to everyone.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-red-600" />
                  Privacy Protected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground">
                  We don't collect any personal information. No accounts, no tracking, 
                  just pure data aggregation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-indigo-600" />
                  Smart Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground">
                  See connections between platforms. Understand what's really trending 
                  across the entire tech ecosystem.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Who Should Use This */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Who Should Use This Dashboard?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle>Entrepreneurs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground text-sm">
                  Find business opportunities and see what products are getting attention. 
                  Discover market gaps and trending ideas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Developers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground text-sm">
                  Stay updated on new technologies, tools, and programming languages. 
                  See what's popular in the developer community.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Marketers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground text-sm">
                  Understand what's popular and what people are talking about. 
                  Find trending topics for content and campaigns.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground text-sm">
                  Learn about current tech trends and what skills are in demand. 
                  Stay informed about the tech industry.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold mb-4">
                Ready to See What's Trending?
              </h3>
              <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
                No signup required. No payment needed. Just click and explore what's happening in tech right now.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100">
                    <Eye className="mr-2 h-5 w-5" />
                    See the Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
