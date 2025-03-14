"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import FormLogin from "./form";

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
}

export function Login() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const canvas = document.getElementById("particleCanvas") as HTMLCanvasElement | null;
    if (!canvas) return; // Safety check for canvas existence
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Safety check for canvas context

    const particles: Particle[] = [];
    const particleCount = 100;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 5 + 1,
        color: 'rgba(255, 255, 255, 0.8)',
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
      });
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce off the walls
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      requestAnimationFrame(animateParticles);
    };

    animateParticles();

    // Resize canvas on window resize
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // Initial resize

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 relative overflow-hidden">
      <canvas id="particleCanvas" className="absolute top-0 left-0 w-full h-full z-0" />
      <div className="flex items-center justify-center h-full py-12 z-10 relative bg-gray-100"> 
              <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                  <h1 className="text-3xl font-bold">Login</h1>
                  <p className="text-balance text-muted-foreground">
                    Enter your Username below to login to your account
                  </p>
                </div>
                <FormLogin />
              </div>
            </div>
      
      {isClient && (
        <div className="hidden h-full lg:block">
          <Image
            src="/assets/img/lihtium-incoe.png" // Update the path as necessary
            alt="Image"
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      )}
    </div>
  );
}

export default Login;
