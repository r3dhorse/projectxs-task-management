import { DottedSeparator } from "@/components/dotted-separator";
import { FcGoogle } from "react-icons/fc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";





export const SigInCard = () => {
  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-stone-950">
      <CardHeader className="flex items-center justify-center text-center">
        <CardTitle className="text-2xl">
          Welcome back
        </CardTitle>
      </CardHeader>

      <div className="px-7 mb-2">
        <DottedSeparator />
      </div>

      <CardContent className="px-7 mb-2">
        <form className="space-y-4">
          <Input
            type="email"
            placeholder="Enter email address"
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Enter password"
            autoComplete="current-password"
          />
        </form>

        <Button type="submit" size="lg" variant="primary" className="w-full">
          Log in
        </Button>
        
      </CardContent>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7 flex flex-col gap-y-4">
        <Button size="lg" className="w-full items-center text-base" variant="outline">
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
}
