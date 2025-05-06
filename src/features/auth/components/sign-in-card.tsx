import { DottedSeparator } from "@/components/dotted-separator";
import { FcGoogle } from "react-icons/fc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Required"),
});

export const SigInCard = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    form.reset({ email: values.email, password: "" });
    console.log({ values });
  };

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-stone-950">
      <CardHeader className="flex items-center justify-center text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
      </CardHeader>

      <div className="px-7 mb-2">
        <DottedSeparator />
      </div>

      <CardContent className="px-7 mb-2 space-y-4">
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter email address"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter password"
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full"
            >
              Log in
            </Button>
          </form>
        </Form>
      </CardContent>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7 flex flex-col gap-y-4">
        <Button
          size="lg"
          className="w-full items-center text-base"
          variant="outline"
        >
          <FcGoogle className="size-6 mr-2" />
          Login with Google
        </Button>
      </CardContent>

      <CardContent className="p-7 text-center">
        <p className="text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );

  
};
