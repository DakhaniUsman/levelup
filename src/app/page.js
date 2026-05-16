import TodoBoard from "@/components/todo/TodoBoard";

export const metadata = {
  title: "Todo — LevelUp",
  description:
    "Track your daily tasks, build momentum, and level up your productivity one task at a time.",
  openGraph: {
    title: "Todo | LevelUp — Personal Growth System",
    description: "Track tasks, build streaks, and grow intentionally.",
  },
};

export default function TodoPage() {
  return <TodoBoard />;
}
