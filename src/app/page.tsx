import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Zap, Eye, Clock, Target, Lightbulb, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Free & No Signup Required
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Intelligence for Tech Leaders
          </h1>
          <p className="text-xl md:text-2xl text-foreground mb-8 max-w-3xl mx-auto">
            Targeted dashboards for VCs tracking investments, indie hackers researching markets, 
            and developers finding their next project. Get insights, not just data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-3">
                <Eye className="mr-2 h-5 w-5" />
                See the Dashboard
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* What This Does - Simple Explanation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Three Targeted Intelligence Dashboards
          </h2>
          <p className="text-lg text-foreground max-w-3xl mx-auto">
            Each dashboard is built for a specific user with specific needs. Get actionable insights, not just aggregated data.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card p-6 rounded-lg shadow-lg border text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">
              VC Intelligence
            </h3>
            <p className="text-card-foreground mb-4">
              Investment signals, cross-platform correlations, and market opportunities. 
              Spot the next unicorn before your competitors.
            </p>
            <div className="text-sm text-muted-foreground">
              For: VCs, Investors, Fund Managers
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-lg border text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">
              Indie Hacker Research
            </h3>
            <p className="text-card-foreground mb-4">
              Market gaps, competitor analysis, and launch timing intelligence. 
              Find your next business opportunity.
            </p>
            <div className="text-sm text-muted-foreground">
              For: Solo Founders, Entrepreneurs, Builders
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-lg border text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-3">
              Developer Inspiration
            </h3>
            <p className="text-card-foreground mb-4">
              Trending problems to solve, project ideas, and skills to learn. 
              Find your next side project or career move.
            </p>
            <div className="text-sm text-muted-foreground">
              For: Developers, Engineers, Students
            </div>
          </div>
        </div>
      </div>

      {/* Who This Is For */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for Specific Jobs-to-be-Done
          </h2>
          <p className="text-lg text-foreground max-w-3xl mx-auto">
            Each dashboard solves a specific problem for a specific user. No generic solutions, no wasted features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg border text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">VCs & Investors</h3>
            <p className="text-sm text-card-foreground mb-3">
              Job: "Spot the next unicorn before competitors"
            </p>
            <p className="text-sm text-muted-foreground">
              Get investment signals, cross-platform correlations, and market intelligence
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Indie Hackers</h3>
            <p className="text-sm text-card-foreground mb-3">
              Job: "Find my next business opportunity"
            </p>
            <p className="text-sm text-muted-foreground">
              Discover market gaps, analyze competitors, and optimize launch timing
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Developers</h3>
            <p className="text-sm text-card-foreground mb-3">
              Job: "Find my next project or career move"
            </p>
            <p className="text-sm text-muted-foreground">
              Solve trending problems, get project ideas, and learn in-demand skills
            </p>
          </div>
        </div>
      </div>

      {/* Why Use This */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 border">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
              Why Use This Instead of Checking Each Site?
            </h2>
            <p className="text-lg text-card-foreground max-w-2xl mx-auto">
              Save time and get a complete picture of what&apos;s happening in tech.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">The Old Way</h3>
                  <p className="text-card-foreground">
                    Visit Product Hunt, then Hacker News, then GitHub... 
                    Takes 30+ minutes every day to check everything.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Miss Important Stuff</h3>
                  <p className="text-card-foreground">
                    Easy to miss trending topics or new launches when checking multiple sites.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">No Comparison</h3>
                  <p className="text-card-foreground">
                    Hard to see patterns or connections between different platforms.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">The New Way</h3>
                  <p className="text-card-foreground">
                    One dashboard shows everything. Takes 2 minutes to see all the important stuff.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Never Miss Anything</h3>
                  <p className="text-card-foreground">
                    See trending topics across all platforms in one place. Get the full picture.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Smart Insights</h3>
                  <p className="text-card-foreground">
                    See connections between platforms. Understand what&apos;s really trending.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Targeted Intelligence?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Choose your dashboard and get insights that matter to your specific role. 
            No signup required. No payment needed.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100">
              <Eye className="mr-2 h-5 w-5" />
              See the Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}