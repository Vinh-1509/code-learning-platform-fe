import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// 💡 IMPORT kiểu dữ liệu gốc để cấu trúc lại type an toàn
import type { TargetUser } from '@/types/api/gacha.types';

// Định nghĩa kiểu dữ liệu có chứa thêm rank cho học viên hiện tại
interface LeaderboardUser extends TargetUser {
  rank: number;
}

interface UserPositionCardProps {
  isLoading: boolean;
  // 💡 SỬA TẠI ĐÂY: Thay any bằng kiểu dữ liệu tường minh (hoặc cho phép null nếu chưa loaded)
  currentUser: LeaderboardUser | null;
}

export function UserPositionCard({
  isLoading,
  currentUser,
}: UserPositionCardProps) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Your position
          </CardTitle>
          <Target className="size-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {isLoading ? (
          <div className="space-y-2.5">
            <div className="h-10 animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
          </div>
        ) : currentUser ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Current rank
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-black tabular-nums tracking-tight text-foreground">
                  #{currentUser.rank}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentUser.name}
                </p>
              </div>
              <div className="rounded-2xl bg-primary/[0.06] border border-primary/15 px-3 py-1.5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  CS-points
                </p>
                <p className="text-lg font-black tabular-nums tracking-tight text-primary">
                  {/* 💡 SỬA LỖI .coins: Ép kiểu Number an toàn trước khi gọi hàm format */}
                  {Number(currentUser.coins).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            Your position will appear here once the leaderboard loads.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
