import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { StudyActivity } from "@/types/schema";import { Link } from "wouter";

export default function StudyActivities() {
  const { data, isLoading } = useQuery<{ activities: StudyActivity[] }>({
    queryKey: ["/study-activities"],
  });
  
  const activities = data?.activities ?? []; 

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Study Activities</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(activities) && activities.length > 0 ? (
        activities.map((activity) => (
          <Link key={activity.id} href={`/study-activities/${activity.id}`}>
            <a className="block">
              <Card className="hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle>{activity.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <div className="mt-2 text-sm font-medium">
                    Type: {activity.type ?? "Unknown Type"}
                  </div>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))
      ) : (
        <p>No activities found.</p>
      )}

      </div>
    </div>
  );
}
