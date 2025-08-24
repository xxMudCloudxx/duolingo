"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { OrSeparator, Step } from "@/components/sign-items";
import { ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <>
      <div className="max-w-[988px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
        <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lg:mb-0">
          <Image src={"/icons/hero.svg"} fill alt="Hero" />
        </div>
        <div className=" flex flex-col items-center gap-y-8  lg:ml-9">
          <h1 className="text-xl lg:text-3xl font-bold text-neutral-600 max-w-[480px] text-center lg:block hidden">
            Learn, practice, and master new languages with Duolingo
          </h1>
          <ClerkLoading>
            <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
          </ClerkLoading>
          <ClerkLoaded>
            <div className="h-full lg:flex flex-col items-center justify-center px-4 py-4 min-w-[410px] border border-slate-200 rounded-2xl">
              <div className=" w-full">
                <SignIn.Root>
                  {/* Start Step: 用户输入邮箱或选择社交登录 */}
                  <SignIn.Step name="start">
                    <Step
                      title="Welcome Back!"
                      description="Sign in to continue to Lingo"
                    >
                      {/* 社交登录按钮 */}
                      <Clerk.Connection name="google" asChild>
                        <Button variant="default" className="w-full">
                          <Image
                            src="/icons/google.svg"
                            width={20}
                            height={20}
                            alt="Google"
                            className="mr-2"
                          />
                          Sign in with Google
                        </Button>
                      </Clerk.Connection>

                      <OrSeparator />

                      {/* 邮箱/用户名输入框 */}
                      <Clerk.Field
                        name="identifier"
                        className="space-y-2 text-left"
                      >
                        <Clerk.Label className="text-sm font-medium text-muted-foreground">
                          Email Address
                        </Clerk.Label>
                        <Clerk.Input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        />
                        <Clerk.FieldError className="text-sm text-destructive" />
                      </Clerk.Field>

                      {/* 继续按钮 */}
                      <SignIn.Action submit asChild>
                        <Button className="w-full" variant={"primary"}>
                          Continue
                        </Button>
                      </SignIn.Action>
                    </Step>
                    <Button
                      variant="primaryOutline"
                      size="sm"
                      className="flex justify-center content-center"
                      asChild
                    >
                      <Link href="/sign-up">
                        Don&apos;t have an account? Sign up
                      </Link>
                    </Button>
                  </SignIn.Step>

                  <SignIn.Step name="verifications">
                    <SignIn.Strategy name="email_code">
                      <Step
                        title="Check your email"
                        description={
                          <>
                            We sent a verification code to{" "}
                            <SignIn.SafeIdentifier />
                          </>
                        }
                      >
                        <Clerk.Field
                          name="code"
                          className="space-y-2 text-left"
                        >
                          <Clerk.Label>Verification Code</Clerk.Label>
                          <Clerk.Input
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                          <Clerk.FieldError className="text-sm text-destructive" />
                        </Clerk.Field>
                        <SignIn.Action submit asChild>
                          <Button className="w-full" variant="primary">
                            Verify
                          </Button>
                        </SignIn.Action>
                      </Step>
                    </SignIn.Strategy>
                    {/* --- 密码验证策略 --- */}
                    <SignIn.Strategy name="password">
                      <Step
                        title="Enter your password"
                        description={
                          <>
                            Welcome back, <SignIn.SafeIdentifier />
                          </>
                        }
                      >
                        <Clerk.Field
                          name="password"
                          className="space-y-2 text-left text-muted-foreground"
                        >
                          <Clerk.Label>Password</Clerk.Label>
                          <Clerk.Input
                            type="password"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          />
                          <Clerk.FieldError className="text-sm text-destructive" />
                        </Clerk.Field>
                        <SignIn.Action submit asChild>
                          <Button className="w-full" variant={"primary"}>
                            Sign In
                          </Button>
                        </SignIn.Action>
                        <SignIn.Action navigate="start" asChild>
                          <Button className="w-full">Go Back</Button>
                        </SignIn.Action>
                        <SignIn.Action navigate="forgot-password" asChild>
                          <Button
                            variant="primaryOutline"
                            size="sm"
                            className="mx-auto"
                          >
                            Forgot password?
                          </Button>
                        </SignIn.Action>
                      </Step>
                    </SignIn.Strategy>
                    <SignIn.Strategy name="reset_password_email_code">
                      <Step
                        title="Reset your password"
                        description={
                          <>
                            We sent a code to
                            <SignIn.SafeIdentifier />
                          </>
                        }
                      >
                        <Clerk.Field
                          name="code"
                          className="space-y-2 text-left"
                        >
                          <Clerk.Label>Email Code</Clerk.Label>
                          <Clerk.Input
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                          <Clerk.FieldError className="text-sm text-destructive" />
                        </Clerk.Field>

                        <SignIn.Action submit asChild>
                          <Button className="w-full" variant="primary">
                            Reset Password
                          </Button>
                        </SignIn.Action>
                      </Step>
                    </SignIn.Strategy>
                  </SignIn.Step>

                  <SignIn.Step name="forgot-password">
                    <Step
                      title="Reset your password"
                      description="Click the button below to receive a password reset code."
                    >
                      {/* 使用 SupportedStrategy 触发重置流程, 它会像一个按钮 */}
                      <SignIn.SupportedStrategy
                        name="reset_password_email_code"
                        asChild
                      >
                        <Button className="w-full" variant="primary">
                          Send Reset Code
                        </Button>
                      </SignIn.SupportedStrategy>
                      <SignIn.Action navigate="previous" asChild>
                        <Button variant="ghost">Go back to sign in</Button>
                      </SignIn.Action>
                    </Step>
                  </SignIn.Step>

                  <SignIn.Step name="reset-password">
                    <Step
                      title="Set a new password"
                      description="Enter your new password below to reset your password."
                    >
                      <Clerk.Field
                        name="password"
                        className="space-y-2 text-left"
                      >
                        <Clerk.Label>New Password</Clerk.Label>
                        <Clerk.Input
                          type="password"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                        <Clerk.FieldError className="text-sm text-destructive" />
                      </Clerk.Field>
                      <Clerk.Field
                        name="confirmPassword"
                        className="space-y-2 text-left"
                      >
                        <Clerk.Label>Confirm New Password</Clerk.Label>
                        <Clerk.Input
                          type="password"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                        <Clerk.FieldError className="text-sm text-destructive" />
                      </Clerk.Field>
                      <SignIn.Action submit asChild>
                        <Button className="w-full" variant="primary">
                          Reset Password
                        </Button>
                      </SignIn.Action>
                    </Step>
                  </SignIn.Step>
                </SignIn.Root>
              </div>
            </div>
          </ClerkLoaded>
        </div>
      </div>
    </>
  );
}
