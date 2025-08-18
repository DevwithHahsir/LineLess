export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Primary gradient background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" 
           style={{ animationDelay: '0s' }} />
      <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-float" 
           style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-float" 
           style={{ animationDelay: '4s' }} />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
    </div>
  );
}