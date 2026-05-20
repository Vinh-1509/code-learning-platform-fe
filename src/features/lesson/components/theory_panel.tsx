function CodeBlock() {
  return (
    <div className="rounded-[10px] overflow-hidden w-full bg-[#1b2130]">
      <div className="flex items-center px-3 h-[26px] justify-between bg-[#121726]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <span className="text-[10px] text-slate-500 font-mono">python</span>
      </div>
      <div className="px-4 py-3 font-mono text-[12px] leading-[20px] text-slate-100">
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
  );
}

export function TheoryPane() {
  return (
    <main className="flex-1 flex flex-col bg-white overflow-y-auto min-w-0">
      <div className="flex items-center h-11 px-5 flex-shrink-0 bg-blue-50/60 border-b border-slate-100">
        <span className="text-[13px] font-bold text-blue-600">Theory</span>
      </div>

      <div className="px-5 py-4 flex-1">
        <h1 className="text-[20px] font-bold text-slate-900">For Loop</h1>
        <p className="text-[12px] mt-1 text-slate-500">
          Range, iteration, and index control
        </p>
        <div className="h-px bg-slate-200 mt-4 mb-4" />

        <h2 className="text-[13px] font-semibold mb-3 text-slate-900">
          1. What is it?
        </h2>
        <div className="relative flex items-center rounded-lg px-3 py-2 mb-4 bg-blue-50/50 min-h-[38px] border-l-4 border-blue-600">
          <p className="text-[12px] leading-[18px] text-blue-600 font-medium">
            A for loop repeats code a fixed number of times over a sequence.
          </p>
        </div>
        <p className="text-[12px] leading-[20px] mb-6 text-slate-700">
          A for loop runs through each item in a range or list, executing the
          indented code block each time. Unlike a while loop, you don't manage a
          counter manually — Python handles it.
        </p>

        <h2 className="text-[13px] font-semibold mb-3 text-slate-900">
          2. Syntax
        </h2>
        <div className="mb-6">
          <CodeBlock />
        </div>

        <h2 className="text-[13px] font-semibold mb-3 text-slate-900">
          3. Code Flow
        </h2>
        <div className="flex flex-col gap-3 mb-6">
          {[
            { step: '1', label: 'range(3) generates', value: '0, 1, 2' },
            { step: '2', label: 'i takes each value', value: 'one at a time' },
            { step: '3', label: 'print(i) runs', value: 'for each i' },
          ].map(({ step, label, value }) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold bg-blue-50 text-blue-600">
                {step}
              </div>
              <span className="text-[12px] text-slate-800">
                <span className="font-medium">{label}</span>{' '}
                <span className="text-slate-500 font-mono">{value}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-lg p-4 mb-6 bg-slate-50 border border-slate-200">
          <p className="text-[11px] font-semibold mb-2 text-slate-800">
            Key Notes:
          </p>
          <ul className="space-y-1">
            {[
              'range(n) counts from 0 to n-1',
              'Indentation defines the loop body',
              'No manual counter needed',
            ].map((note) => (
              <li
                key={note}
                className="text-[11px] flex items-start gap-2 text-slate-600"
              >
                <span className="text-blue-600">•</span> {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
