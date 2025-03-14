// // actions.ts
// "use server"

// import { schemaSignIn } from "@/lib/schema";
// import { redirect } from "next/navigation" 

// type ActionResult = {
//   error: string
// }

// export async function SignIn(
//   _: unknown,
//   formData: FormData
// ): Promise<ActionResult> {
//   const validate = schemaSignIn.safeParse({
//     email: formData.get('email'),
//     password: formData.get('password')
//   })

//   if (!validate.success) {
//     return {
//       error: validate.error.errors[0].message
//     }
//   }

//   try {
//     const authRequest = await fetch('http://portal4.incoe.astra.co.id:8092/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         username: validate.data.email, // Assuming API uses "username"
//         password: validate.data.password
//       })
//     });

//     const authResponse = await authRequest.json();

//     // Assuming successful login response contains a "token" field
//     if (authResponse.token) {
//       // Store the token in a cookie, local storage, or session storage
//       // ...

//       // Redirect to the dashboard or protected page
//       return redirect('/dashboard');
//     } else {
//       // Handle login error (e.g., invalid credentials)
//       return { error: authResponse.message || 'Login failed' };
//     }
//   } catch (e: unknown) {
//     console.error(e);
//     return { error: 'An unexpected error occurred.' };
//   }
// }