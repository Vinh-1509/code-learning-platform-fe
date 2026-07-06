import { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppSidebar } from '@/components/sidebar/Sidebar';
import Navbar from '@/components/navbar/Navbar';
import { useAuth } from '@/features/auth/useAuth';
import { fetchLeaderboard } from '@/features/leaderboard/api/leaderboard.api';
import { queryKeys } from '@/lib/queryKeys';

// Import sub-components sạch sẽ
import { LeaderboardHero } from './LeaderboardHero';
import { UserPositionCard } from './UserPositionCard';
import { TopThreeCard } from './TopThreeCard';
import { FullLeaderboardCard } from './FullLeaderboardCard';

import { useDashboardData } from '../dashboard/useDashboard';
import { useGacha } from '@/features/gacha/hooks/useGacha';

import { useTour } from '@/components/tour/TourProvider';
// 💡 Import thêm type chuẩn để ép kiểu dữ liệu an toàn
import type { TargetUser } from '@/types/api/gacha.types';

// Định nghĩa interface mở rộng có chứa rank cho các sub-component húp data không bị lỗi
interface LeaderboardUser extends TargetUser {
  rank: number;
}

export function LeaderboardPage() {
  const { user } = useAuth();
  const { wantRun, stepIndex } = useTour();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'practice' | 'leaderboard'
  >('leaderboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentUserRowRef = useRef<HTMLDivElement | null>(null);

  // Kích hoạt short polling thông báo ngầm khi đang ở trang BXH
  useGacha(user?._id);

  // 1. Fetch dữ liệu bảng xếp hạng chính thức (API mới tự map rank và name nội bộ)
  const { data: leaderboard = [], isLoading: isLeaderboardLoading } = useQuery<
    TargetUser[]
  >({
    queryKey: queryKeys.leaderboard.list(),
    queryFn: fetchLeaderboard,
    staleTime: 5_000,
    refetchInterval: 15000,
  });

  // 2. Fetch dữ liệu tiến độ bài học cho Sidebar
  const { dashboardData, loading: statsLoading } = useDashboardData();
  const totalLessons = dashboardData?.stats.totalLessons ?? 0;
  const completedLessons = dashboardData?.stats.totalLearnedLessons ?? 0;
  const isPageLoading = statsLoading;

  // Xử lý mảng dữ liệu hiển thị (Ép sang kiểu LeaderboardUser có trường rank ổn định)
  const formattedLeaderboard = leaderboard as LeaderboardUser[];

  const topThree = formattedLeaderboard.slice(0, 3);
  const topTen = formattedLeaderboard.slice(0, 10);

  // 💡 Ép kiểu Number phòng hờ lỗi cộng chuỗi bậy bạ từ Database
  const totalCoins = formattedLeaderboard.reduce(
    (sum, entry) => sum + Number(entry.coins || 0),
    0
  );

  // 💡 TỐI ƯU LOGIC TÌM KIẾM BẢN THÂN: Tìm theo ID thật trước, fallback về mock, nếu không có mới tạo object ảo chứa chính info của user
  const currentUser = useMemo<LeaderboardUser | null>(() => {
    return (
      formattedLeaderboard.find((entry) => entry._id === user?._id) ??
      formattedLeaderboard.find((entry) => entry._id === 'my_user_id') ??
      (user
        ? {
            _id: user._id,
            name: 'You',
            coins: user.coins ?? 0,
            rank: formattedLeaderboard.length + 1,
          }
        : null)
    );
  }, [formattedLeaderboard, user]);

  const currentUserId = currentUser?._id ?? 'my_user_id';

  // Gom danh sách hiển thị: Nếu bạn nằm ngoài top 10, đính kèm bạn vào cuối danh sách
  const rawVisibleList =
    currentUser && !topTen.some((entry) => entry._id === currentUser._id)
      ? [...topTen, currentUser]
      : topTen;

  const visibleLeaderboard = [...rawVisibleList].sort(
    (a, b) => b.coins - a.coins
  );

  const isTourGuidingHere = wantRun && stepIndex === 7;

  // Tự động cuốn view tới vị trí dòng của mình
  useEffect(() => {
    if (isTourGuidingHere) return;
    if (!isLeaderboardLoading && currentUserRowRef.current) {
      currentUserRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isLeaderboardLoading, currentUser, isTourGuidingHere]);

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <AppSidebar
        activeTab={activeTab}
        onTabChange={(tab: 'dashboard' | 'practice' | 'leaderboard') => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        completedLessons={isPageLoading ? undefined : completedLessons}
        totalLessons={isPageLoading ? undefined : totalLessons}
      />

      <main className="ml-0 md:ml-64 pt-14 h-screen overflow-y-auto">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 p-4 sm:p-8">
          <LeaderboardHero
            totalStudents={leaderboard.length}
            totalCoins={totalCoins}
          />

          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <UserPositionCard
              isLoading={isLeaderboardLoading}
              currentUser={currentUser}
            />
            <TopThreeCard
              isLoading={isLeaderboardLoading}
              topThree={topThree}
              currentUserId={currentUserId}
            />
          </section>

          <FullLeaderboardCard
            isLoading={isLeaderboardLoading}
            visibleLeaderboard={visibleLeaderboard}
            currentUserId={currentUserId}
            currentUserRowRef={currentUserRowRef}
          />
        </div>
      </main>
    </div>
  );
}
