import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Word } from "@/types/schema";import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WordDetail() {
  const { id } = useParams();
  const { data: word, isLoading } = useQuery<Word>({
    queryKey: [`/words/${id}`],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!word) {
    return <div>Word not found</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Word Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>{word.thai}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-medium">Phonetic</div>
            <div className="text-lg">{word.phonetic}</div>
          </div>
          <div>
            <div className="font-medium">English</div>
            <div className="text-lg">{word.english}</div>
          </div>
          <div>
            <div className="font-medium">Difficulty</div>
            <div className="text-lg">{word.difficulty}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
