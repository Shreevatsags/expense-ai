import { Link } from "react-router-dom";
import { 
  Wallet, 
  Upload, 
  PieChart, 
  Sparkles, 
  Shield, 
  TrendingUp,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user } = useAuth();

  const features = [
    {
      icon: Upload,
      title: "Easy CSV Import",
      description: "Upload bank statements and automatically parse transactions with smart categorization.",
    },
    {
      icon: PieChart,
      title: "Visual Analytics",
      description: "Beautiful charts showing spending patterns, category breakdowns, and trends.",
    },
    {
      icon: Sparkles,
      title: "AI Insights",
      description: "Get personalized spending insights, warnings, and saving tips powered by AI.",
    },
    {
      icon: Shield,
      title: "Budget Alerts",
      description: "Set monthly budgets and receive alerts at 70%, 90%, and 100% usage.",
    },
  ];

  const benefits = [
    "Automatic expense categorization",
    "Real-time spending tracking",
    "Monthly AI-generated reports",
    "Secure data storage",
    "Mobile-friendly design",
    "Export capabilities",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold">ExpenseAI</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6 fade-in">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Expense Tracking</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 slide-up">
            Take Control of Your{" "}
            <span className="text-gradient-primary">Finances</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto fade-in">
            Upload your bank statements, get automatic categorization, and receive 
            AI-powered insights to make smarter financial decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in">
            <Button size="lg" asChild className="gap-2 glow-primary">
              <Link to="/auth">
                Start Free Today
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">View Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to Track Expenses
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete solution for personal finance management with smart features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="stat-card p-6 fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Smart Features for{" "}
                <span className="text-gradient-accent">Smart Spending</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Our AI-powered platform analyzes your spending patterns and provides 
                actionable insights to help you save more and spend wisely.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="stat-card p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Savings</p>
                    <p className="text-2xl font-bold text-primary">23%</p>
                  </div>
                </div>
                
                <div className="h-4 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Users who follow our AI recommendations save an average of 23% more 
                  on their monthly expenses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already tracking their expenses smarter 
            with AI-powered insights.
          </p>
          <Button size="lg" asChild className="gap-2 glow-primary">
            <Link to="/auth">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="font-semibold">ExpenseAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 ExpenseAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
