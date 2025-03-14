// app/login/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

interface LoginResponse {
  id_user: string;
  username: string;
  email: string;
  status_user: string;
  customer_code: string;
  level_user: string;
  token: string;
  message: string;
}

// Create a separate component to handle useSearchParams
function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/home';

  useEffect(() => {
    // Set isClient to true to safely execute client-only code
    setIsClient(true);

    // Check if token exists in cookie or sessionStorage
    const tokenInCookie = Cookies.get('token');
    const tokenInSession = sessionStorage.getItem('token');

    if (tokenInCookie || tokenInSession) {
      // Token exists, redirect to home
      router.push('/home');
    }
  }, [router]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("https://portal4.incoe.astra.co.id:4433/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      
      const data = await response.json();
      setLoginResponse(data);
      setLoading(false);

      if (data.message === "Login success" && isClient) {
        // Store data in sessionStorage
        sessionStorage.setItem("id_user", data.id_user);
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("email", data.email);
        sessionStorage.setItem("status_user", data.status_user);
        sessionStorage.setItem("customer_code", data.customer_code);
        sessionStorage.setItem("level_user", data.level_user);
        sessionStorage.setItem("token", data.token);

        // Set token in cookies (persists across browser sessions)
        // Set to expire in 7 days
        Cookies.set('token', data.token, { expires: 7, path: '/' });
        
        // Also set user ID in cookie for middleware access
        Cookies.set('user_id', data.id_user, { expires: 7, path: '/' });

        console.log("Token stored:", data.token);

        // Redirect to home page or the return URL
        router.push(returnUrl);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (!isClient) {
    // Render an empty shell on server
    return <div>Loading...</div>;
  }

  return (
    <div>
      <form onSubmit={handleLogin}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="username..."
              required
              value={username}
              onChange={(event) => setUsername(event.currentTarget.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </Button>
        </div>
      </form>
      {loginResponse?.message && (
        <div className="mt-4 text-sm text-center text-muted-foreground">
          {loginResponse.message}
        </div>
      )}
    </div>
  );
}

// Main component with Suspense boundary
function FormLogin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

export default FormLogin;