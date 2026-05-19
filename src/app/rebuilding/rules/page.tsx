import Link from "next/link";
import { isThoughtsUnlocked } from "@/lib/thoughtsAuth";
import { getRulesBlocks } from "@/lib/notion";
import PasswordGate from "@/components/rebuilding/PasswordGate";
import DayBlocks from "@/components/rebuilding/DayBlocks";
import "../rebuilding.css";

export const revalidate = 60;

export const metadata = {
  title: "rules — rebuilding in 50",
};

export default async function RulesPage() {
  const unlocked = await isThoughtsUnlocked();
  if (!unlocked) return <PasswordGate />;

  const blocks = await getRulesBlocks();

  return (
    <div className="rb-wrap">
      <header className="rb-header">
        <Link href="/rebuilding" className="rb-brand rb-brand-link">
          <span className="rb-arrow">←</span>rebuilding in 50
        </Link>
        <div className="rb-meta">rules</div>
      </header>

      <div className="rb-rules">
        {blocks.length > 0 ? (
          <DayBlocks blocks={blocks} />
        ) : (
          <p className="rb-block-empty">
            rules not found · check that the integration has access to the parent page
          </p>
        )}
      </div>
    </div>
  );
}
