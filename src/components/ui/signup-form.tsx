'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { redirect } from 'next/navigation'
import Link from 'next/link';


export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        console.log('Sending signup request with:', { email, password, name });

        try {
            const { data, error } = await authClient.signUp.email({
                email,
                password,
                name
            });

            console.log('Response data:', data);
            console.log('Response error:', error);

            if (!error) redirect('/')
        } catch (err) {
            console.error('Caught error during signup:', err);
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Sign up</CardTitle>
                    <CardDescription>
                        Complete The Form To Create An Account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="name" >Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value) }}
                                />
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value) }}
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {/* should this be a Link next thing??? */}
                                    <Link
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                                <Input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    id="password"
                                    type="password"
                                    minLength={8}
                                    required />
                                <Input
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    id='confirmPassword'
                                    type="password"
                                    minLength={8}
                                    required
                                />
                                {password !== confirmPassword &&
                                    <p className="text-red-500">Passwords must match</p>}
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button disabled={password !== confirmPassword} type="submit" className="w-full">
                                    Login
                                </Button>
                                <Button variant="outline" className="w-full">
                                    Login with Google
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href="/login" className="underline underline-offset-4">
                                Log in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
