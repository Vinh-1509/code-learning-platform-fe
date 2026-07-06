import { Trophy, Crown, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
// 💡 IMPORT kiểu dữ liệu gốc để kế thừa
import type { TargetUser } from '@/types/api/gacha.types';

// 💡 Tạo một kiểu dữ liệu chuẩn chỉnh đại diện cho học viên trên bục xếp hạng
interface PodiumEntry extends TargetUser {
  rank: number;
}

interface TopThreeCardProps {
  isLoading: boolean;
  // 💡 SỬA TẠI ĐÂY: Đổi any[] thành PodiumEntry[]
  topThree: PodiumEntry[];
  currentUserId: string;
}

export function TopThreeCard({
  isLoading,
  topThree,
  currentUserId,
}: TopThreeCardProps) {
  // Sắp xếp mảng để hiển thị theo thứ tự bục: [Top 2, Top 1, Top 3]
  // 💡 SỬA TẠI ĐÂY: Đổi kiểu dữ liệu tham số và giá trị trả về của hàm
  const getPodiumOrder = (items: PodiumEntry[]): PodiumEntry[] => {
    if (items.length === 0) return [];
    const podium = new Array<PodiumEntry>(items.length);
    if (items[0]) podium[items.length > 1 ? 1 : 0] = items[0]; // Top 1 ở giữa
    if (items[1]) podium[0] = items[1]; // Top 2 bên trái
    if (items[2]) podium[2] = items[2]; // Top 3 bên phải
    return podium.filter(Boolean);
  };

  // Một hệ màu duy nhất (primary) cho cả 3 hạng — tier phân biệt bằng
  // cường độ/kích thước, không bằng việc đổi hue (vàng/bạc/đồng).
  const podiumStyle = (rank: number) => {
    if (rank === 1) {
      return {
        cardBg: 'bg-primary/[0.06] border-primary/25',
        height: 'h-[180px]',
        badgeSize: 'size-14',
        badgeBg: 'bg-primary',
        badgeText: 'text-primary-foreground',
        badgeRing: 'ring-4 ring-primary/10',
        icon: Crown,
        iconSize: 24,
      };
    }
    if (rank === 2) {
      return {
        cardBg: 'bg-muted/40 border-border',
        height: 'h-[150px]',
        badgeSize: 'size-12',
        badgeBg: 'bg-primary/15',
        badgeText: 'text-primary',
        badgeRing: 'ring-2 ring-primary/10',
        icon: Medal,
        iconSize: 20,
      };
    }
    return {
      cardBg: 'bg-muted/30 border-border',
      height: 'h-[135px]',
      badgeSize: 'size-11',
      badgeBg: 'bg-primary/10',
      badgeText: 'text-primary/80',
      badgeRing: '',
      icon: Medal,
      iconSize: 18,
    };
  };

  const orderedTopThree = getPodiumOrder(topThree);

  return (
    <Card className="border-border/80 shadow-sm overflow-hidden flex flex-col justify-between">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Top Podium
          </CardTitle>
          <Trophy className="size-5 text-primary" />
        </div>
      </CardHeader>

      <CardContent className="p-6 flex items-end justify-center gap-3 sm:gap-4 min-h-[220px]">
        {isLoading ? (
          <div className="w-full flex items-end justify-center gap-4 h-[180px]">
            <div className="h-[140px] w-full animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-[180px] w-full animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-[120px] w-full animate-pulse rounded-2xl bg-muted/40" />
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
                  'w-full flex flex-col justify-between items-center rounded-2xl border p-3 pt-6 text-center relative',
                  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 fill-mode-both',
                  style.cardBg,
                  style.height,
                  entry.rank === 1 && 'z-10 scale-105',
                  isYou && 'ring-2 ring-primary'
                )}
                style={{
                  animationDelay: `${index * 90}ms`,
                  animationDuration: '450ms',
                }}
              >
                {isYou && (
                  <span className="absolute -top-2.5 bg-primary text-[9px] font-bold uppercase tracking-wider text-primary-foreground px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}

                <div
                  className={cn(
                    'absolute -top-5 flex shrink-0 items-center justify-center rounded-full',
                    style.badgeSize,
                    style.badgeBg,
                    style.badgeText,
                    style.badgeRing
                  )}
                >
                  <Icon size={style.iconSize} strokeWidth={2.25} />
                </div>

                <div className="w-full min-w-0 mt-4">
                  <p className="truncate text-xs font-bold text-foreground block">
                    {entry.name}
                  </p>
                  <p className="text-sm font-black tabular-nums tracking-tight text-foreground mt-1">
                    {Number(entry.coins).toLocaleString()}
                  </p>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Rank #{entry.rank}
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
