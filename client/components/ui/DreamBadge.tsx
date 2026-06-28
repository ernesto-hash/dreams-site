type Props = {
    type?: string | null;
  };
  
  export default function DreamBadge({ type }: Props) {
    const badgeMap: any = {
      life: "🎓 Life Dream",
      love: "❤️ Love Dream",
      wealth: "💰 Wealth Dream",
      spiritual: "🧘 Spiritual Dream",
    };
  
    return (
      <span className="text-xs text-neon-primary">
        {badgeMap[type || "life"]}
      </span>
    );
  }
  