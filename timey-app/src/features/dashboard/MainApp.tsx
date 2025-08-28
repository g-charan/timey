import { Timer } from "@/components/timer/Timer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function MainApp() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-bold">Timey</h1>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Focus Session</CardTitle>
          </CardHeader>
          <CardContent>
            <Timer />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default MainApp;
