import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import type { StudyActivity, Word, InsertStudySession } from "@/types/schema";import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function StudyActivityDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isStudyComplete, setIsStudyComplete] = useState(false);

  const { data: activity, isLoading: activityLoading } = useQuery<StudyActivity>({
    queryKey: [`/study-activities/${id}`],
  });

  const { data: words } = useQuery<Word[]>({
    queryKey: ["/words"],
  });

  if (activityLoading || !words) {
    return <div>Loading...</div>;
  }

  if (!activity) {
    return <div>Activity not found</div>;
  }

  const handleAnswer = async (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // Study session complete
      const finalScore = Math.round(((score + (isCorrect ? 1 : 0)) / words.length) * 100);
      
      const session: InsertStudySession = {
        activityId: parseInt(id),
        startTime: new Date(),
        endTime: new Date(),
        score: finalScore,
      };

      try {
        await apiRequest("POST", "/study-sessions", session);
        setIsStudyComplete(true);
        toast({
          title: "Study Session Complete",
          description: `Your score: ${finalScore}%`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save study session",
          variant: "destructive",
        });
      }
    }
  };

  const currentWord = words[currentWordIndex];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{activity.name}</h1>
      <p className="text-muted-foreground">{activity.description}</p>

      {!isStudyComplete ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Word {currentWordIndex + 1} of {words.length}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {activity.type === "flashcards" ? (
              <>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-4">{currentWord.thai}</div>
                  <div className="text-xl text-muted-foreground">{currentWord.phonetic}</div>
                </div>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => handleAnswer(false)}>Show Answer</Button>
                  <Button onClick={() => handleAnswer(true)} variant="default">
                    I Know This
                  </Button>
                </div>
              </>
            ) : (
              // Quiz type
              <>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-4">{currentWord.thai}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[...words]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 4)
                    .map((word) => (
                      <Button
                        key={word.id}
                        onClick={() => handleAnswer(word.id === currentWord.id)}
                        variant="outline"
                        className="h-auto py-4"
                      >
                        {word.english}
                      </Button>
                    ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle>Study Session Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-4">Your Score: {score}/{words.length}</p>
            <Button onClick={() => window.location.reload()}>Start Again</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
