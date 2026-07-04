import React from 'react';
import { Medal, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
// 💡 IMPORT kiểu dữ liệu chuẩn từ file types của bạn để diệt tận gốc 'any'
import type { TargetUser } from '@/types/api/gacha.types';

interface FullLeaderboardCardProps {
  isLoading: boolean;
  // 💡 SỬA LỖI DÒNG 8: Thay any[] thành TargetUser[]
  visibleLeaderboard: TargetUser[];
  currentUserId: string;
  currentUserRowRef: React.RefObject<HTMLDivElement | null>;
}

export function FullLeaderboardCard({
  isLoading,
  visibleLeaderboard,
  currentUserId,
  currentUserRowRef,
}: FullLeaderboardCardProps) {
  // Cùng hệ badge với TopThreeCard: một màu primary, tier phân biệt bằng
  // cường độ nền, không đổi hue theo hạng.
  const rankBadge = (rank: number) => {
    if (rank === 1)
      return { bg: 'bg-primary', text: 'text-primary-foreground', icon: Crown };
    if (rank === 2)
      return { bg: 'bg-primary/15', text: 'text-primary', icon: Medal };
    if (rank === 3)
      return { bg: 'bg-primary/10', text: 'text-primary/80', icon: Medal };
    return { bg: 'bg-muted', text: 'text-muted-foreground', icon: null };
  };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Full leaderboard
          </CardTitle>
          <Medal className="size-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="divide-y divide-border/60">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 animate-pulse rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {visibleLeaderboard.map((entry) => {
              const isYou = entry._id === currentUserId;
              const badge = rankBadge(entry.rank);
              const Icon = badge.icon;

              return (
                <div
                  key={entry._id}
                  ref={isYou ? currentUserRowRef : undefined}
                  className={cn(
                    'flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40 scroll-mt-24',
                    isYou && 'bg-primary/5 ring-1 ring-primary/20'
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-black',
                        badge.bg,
                        badge.text
                      )}
                    >
                      {Icon ? (
                        <Icon size={16} strokeWidth={2.25} />
                      ) : (
                        entry.rank
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {entry.name}
                        </p>
                        {isYou && (
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                            You
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Rank #{entry.rank}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black tabular-nums text-foreground">
                      {/* 💡 SỬA LỖI CHỮ COINS: Number() bọc lại để bảo vệ hàm .toLocaleString() nếu cần */}
                      {Number(entry.coins).toLocaleString()}
                      <span className="ml-1 text-xs font-medium text-muted-foreground">
                        CS
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
