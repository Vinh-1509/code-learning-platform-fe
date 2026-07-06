import { Trophy, Crown, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TargetUser } from '@/types/api/gacha.types';

interface PodiumEntry extends TargetUser {
  rank: number;
}

interface TopThreeCardProps {
  isLoading: boolean;
  topThree: PodiumEntry[];
  currentUserId: string;
}

export function TopThreeCard({
  isLoading,
  topThree,
  currentUserId,
}: TopThreeCardProps) {
  const getPodiumOrder = (items: PodiumEntry[]): PodiumEntry[] => {
    if (items.length === 0) return [];
    const podium = new Array<PodiumEntry>(items.length);
    if (items[0]) podium[items.length > 1 ? 1 : 0] = items[0]; // Top 1 ở giữa
    if (items[1]) podium[0] = items[1]; // Top 2 bên trái
    if (items[2]) podium[2] = items[2]; // Top 3 bên phải
    return podium.filter(Boolean);
  };

  const podiumStyle = (rank: number) => {
    if (rank === 1) {
      return {
        cardBg: 'bg-primary/[0.04] border-primary/20',
        padding: 'pt-8 pb-5', // Cao nhất
        badgeSize: 'size-12',
        badgeBg: 'bg-primary',
        badgeText: 'text-primary-foreground',
        icon: Crown,
        iconSize: 20,
      };
    }
    if (rank === 2) {
      return {
        cardBg: 'bg-muted/30 border-border/70',
        padding: 'pt-6 pb-4 md:mt-4', // Thấp hơn, đẩy xuống một chút
        badgeSize: 'size-10',
        badgeBg: 'bg-muted-foreground/10',
        badgeText: 'text-muted-foreground',
        icon: Medal,
        iconSize: 18,
      };
    }
    return {
      cardBg: 'bg-muted/20 border-border/50',
      padding: 'pt-6 pb-4 md:mt-7', // Thấp nhất
      badgeSize: 'size-9',
      badgeBg: 'bg-muted-foreground/5',
      badgeText: 'text-muted-foreground/80',
      icon: Medal,
      iconSize: 16,
    };
  };

  const orderedTopThree = getPodiumOrder(topThree);

  return (
    <Card className="border-border/80 shadow-sm overflow-hidden flex flex-col justify-between">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Top Rankings
          </CardTitle>
          <Trophy
            className="size-5 text-primary animate-bounce"
            style={{ animationDuration: '3s' }}
          />
        </div>
      </CardHeader>

      <CardContent className="p-6 flex items-end justify-center gap-3 sm:gap-4 min-h-[220px] bg-gradient-to-b from-transparent to-muted/10">
        {isLoading ? (
          <div className="w-full flex items-end justify-center gap-4 h-[160px]">
            <div className="h-[120px] w-full animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-[160px] w-full animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-[100px] w-full animate-pulse rounded-2xl bg-muted/40" />
          </div>
        ) : topThree.length > 0 ? (
          orderedTopThree.map((entry, index) => {
            const style = podiumStyle(entry.rank);
            const Icon = style.icon;
            const isYou = entry._id === currentUserId;

            return (
              <div
                key={entry._id}
                className={cn(
                  'flex-1 flex flex-col justify-between items-center rounded-2xl border text-center relative transition-all duration-300 px-2 sm:px-3',
                  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 fill-mode-both',
                  style.cardBg,
                  style.padding,
                  entry.rank === 1 && 'z-10 shadow-md',

                  // 🔥 FIX GLOW CHO "YOU": Dùng shadow thay vì ring, tạo viền mềm mại, không lỗi đè layout
                  isYou &&
                    'border-primary/50 bg-primary/[0.08] shadow-[0_0_15px_rgba(var(--primary),0.15)] shadow-primary/20 scale-[1.02]'
                )}
                style={{
                  animationDelay: `${index * 80}ms`,
                  animationDuration: '400ms',
                }}
              >
                {/* Badge Icon Xếp Hạng */}
                <div
                  className={cn(
                    'absolute -top-5 z-20 flex shrink-0 items-center justify-center rounded-full transition-all',
                    // Nếu là bạn, đổi viền bao quanh icon thành màu primary để nhấn mạnh
                    isYou
                      ? 'ring-4 ring-primary bg-primary text-primary-foreground'
                      : 'ring-4 ring-background',
                    style.badgeSize,
                    isYou ? '' : style.badgeBg,
                    isYou ? '' : style.badgeText
                  )}
                >
                  <Icon size={style.iconSize} strokeWidth={2.5} />
                </div>

                {/* Phần Content: Tự động co giãn space-y cực thoáng */}
                <div className="w-full min-w-0 flex flex-col gap-1 items-center">
                  <p
                    className={cn(
                      'truncate text-xs font-semibold block w-full tracking-tight',
                      isYou ? 'text-primary font-bold' : 'text-muted-foreground'
                    )}
                  >
                    {isYou ? 'You' : entry.name}
                  </p>

                  <p
                    className={cn(
                      'text-sm font-black tabular-nums tracking-tight text-foreground',
                      entry.rank === 1 && 'text-base sm:text-lg text-primary'
                    )}
                  >
                    {Number(entry.coins).toLocaleString()}
                  </p>
                </div>

                {/* Thứ hạng nhỏ gọn tinh tế ở đáy */}
                <span
                  className={cn(
                    'text-[9px] uppercase font-bold tracking-widest mt-3 block opacity-70',
                    isYou ? 'text-primary' : 'text-muted-foreground/60'
                  )}
                >
                  #Rank {entry.rank}
                </span>
              </div>
            );
          })
        ) : (
          <div className="w-full text-center py-8 text-sm text-muted-foreground">
            No data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
