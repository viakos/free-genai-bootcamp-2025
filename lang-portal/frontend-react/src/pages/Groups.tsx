import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { type Group } from "@/types/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Groups() {

  const { data, isLoading } = useQuery<{ groups: Group[] }>({
    queryKey: ["/groups"],
  });
  
  const groups = data?.groups ?? []; // Extract groups array safely

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Word Groups</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.length > 0 ? (
          groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <a className="block">
                <Card className="hover:bg-accent transition-colors">
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No groups found.</p>
        )}

      </div>
    </div>
  );
}
