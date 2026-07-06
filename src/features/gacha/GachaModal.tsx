// features/gacha/components/GachaModal.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGacha } from './hooks/useGacha';
import confetti from 'canvas-confetti';
import {
  ChevronRight,
  Coins,
  Gem,
  Sparkles,
  Target,
  XIcon,
} from 'lucide-react';

import type { TargetUser } from '@/types/api/gacha.types';
import type { SubmitAnswerResponse } from '@/types/api/exercise.types';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  result: SubmitAnswerResponse | null;
  onUpdateBalance: (newCoins: number) => void;
}

export default function GachaModal({
  isOpen,
  onClose,
  userId,
  result,
  onUpdateBalance,
}: GachaModalProps) {
  const [stage, setStage] = useState<'WHEEL' | 'COIN_SUCCESS' | 'ATTACK_STAGE'>(
    'WHEEL'
  );
  const [spinDegree, setSpinDegree] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [explodingId, setExplodingId] = useState<string | null>(null);

  const { useTargetsQuery, attackMutation } = useGacha(userId);
  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } =
    useTargetsQuery(stage === 'ATTACK_STAGE');

  // 💡 KHÔI PHỤC HÀM QUAY BẰNG TAY: Đọc data từ result có sẵn để tính góc quay
  const handleStartSpin = () => {
    if (isSpinning || !result) return;
    setIsSpinning(true);

    // Tính toán góc quay (Quay ít nhất 5 vòng = 1800 độ để tạo hiệu ứng)
    let targetDegree = 1800;
    if (result.prizeType === 'coin') {
      targetDegree += 90; // Chỉ vào phân vùng Coin (Màu xanh mint)
    } else {
      targetDegree += 270; // Chỉ vào phân vùng Attack (Màu đỏ mint)
    }
    setSpinDegree(targetDegree);

    // Chờ bánh xe chạy hết hiệu ứng transition 3 giây rồi đổi stage kết quả
    setTimeout(() => {
      setIsSpinning(false);
      if (result.prizeType === 'coin') {
        onUpdateBalance(result.currentCoin);
        setStage('COIN_SUCCESS');
        void confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setStage('ATTACK_STAGE');
      }
    }, 3000);
  };

  const handleAttackClick = (targetId: string) => {
    setExplodingId(targetId);

    setTimeout(() => {
      attackMutation.mutate(targetId, {
        onSuccess: (data) => {
          onUpdateBalance(data.newCoins);
          handleCloseAll();
        },
        onError: () => {
          setExplodingId(null);
        },
      });
    }, 1100);
  };

  const handleCloseAll = () => {
    setStage('WHEEL');
    setSpinDegree(0);
    setIsSpinning(false);
    setExplodingId(null);
    onClose();
  };

  const isAttackStage = stage === 'ATTACK_STAGE';
  const isSuccessStage = stage === 'COIN_SUCCESS';
  const canCloseManually = isSuccessStage;

  const stageTitle = isAttackStage
    ? 'Choose a target'
    : isSuccessStage
      ? 'Reward claimed'
      : 'Lucky wheel';
  const stageDescription = isAttackStage
    ? 'Pick one student from the leaderboard to launch the attack and claim the reward.'
    : isSuccessStage
      ? 'The reward has been credited to your wallet. Claim it and continue.'
      : 'Finish an exercise to unlock a spin and earn a random reward.';

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleCloseAll();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          'sm:max-w-140 gap-0 overflow-hidden border-border/85 bg-card p-0 shadow-xl ring-1 ring-foreground/10',
          isAttackStage && 'bg-card',
          isSuccessStage && 'bg-card'
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative">
          <div
            className={cn(
              'absolute inset-x-0 top-0 h-1 opacity-90',
              isAttackStage
                ? 'bg-destructive/20'
                : isSuccessStage
                  ? 'bg-success/20'
                  : 'bg-primary/20'
            )}
          />

          <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 pb-4 pt-5 sm:px-6">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-xl border text-sm shadow-sm',
                    isAttackStage
                      ? 'border-destructive/15 bg-destructive/10 text-destructive'
                      : isSuccessStage
                        ? 'border-success/15 bg-success/10 text-success'
                        : 'border-primary/15 bg-primary/10 text-primary'
                  )}
                >
                  {isAttackStage ? (
                    <Target className="size-4" />
                  ) : isSuccessStage ? (
                    <Coins className="size-4" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                </span>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                    {stageTitle}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stageDescription}
                  </p>
                </div>
              </div>

              <DialogDescription className="sr-only">
                {stageDescription}
              </DialogDescription>
            </DialogHeader>

            {canCloseManually && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleCloseAll}
                className="-mt-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </div>

          <div className="px-5 py-5 sm:px-6">
            {stage === 'WHEEL' && (
              <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
                <div className="relative w-full pt-8">
                  <div className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 flex-col items-center">
                    <div className="rounded-full border border-border bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm">
                      Spin
                    </div>
                    <div className="-mt-1 text-xl text-muted-foreground drop-shadow">
                      ▼
                    </div>
                  </div>

                  <div className="mx-auto flex size-56 items-center justify-center overflow-hidden rounded-[1.75rem] border border-border/70 bg-muted/20 shadow-sm">
                    <div
                      className="relative flex size-52 items-center justify-center rounded-full border border-border/70 shadow-inner"
                      style={{
                        background:
                          'conic-gradient(var(--green-mint) 0deg 180deg, var(--red-mint) 180deg 360deg)',
                        transform: `rotate(${spinDegree}deg)`,
                        transition: isSpinning
                          ? 'transform 3s cubic-bezier(0.1, 0.8, 0.1, 1)'
                          : 'none',
                      }}
                    >
                      <div className="absolute left-6 top-8 rounded-2xl border border-border/60 bg-background/90 px-3 py-2 text-center text-xs font-black uppercase tracking-[0.16em] text-foreground shadow-sm backdrop-blur-sm">
                        💰
                        <br />
                        Coin
                      </div>
                      <div className="absolute bottom-8 right-6 rounded-2xl border border-border/60 bg-background/90 px-3 py-2 text-center text-xs font-black uppercase tracking-[0.16em] text-foreground shadow-sm backdrop-blur-sm">
                        💥
                        <br />
                        Attack
                      </div>

                      <div className="absolute inset-0 rounded-full ring-8 ring-white/20" />
                    </div>
                  </div>
                </div>

                {/* 💡 TRẢ LẠI BOX CHỜ Kèm Animation Đang quay khi click nút */}
                <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm w-full">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <Sparkles className="size-3.5" />
                    {isSpinning
                      ? 'Determining your fate...'
                      : 'Spin to earn rewards'}
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">
                    {isSpinning
                      ? 'The wheel is spinning, please wait...'
                      : 'Spin to earn Coins or unlock an attack slot.'}
                  </p>
                </div>

                {/* 💡 TRẢ LẠI NÚT BẤM CLICK TAY THẦN THÁNH */}
                <Button
                  type="button"
                  onClick={handleStartSpin}
                  disabled={isSpinning || !result}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSpinning ? 'Spinning...' : 'Start spinning'}
                  {!isSpinning && <ChevronRight className="size-4" />}
                </Button>
              </div>
            )}

            {stage === 'COIN_SUCCESS' && (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-success/10 text-success shadow-sm">
                  <Gem className="size-9" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-success/70">
                    Reward credited
                  </p>
                  <h3 className="text-4xl font-black tracking-tight text-foreground">
                    +{result?.amount} Coin
                  </h3>
                  <p className="mx-auto max-w-[34ch] text-sm text-muted-foreground">
                    The spin is complete. Claim your Coins and get back to
                    practice.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-left shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Coins className="size-4 text-success" />
                    Your wallet has been updated
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You can close this modal or return to the exercise.
                  </p>
                </div>

                <button
                  onClick={handleCloseAll}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.99]"
                >
                  Claim reward
                </button>
              </div>
            )}

            {stage === 'ATTACK_STAGE' && (
              <div className="space-y-4">
                <div className="max-h-80 overflow-y-auto rounded-2xl border border-border/70 bg-card shadow-sm scrollbar-none">
                  {isLoadingLeaderboard ? (
                    <p className="p-5 text-center text-sm text-muted-foreground animate-pulse">
                      Loading the leaderboard...
                    </p>
                  ) : leaderboard.length === 0 ? (
                    <p className="p-5 text-center text-sm text-muted-foreground">
                      No leaderboard data is available yet.
                    </p>
                  ) : (
                    leaderboard.map((user: TargetUser) => (
                      <div
                        key={user._id}
                        className={cn(
                          'relative flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 last:border-b-0 transition-colors hover:bg-muted/40',
                          user._id === userId && 'bg-muted/20',
                          explodingId === user._id &&
                            'animate-pulse bg-destructive/5'
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {user.name || user.username}
                              </p>
                              {user._id === userId && (
                                <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {user.coins} Coins
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={() => handleAttackClick(user._id)}
                          disabled={
                            attackMutation.isPending ||
                            explodingId !== null ||
                            user._id === userId
                          }
                          size="sm"
                          variant="destructive"
                          className="shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm"
                        >
                          Attack
                        </Button>

                        {explodingId === user._id && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-destructive/10 backdrop-blur-[1px] animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 rounded-full border border-destructive/30 bg-background px-3 py-1.5 shadow-md">
                              <Target className="size-4 animate-spin text-destructive" />
                              <span className="text-xs font-bold uppercase tracking-wider text-destructive">
                                Attacking...
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Choose one student from the board to steal 100 Coins.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
