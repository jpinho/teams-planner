export function Background() {
  return (
    <div className="fixed inset-0 -z-1 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-white" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <div 
        className="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.075) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.075) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute left-[10%] top-[10%] -z-10 h-96 w-96 opacity-70">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-indigo-50 blur-xl" />
      </div>
      <div className="absolute right-[15%] top-[20%] -z-10 h-64 w-64 opacity-70">
        <div className="absolute inset-0 bg-gradient-to-l from-indigo-100 to-indigo-50 blur-xl" />
      </div>
    </div>
  );
} 