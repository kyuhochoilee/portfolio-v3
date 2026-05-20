import BottomBar from "@/components/rebuilding/BottomBar";
import "./rebuilding.css";

export default function RebuildingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BottomBar />
    </>
  );
}
