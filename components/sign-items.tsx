// 这是一个辅助组件，用于统一每个步骤的布局和标题样式
export const Step = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center text-center gap-y-4 w-full max-w-sm mx-auto">
      <h1 className="font-bold text-3xl text-neutral-600">{title}</h1>
      <p className="text-base text-[#7E8CA0]">{description}</p>
      <div className="flex flex-col gap-y-4 w-full mt-4">{children}</div>
    </div>
  );
};

// 这是一个辅助组件，用于创建 "or" 分隔线
export const OrSeparator = () => {
  return (
    <div className="relative my-2">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-2 text-muted-foreground">Or</span>
      </div>
    </div>
  );
};
