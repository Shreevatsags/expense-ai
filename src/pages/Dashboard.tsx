import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Upload, 
  PieChart, 
  Wallet, 
  Sparkles,
  LogOut,
  User,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { StatsOverview } from "@/components/StatsOverview";
import { CSVUpload } from "@/components/CSVUpload";
import { CategoryChart } from "@/components/CategoryChart";
import { SpendingTrends } from "@/components/SpendingTrends";
import { TransactionList } from "@/components/TransactionList";
import { BudgetManager } from "@/components/BudgetManager";
import { AIInsights } from "@/components/AIInsights";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-sidebar p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="p-2 rounded-lg bg-primary/20">
          <Wallet className="h-6 w-6 text-primary" />
        </div>
        <span className="text-xl font-bold">ExpenseAI</span>
      </div>
      
      {/* Nav items */}
      <nav className="space-y-1 flex-1">
        <div className="px-2 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground flex items-center gap-3">
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </div>
      </nav>
      
      {/* User section */}
      <div className="border-t border-sidebar-border pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="p-2 rounded-full bg-secondary">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar />
                </SheetContent>
              </Sheet>
              <span className="font-semibold">ExpenseAI</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Track your expenses and get AI-powered insights
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <StatsOverview />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              <CSVUpload />
              <SpendingTrends />
              <TransactionList />
            </div>

            {/* Right Column - Widgets */}
            <div className="space-y-6">
              <BudgetManager />
              <AIInsights />
              <CategoryChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
