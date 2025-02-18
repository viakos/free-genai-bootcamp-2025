import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { type Word, insertWordSchema } from "@/types/schema";import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Words() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertWordSchema),
    defaultValues: {
      thai: "",
      phonetic: "",
      english: "",
    },
  });

  // const { data: words, isLoading } = useQuery<Word[]>({
  //   queryKey: ["/words"],
  // });

  const { data, isLoading } = useQuery<{ words: Word[] }>({
    queryKey: ["/words"],
  });

  const words = data?.words ?? [];

  const createWord = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const res = await apiRequest("POST", "/words", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/words"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Word created successfully",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Words</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Word</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Word</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createWord.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="thai"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thai</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phonetic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phonetic</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="english"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>English</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">Create</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thai</TableHead>
            <TableHead>Phonetic</TableHead>
            <TableHead>English</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {words.length > 0 ? (
          words.map((word) => (
            <TableRow key={word.id}>
              <TableCell>{word.thai}</TableCell>
              <TableCell>{word.romanized}</TableCell>
              <TableCell>{word.english}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              No words found.
            </TableCell>
          </TableRow>
        )}
        </TableBody>
      </Table>
    </div>
  );
}
