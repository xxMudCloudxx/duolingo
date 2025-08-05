import { Button } from "@/components/ui/button";

const buttons = () => {
  return (
    <div className="flex flex-col max-w-[200px] p-4 space-y-4">
      <Button>Default</Button>
      <Button variant={"primary"}>Primary</Button>
      <Button variant={"primaryOutline"}>Primary Outline</Button>
      <Button variant={"secondary"}>Secondary </Button>
      <Button variant={"secondaryOutline"}>Secondary Outline</Button>
      <Button variant={"danger"}>danger</Button>
      <Button variant={"dangerOutline"}>danger Outline</Button>
      <Button variant={"super"}>super</Button>
      <Button variant={"superOutline"}>superOutline</Button>
      <Button variant={"superOutline"}>superOutline</Button>
      <Button variant={"ghost"}>ghost</Button>
      <Button variant={"sidebar"}>sidebar</Button>
      <Button variant={"sidebarOutline"}>siderbar Outline</Button>
    </div>
  );
};

export default buttons;
