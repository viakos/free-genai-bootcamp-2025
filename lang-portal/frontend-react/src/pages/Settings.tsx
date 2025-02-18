import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    dailyGoal: "10",
    difficulty: "normal",
    showPhonetic: true,
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Study Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Word Goal</Label>
              <div className="text-sm text-muted-foreground">
                Number of words to learn each day
              </div>
            </div>
            <Select
              value={settings.dailyGoal}
              onValueChange={(value) =>
                setSettings({ ...settings, dailyGoal: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 words</SelectItem>
                <SelectItem value="10">10 words</SelectItem>
                <SelectItem value="15">15 words</SelectItem>
                <SelectItem value="20">20 words</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Difficulty Level</Label>
              <div className="text-sm text-muted-foreground">
                Adjust the challenge level of exercises
              </div>
            </div>
            <Select
              value={settings.difficulty}
              onValueChange={(value) =>
                setSettings({ ...settings, difficulty: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Phonetic Spelling</Label>
              <div className="text-sm text-muted-foreground">
                Display pronunciation guide for Thai words
              </div>
            </div>
            <Switch
              checked={settings.showPhonetic}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showPhonetic: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Study Reminders</Label>
              <div className="text-sm text-muted-foreground">
                Receive notifications for daily practice
              </div>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: checked })
              }
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
