"use client";

import { cn } from "@/lib/utils";
import { Loader, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
  className?: string;
  text?: string;
}

export const LoadingIndicator = ({
  size = "md",
  variant = "spinner",
  className,
  text,
}: LoadingIndicatorProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  if (variant === "spinner") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <Loader2 className={cn("animate-spin", sizeClasses[size])} />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-1", className)}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        </div>
        {text && (
          <span className="ml-2 text-sm text-muted-foreground">{text}</span>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <div
          className={cn(
            "bg-blue-500 rounded-full animate-pulse",
            sizeClasses[size]
          )}
        ></div>
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  return null;
};

interface ProgressIndicatorProps {
  progress: number;
  text?: string;
  className?: string;
  showPercentage?: boolean;
}

export const ProgressIndicator = ({
  progress,
  text,
  className,
  showPercentage = true,
}: ProgressIndicatorProps) => {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {(text || showPercentage) && (
        <div className="flex justify-between items-center">
          {text && (
            <span className="text-sm text-muted-foreground">{text}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <Progress value={progress} className="h-2" />
    </div>
  );
};

interface QuizLoadingProps {
  stage: "loading" | "processing" | "complete";
  progress?: number;
}

export const QuizLoading = ({ stage, progress = 0 }: QuizLoadingProps) => {
  const getStageText = () => {
    switch (stage) {
      case "loading":
        return "加载题目中...";
      case "processing":
        return "处理答案中...";
      case "complete":
        return "完成！";
      default:
        return "加载中...";
    }
  };

  const getStageIcon = () => {
    switch (stage) {
      case "loading":
        return <LoadingIndicator variant="spinner" size="md" />;
      case "processing":
        return <LoadingIndicator variant="dots" size="md" />;
      case "complete":
        return (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      default:
        return <LoadingIndicator variant="spinner" size="md" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      {getStageIcon()}
      <p className="text-sm text-muted-foreground">{getStageText()}</p>
      {progress > 0 && progress < 100 && (
        <ProgressIndicator
          progress={progress}
          className="w-48"
          showPercentage={false}
        />
      )}
    </div>
  );
};

// 页面级加载组件
interface PageLoadingProps {
  text?: string;
}

export const PageLoading = ({ text = "页面加载中..." }: PageLoadingProps) => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader className="h-6 w-6 text-muted-foreground animate-spin" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
};

// 按钮加载状态
interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const ButtonLoading = ({
  isLoading,
  children,
  loadingText,
  className,
  disabled,
  onClick,
}: ButtonLoadingProps) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors",
        "bg-blue-500 hover:bg-blue-600 text-white",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading && <LoadingIndicator variant="spinner" size="sm" />}
      {isLoading ? loadingText || "处理中..." : children}
    </button>
  );
};
