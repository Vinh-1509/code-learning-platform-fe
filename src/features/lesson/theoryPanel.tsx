import type { Block } from '@/lib/axios';

interface TheoryPaneProps {
  block: Block | undefined;
}
export function TheoryPane({ block }: TheoryPaneProps) {
  console.log(block);
  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto min-w-0 p-6 border-r border-slate-200">
      <h1 className="text-2xl font-bold text-slate-900">For Loop</h1>
      <p className="text-sm text-slate-500 mt-1">
        Range, iteration, and index control
      </p>
      <div className="h-px bg-slate-200 my-4" />
      <div className="rounded-lg p-4 bg-blue-50/50 border-l-4 border-blue-600 mb-4 text-sm text-blue-700 font-medium">
        A for loop repeats code a fixed number of times over a sequence.
      </div>
      <div className="rounded-xl overflow-hidden bg-[#1b2130]">
        <div className="flex items-center px-4 h-8 justify-between bg-[#121726]">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-slate-500 font-mono">python</span>
        </div>
        <div className="p-4 font-mono text-sm text-slate-100 space-y-1">
          <div>
            <span className="text-pink-400">for</span>
            <span className="text-blue-300"> i </span>
            <span className="text-pink-400">in</span>
            <span> range(3):</span>
          </div>
          <div>
            <span>{'    print(i)'}</span>
            <span className="ml-8 text-slate-500"># → 0, 1, 2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
