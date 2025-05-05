import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";





export const SigUpCard = () => {
  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-stone-950">
      <CardHeader className="flex items-center justify-center text-center">
        <CardTitle className="text-2xl">
          Sign Up
        </CardTitle>
        <CardDescription>
          By signing up, you agree to our{" "}
          <Link href="/terms">
            <span className="text-blue-700"> Pirvacy Policy</span>
            {" "} and {" "}
          </Link>
          <Link href="/term">
            <span className="text-blue-700"> Terms of Service </span>
          </Link>
        </CardDescription>
      </CardHeader>



      <div className="px-7 mb-2">
        <DottedSeparator />
      </div>

      <CardContent className="px-7 mb-2 space-y-4" >
        <form className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your name"
            autoComplete="current-password"
          />
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

        <Button type="submit" size="lg" variant="primary" className="w-full "  >
          Log in
        </Button>

      </CardContent>

      <div className="px-7">
        <DottedSeparator />
      </div>


      <CardContent className="p-7 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>



    </Card>
  );
}
