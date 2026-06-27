interface TaskPaneProps {
  title: string;
  instruction: string;
}

export function TaskPane({ title, instruction }: TaskPaneProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="h-2 bg-primary" />
      <div className="px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          Task
        </p>
        <h1 className="text-xl font-semibold text-foreground tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-sm leading-7 text-muted-foreground whitespace-pre-line">
          {instruction}
        </p>
      </div>
    </div>
  );
}
