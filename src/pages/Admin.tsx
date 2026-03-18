import { useState, useEffect } from "react";
import { LogIn, Database, LogOut, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReviewsManager from "@/components/admin/ReviewsManager";
import SitesManager from "@/components/admin/SitesManager";
import { useToast } from "@/components/ui/use-toast";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"reviews" | "sites">("reviews");
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, username, password);
      toast({
        title: "Login Successful",
        description: "Welcome to the JapLan Tours Admin Panel",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUsername("");
      setPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-muted/30 flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground mt-2">Sign in to manage JapLan Tours content</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Email Address</Label>
              <Input 
                id="username" 
                type="email"
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                placeholder="admin@japlantours.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:brightness-110 gap-2">
              <LogIn size={18} /> Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold font-serif">JapLan Tours</span>
            <span className="text-xs font-semibold tracking-wider text-accent uppercase px-2 py-1 bg-accent/10 rounded-full">
              Admin Portal
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
            <Button 
              variant={activeTab === "reviews" ? "secondary" : "ghost"} 
              className={`w-full justify-start gap-3 ${activeTab === "reviews" ? "bg-accent/10 text-accent font-semibold" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              <Database size={18} /> Manage Reviews
            </Button>
            <Button 
              variant={activeTab === "sites" ? "secondary" : "ghost"} 
              className={`w-full justify-start gap-3 ${activeTab === "sites" ? "bg-accent/10 text-accent font-semibold" : ""}`}
              onClick={() => setActiveTab("sites")}
            >
              <Map size={18} /> Heritage Sites
            </Button>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
            {activeTab === "reviews" && <ReviewsManager />}
            {activeTab === "sites" && <SitesManager />}
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default Admin;
