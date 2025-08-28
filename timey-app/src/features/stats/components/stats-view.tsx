import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Target,
  Award,
  Clock,
  PieChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Custom tooltip component for better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-foreground font-medium">{label}</p>
        <p className="text-primary">{payload[0].value} hours</p>
        {payload[1] && (
          <p className="text-muted-foreground text-sm">
            Efficiency: {payload[1].value}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Custom legend component
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const StatsView = () => {
  // Enhanced mock data with efficiency and categories
  const weeklyData = [
    {
      day: "Mon",
      hours: 4.5,
      efficiency: 88,
      goal: 6,
      category: "Development",
    },
    {
      day: "Tue",
      hours: 6.2,
      efficiency: 92,
      goal: 6,
      category: "Design",
    },
    {
      day: "Wed",
      hours: 5.8,
      efficiency: 85,
      goal: 6,
      category: "Research",
    },
    {
      day: "Thu",
      hours: 7.1,
      efficiency: 95,
      goal: 6,
      category: "Development",
    },
    {
      day: "Fri",
      hours: 8.3,
      efficiency: 91,
      goal: 6,
      category: "Meetings",
    },
    {
      day: "Sat",
      hours: 3.2,
      efficiency: 78,
      goal: 4,
      category: "Learning",
    },
    {
      day: "Sun",
      hours: 2.1,
      efficiency: 82,
      goal: 4,
      category: "Planning",
    },
  ];

  const categoryData = [
    { name: "Development", value: 12.5, color: "hsl(var(--primary))" },
    { name: "Design", value: 8.2, color: "hsl(var(--chart-2))" },
    { name: "Research", value: 6.8, color: "hsl(var(--chart-3))" },
    { name: "Meetings", value: 4.5, color: "hsl(var(--chart-4))" },
    { name: "Learning", value: 3.2, color: "hsl(var(--chart-5))" },
  ];

  const totalHours = weeklyData.reduce((sum, day) => sum + day.hours, 0);
  const averageEfficiency =
    weeklyData.reduce((sum, day) => sum + day.efficiency, 0) /
    weeklyData.length;
  const goalCompletion =
    (totalHours / weeklyData.reduce((sum, day) => sum + day.goal, 0)) * 100;

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Statistics</h2>
          <p className="text-muted-foreground mt-1">
            Weekly performance insights and trends
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Week of{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">
                Total Hours
              </CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-foreground">
                {totalHours.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground pb-1">hours</span>
            </div>
            <Progress value={goalCompletion} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {goalCompletion.toFixed(1)}% of weekly goal
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">
                Avg. Efficiency
              </CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-foreground">
                {averageEfficiency.toFixed(0)}%
              </span>
              <TrendingUp className="w-4 h-4 text-green-500 mb-1" />
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${averageEfficiency}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Focus quality score
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">
                Top Category
              </CardTitle>
              <Award className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-lg font-bold text-foreground">
                Development
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {categoryData[0].value} hours this week
            </p>
            <Badge variant="secondary" className="mt-2">
              #1 Focus Area
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Focus Hours with Goal Line */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Weekly Focus Hours
            </CardTitle>
            <CardDescription>
              Daily focus time compared to daily goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={weeklyData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="hours"
                  fill="hsl(var(--primary))"
                  radius={[2, 2, 0, 0]}
                  name="Actual Hours"
                />
                <Bar
                  dataKey="goal"
                  fill="hsl(var(--muted))"
                  radius={[2, 2, 0, 0]}
                  name="Daily Goal"
                  opacity={0.3}
                />
              </BarChart>
            </ResponsiveContainer>
            <CustomLegend
              payload={[
                { value: "Actual Hours", color: "hsl(var(--primary))" },
                { value: "Daily Goal", color: "hsl(var(--muted))" },
              ]}
            />
          </CardContent>
        </Card>

        {/* Focus Trend with Efficiency */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Focus Trend & Efficiency
            </CardTitle>
            <CardDescription>
              Weekly progression and focus quality metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={weeklyData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="hours"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  name="Focus Hours"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="efficiency"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(var(--chart-2))" }}
                  name="Efficiency %"
                />
              </LineChart>
            </ResponsiveContainer>
            <CustomLegend
              payload={[
                { value: "Focus Hours", color: "hsl(var(--primary))" },
                { value: "Efficiency %", color: "hsl(var(--chart-2))" },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Focus by Category</CardTitle>
          <CardDescription>
            Distribution of focus time across different activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={80}
                />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              {categoryData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground">
                      {item.value}h
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {((item.value / totalHours) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
