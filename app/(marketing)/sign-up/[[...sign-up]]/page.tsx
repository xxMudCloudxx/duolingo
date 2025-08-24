"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { OrSeparator, Step } from "@/components/sign-items";
import { ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="max-w-[988px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
      <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lg:mb-0">
        <Image src={"/icons/hero.svg"} fill alt="Hero" />
      </div>
      <div className="flex flex-col items-center gap-y-4  lg:ml-9">
        <ClerkLoading>
          <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
          <div className="h-full lg:flex flex-col items-center justify-center px-4 py-4  min-w-[410px] border border-slate-200 rounded-2xl">
            <div className=" w-full">
              <SignUp.Root>
                {/* Start Step: 用户输入信息 */}
                <SignUp.Step name="start">
                  <Step
                    title="Create an account"
                    description="Get started with Lingo for free"
                  >
                    {/* 社交登录 */}
                    <Clerk.Connection name="google" asChild>
                      <Button variant="default" className="w-full">
                        <Image
                          src="/icons/google.svg"
                          width={20}
                          height={20}
                          alt="Google"
                          className="mr-2"
                        />
                        Sign up with Google
                      </Button>
                    </Clerk.Connection>

                    <OrSeparator />

                    {/* 邮箱输入框 */}
                    <Clerk.Field
                      name="emailAddress"
                      className="space-y-1 text-left text-muted-foreground"
                    >
                      <Clerk.Label>Email Address</Clerk.Label>
                      <Clerk.Input
                        type="email"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      />
                      <Clerk.FieldError className="text-sm text-destructive" />
                    </Clerk.Field>

                    {/* 密码输入框 */}
                    <Clerk.Field
                      name="password"
                      className=" text-left text-muted-foreground"
                    >
                      <Clerk.Label>Password</Clerk.Label>
                      <Clerk.Input
                        type="password"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3  text-sm ring-offset-background"
                      />
                      <Clerk.FieldError className="text-sm text-destructive" />
                    </Clerk.Field>
                    {/* --- Captcha 组件 --- */}
                    <div className="flex items-center justify-center">
                      <SignUp.Captcha />
                    </div>
                    <SignUp.Action submit asChild>
                      <Button className="w-full" variant={"primary"}>
                        Create account
                      </Button>
                    </SignUp.Action>

                    <Button
                      variant="primaryOutline"
                      size="sm"
                      className="flex justify-center content-center"
                      asChild
                    >
                      <Link href="/sign-up">
                        Already have an account? Sign in
                      </Link>
                    </Button>
                  </Step>
                </SignUp.Step>

                {/* Verifications Step: 处理邮箱验证码*/}
                <SignUp.Step name="verifications">
                  <SignUp.Strategy name="email_code">
                    <Step
                      title="Verify your email"
                      description="We sent a verification code to your email address. Check your inbox."
                    >
                      <Clerk.Field
                        name="code"
                        className="space-y-2 text-left text-muted-foreground"
                      >
                        <Clerk.Label>Verification Code</Clerk.Label>
                        <Clerk.Input
                          type="text"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        />
                        <Clerk.FieldError className="text-sm text-destructive" />
                      </Clerk.Field>
                      <SignUp.Action submit asChild>
                        <Button className="w-full">Verify</Button>
                      </SignUp.Action>
                    </Step>
                  </SignUp.Strategy>
                </SignUp.Step>
              </SignUp.Root>
            </div>
          </div>
        </ClerkLoaded>
      </div>
    </div>
  );
}
